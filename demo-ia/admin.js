// Painel comercial Synlogic: endpoints isolados; nunca disponibilizar listagem sem login.
const JSON_HEADERS = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const COOKIE='__Host-synlogic_admin';
const STATES=['novo','contatado','qualificado','encerrado'];
const enc=new TextEncoder();
const b64=(bytes)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=(s)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));
const fromStr=(s)=>enc.encode(s);
async function sha(bytes){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))}
async function hmac(secret){return crypto.subtle.importKey('raw',fromStr(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function constantCompare(a,b){
 const [x,y]=await Promise.all([sha(fromStr(a)),sha(fromStr(b))]);
 return crypto.subtle.timingSafeEqual?crypto.subtle.timingSafeEqual(x,y):x.reduce((v,n,i)=>v|(n^y[i]),0)===0;
}
const getCookie=(request,name)=>{
 const val=request.headers.get('cookie')||'';
 const match=val.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
 return match?match.slice(name.length+1):'';
};
async function makeSession(env){
 const expiry=Math.floor(Date.now()/1000)+8*3600;
 const value='admin.'+expiry;
 const key=await hmac(env.ADMIN_SESSION_SECRET);
 const sig=await crypto.subtle.sign('HMAC',key,fromStr(value));
 return value+'.'+b64(new Uint8Array(sig));
}
async function isAdmin(request,env){
 const cookie=getCookie(request,COOKIE);
 const values=cookie.split('.');
 if(values.length!==3||values[0]!=='admin'||! /^\d{10}$/.test(values[1])||Number(values[1])<Date.now()/1000)return false;
 try{
  const key=await hmac(env.ADMIN_SESSION_SECRET);
  return await crypto.subtle.verify('HMAC',key,unb64(values[2]),fromStr(values[0]+'.'+values[1]));
 }catch{return false}
}
const authConfigured=env=>!!(env.LEADS_DB && typeof env.ADMIN_PASSWORD==='string' && env.ADMIN_PASSWORD.length>=16 && typeof env.ADMIN_SESSION_SECRET==='string' && env.ADMIN_SESSION_SECRET.length>=32);
const sourceAllowed=request=>{
 const origin=request.headers.get('origin');
 if(!origin)return true;
 try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
};
const textValue=(x,max=120)=>typeof x==='string'?x.trim().slice(0,max):'';
async function attemptKey(request,env){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';
 const salt=env.ADMIN_SESSION_SECRET;
 const hash=await sha(fromStr(salt+'|'+ip));
 return [...hash].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function login(request,env){
 let body;try{body=await request.json()}catch{return respond({error:'Solicitação inválida.'},400)}
 const key=await attemptKey(request,env),now=Math.floor(Date.now()/1000);
 try{
  await env.LEADS_DB.prepare(
   'INSERT INTO synlogic_admin_login_attempts(chave,tentativas,inicio_janela) VALUES(?,1,?) ON CONFLICT(chave) DO UPDATE SET tentativas=CASE WHEN ?-inicio_janela>=900 THEN 1 ELSE tentativas+1 END,inicio_janela=CASE WHEN ?-inicio_janela>=900 THEN ? ELSE inicio_janela END'
  ).bind(key,now,now,now,now).run();
  const row=await env.LEADS_DB.prepare('SELECT tentativas FROM synlogic_admin_login_attempts WHERE chave=?').bind(key).first();
  if(Number(row?.tentativas||0)>6)return respond({error:'Muitas tentativas. Tente novamente após 15 minutos.'},429);
  if(typeof body?.password!=='string'||body.password.length>256||!await constantCompare(body.password,env.ADMIN_PASSWORD))
   return respond({error:'Senha incorreta.'},401);
  await env.LEADS_DB.prepare('DELETE FROM synlogic_admin_login_attempts WHERE chave=?').bind(key).run();
  const session=await makeSession(env);
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{...JSON_HEADERS,'set-cookie':COOKIE+'='+session+'; Path=/; Max-Age=28800; Secure; HttpOnly; SameSite=Strict'}});
 }catch{
  return respond({error:'O controle de acesso ainda não está configurado. Verifique a migração de segurança no D1.'},503);
 }
}
const publicLead=(r)=>({
 id:r.id,nome:r.nome,empresa:r.empresa,segmento:r.segmento,segmento_outro:r.segmento_outro,
 whatsapp:r.whatsapp,whatsapp_normalizado:r.whatsapp_normalizado,
 interesses:parseJson(r.interesses_json),desafio_descrito:r.desafio_descrito,
 consentido_em:r.consentido_em,criado_em:r.criado_em,atualizado_em:r.atualizado_em,status:r.status
});
function parseJson(t){try{return JSON.parse(t)||[]}catch{return []}}
function filters(url){
 const query=textValue(url.searchParams.get('q'),80);
 const status=textValue(url.searchParams.get('status'),24);
 const seg=textValue(url.searchParams.get('segmento'),32);
 return {query,status:STATES.includes(status)?status:'',seg:['salao','clinica','barbearia','outro'].includes(seg)?seg:''};
}
async function findLeads(url,env){
 const {query,status,seg}=filters(url);
 const page=Math.min(1000,Math.max(1,Number.parseInt(url.searchParams.get('page')||'1',10)||1));
 const limit=25, offset=(page-1)*limit;
 const where=['consentimento=1'],params=[];
 if(query){where.push('(nome LIKE ? OR empresa LIKE ? OR whatsapp_normalizado LIKE ? OR segmento_outro LIKE ?)');for(let i=0;i<4;i++)params.push('%'+query+'%')}
 if(status){where.push('status=?');params.push(status)}
 if(seg){where.push('segmento=?');params.push(seg)}
 const wc=where.join(' AND ');
 const total=await env.LEADS_DB.prepare('SELECT COUNT(*) AS count FROM synlogic_leads WHERE '+wc).bind(...params).first();
 const rows=await env.LEADS_DB.prepare('SELECT id,nome,empresa,segmento,segmento_outro,whatsapp,whatsapp_normalizado,interesses_json,desafio_descrito,consentido_em,criado_em,atualizado_em,status FROM synlogic_leads WHERE '+wc+' ORDER BY criado_em DESC LIMIT ? OFFSET ?').bind(...params,limit,offset).all();
 return respond({total:Number(total?.count||0),page,pageSize:limit,leads:(rows.results||[]).map(publicLead)});
}
async function stats(env){
 const today=Date.now();
 const isoDays=n=>new Date(today-n*86400000).toISOString();
 const totals=await env.LEADS_DB.prepare(
  'SELECT COUNT(*) AS total, SUM(CASE WHEN criado_em>=? THEN 1 ELSE 0 END) AS novos7d, SUM(CASE WHEN criado_em>=? THEN 1 ELSE 0 END) AS novos30d, SUM(CASE WHEN status=? THEN 1 ELSE 0 END) AS aguardando FROM synlogic_leads WHERE consentimento=1'
 ).bind(isoDays(7),isoDays(30),'novo').first();
 const [seg,states,trend]=await Promise.all([
  env.LEADS_DB.prepare('SELECT segmento,segmento_outro,COUNT(*) AS count FROM synlogic_leads WHERE consentimento=1 GROUP BY segmento,segmento_outro ORDER BY count DESC LIMIT 30').all(),
  env.LEADS_DB.prepare('SELECT status,COUNT(*) AS count FROM synlogic_leads WHERE consentimento=1 GROUP BY status').all(),
  env.LEADS_DB.prepare("SELECT SUBSTR(criado_em,1,10) AS dia,COUNT(*) AS count FROM synlogic_leads WHERE consentimento=1 AND criado_em>=? GROUP BY SUBSTR(criado_em,1,10) ORDER BY dia ASC").bind(isoDays(14)).all()
 ]);
 return respond({total:Number(totals?.total||0),novos7d:Number(totals?.novos7d||0),novos30d:Number(totals?.novos30d||0),aguardando:Number(totals?.aguardando||0),segmentos:seg.results||[],status:states.results||[],historico:trend.results||[]});
}
async function changeStatus(request,env){
 let body;try{body=await request.json()}catch{return respond({error:'Solicitação inválida.'},400)}
 if(!body||typeof body.id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.id)||!STATES.includes(body.status))return respond({error:'Status inválido.'},400);
 const result=await env.LEADS_DB.prepare('UPDATE synlogic_leads SET status=?,atualizado_em=? WHERE id=? AND consentimento=1').bind(body.status,new Date().toISOString(),body.id).run();
 if((result.meta?.changes||0)<1)return respond({error:'Contato não encontrado.'},404);
 return respond({ok:true});
}
const csvSafe=v=>{
 let s=String(v??'').replace(/[\r\n]+/g,' ').slice(0,1500);
 if(/^\s*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
};
async function exportCsv(env){
 const rows=await env.LEADS_DB.prepare('SELECT nome,empresa,segmento,segmento_outro,whatsapp,interesses_json,desafio_descrito,status,criado_em,consentido_em FROM synlogic_leads WHERE consentimento=1 ORDER BY criado_em DESC LIMIT 10000').all();
 const header=['Nome','Empresa','Segmento','Segmento informado','WhatsApp','Interesses','Dificuldade','Status','Criado em','Consentido em'];
 const lines=[header.join(';')];
 for(const r of rows.results||[])lines.push([r.nome,r.empresa,r.segmento,r.segmento_outro,r.whatsapp,parseJson(r.interesses_json).join(' | '),r.desafio_descrito,r.status,r.criado_em,r.consentido_em].map(csvSafe).join(';'));
 return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'content-type':'text/csv; charset=utf-8','cache-control':'no-store','content-disposition':'attachment; filename="synlogic-leads.csv"','x-content-type-options':'nosniff'}});
}
export async function adminRoute(request,env,url){
 if(!url.pathname.startsWith('/api/admin/'))return null;
 if(!authConfigured(env))return respond({error:'Painel indisponível. Configure os segredos ADMIN_PASSWORD e ADMIN_SESSION_SECRET e o banco D1.'},503);
 if(!sourceAllowed(request))return respond({error:'Origem não autorizada.'},403);
 const p=url.pathname,m=request.method;
 if(p==='/api/admin/login'&&m==='POST')return login(request,env);
 if(p==='/api/admin/logout'&&m==='POST')return new Response(JSON.stringify({ok:true}),{headers:{...JSON_HEADERS,'set-cookie':COOKIE+'=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict'}});
 if(!await isAdmin(request,env))return respond({error:'Faça login para visualizar informações comerciais.'},401);
 try{
  if(p==='/api/admin/me'&&m==='GET')return respond({ok:true});
  if(p==='/api/admin/leads'&&m==='GET')return findLeads(url,env);
  if(p==='/api/admin/stats'&&m==='GET')return stats(env);
  if(p==='/api/admin/status'&&m==='POST')return changeStatus(request,env);
  if(p==='/api/admin/export'&&m==='GET')return exportCsv(env);
  return respond({error:'Operação não disponível.'},404);
 }catch(e){console.error('Synlogic admin error:',e?.name||'error');return respond({error:'Não foi possível carregar os dados do painel.'},503)}
}
