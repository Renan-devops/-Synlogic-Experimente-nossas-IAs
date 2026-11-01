/* Demonstrações guiadas por segmento, sem agendamento ou cobrança real. */
const otherState={stage:'service',service:'',detail:'',extra:'',specialty:'',patient:'',day:'',time:'',price:0};
const priorStart=startChat;
function resetAllDemos(){
  Object.assign(otherState,{stage:'service',service:'',detail:'',extra:'',specialty:'',patient:'',day:'',time:'',price:0});
  Object.assign(barber,{stage:'service',service:'',hairStyle:'',beardStyle:'',day:'',time:''});
  Object.assign(conversation,{name:'',service:'',date:'',period:'',professional:'',stage:'opening',lastIntent:'',lastAnswer:'',history:[],greeted:false});
  Object.assign(demoState,{stage:0,service:'',period:'',finished:false});
  $('chatText').disabled=false;$('chatText').placeholder='Digite sua mensagem...';
  $('chatForm').querySelector('button').disabled=false;
}
startChat=function(){resetAllDemos();priorStart()};
// O botão da primeira versão guarda referência direta à função original.
// Reiniciamos o estado na fase de captura antes do listener original ser executado.
$('startDemo').addEventListener('click',resetAllDemos,true);
const previousReply=contextualReply;
const dayRe=/\b(hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|\d{1,2}\/\d{1,2}|dia \d{1,2})\b/;
const timeRe=/\b([01]?\d|2[0-3])(?::[0-5]\d|h(?:[0-5]\d)?)\b/;
const priceFormat=n=>`R$ ${n},00`;
const servicePrices={corte:70,escova:55,hidratacao:65,coloracao:140,manicure:35,pedicure:40,sobrancelha:30,cilios:90,progressiva:180,penteado:80};
function otherSummary(kind){otherState.stage='showcase';const s=otherState;const salon=kind==='salao';return `Perfeito! ${salon?'💇‍♀️':'📋'} Aqui está o resumo da sua solicitação:\n• ${salon?'Serviço':'Atendimento'}: ${s.service}${s.specialty?' — '+s.specialty:''}\n• ${salon?'Preferência':'Perfil'}: ${salon?s.detail:s.patient}${s.extra?'\n• Serviço adicional: '+s.extra:''}\n• Valor de exemplo: ${priceFormat(s.price)} (ilustrativo)\n• Dia e horário desejados: ${s.day}, às ${s.time}\n\nTudo organizado! Em uma versão conectada, eu consultaria a agenda antes de confirmar qualquer horário.\n\nAlém deste atendimento, a Synlogic pode configurar uma assistente para:\n✅ Responder dúvidas e apresentar serviços 24 horas por dia;\n✅ Consultar a agenda e confirmar reservas;\n✅ Enviar lembretes automáticos pelo WhatsApp;\n✅ Auxiliar em reagendamentos e cancelamentos;\n✅ Encaminhar casos especiais à equipe.\n\nEssas funções dependem das integrações configuradas. Quer que eu explique alguma delas?`}
function showcaseReply(t,kind){
  const name=kind==='salao'?'salão':'recepção';
  if(/\b(lembrete|aviso|notificacao|whatsapp)\b|^1$/.test(t))return 'Os lembretes podem chegar ao WhatsApp antes do atendimento, com data, horário e instruções cadastradas pela empresa. A antecedência é configurável. Quer conhecer os reagendamentos?';
  if(/\b(reagend|remarc|cancel)\w*\b|^2$/.test(t))return 'A assistente pode identificar a reserva, consultar novas opções e pedir confirmação antes de alterar a agenda. Assim, a equipe do '+name+' mantém os horários organizados. Quer conhecer o atendimento fora do expediente?';
  if(/\b(24 horas|atendimento|duvida|servico|informac)\w*\b|^3$/.test(t))return 'Fora do expediente, a assistente pode explicar serviços, valores cadastrados, localização e funcionamento. Quando o assunto exigir atenção humana, pode encaminhar a conversa à equipe. Quer saber sobre a agenda?';
  if(/\b(agenda|vaga|disponibilidade|integracao)\b|^4$/.test(t))return 'Com a agenda conectada, ela consulta os horários realmente livres, evita confirmações sem verificação e registra a escolha após a aprovação do cliente. Aqui usamos apenas um cenário demonstrativo.';
  if(/\b(humano|equipe|transferir|pessoa)\b|^5$/.test(t))return 'Se o cliente precisar de uma pessoa, o atendimento pode ser transferido à equipe com o contexto da conversa. Isso evita repetir todas as informações.';
  if(/\b(sim|claro|quero|funcionalidade|explica)\b/.test(t))return 'Claro! Escolha o que quer explorar: 1) lembretes, 2) reagendamentos, 3) atendimento 24 horas, 4) agenda integrada ou 5) encaminhamento para equipe.';
  if(/\b(mudar|trocar|alterar)\b/.test(t)){otherState.stage='day';return 'Podemos ajustar o dia. Qual nova data você prefere?'}
  return 'Posso explicar mais sobre lembretes, agendamento, atendimento 24 horas, cancelamentos ou transferência para a equipe. Qual dessas funções chama mais sua atenção?';
}
function salonReply(raw,t){
  const s=otherState;
  if(s.stage==='showcase')return showcaseReply(t,'salao');
  if(s.stage==='service'){
    const entries=[['manicure',/\b(manicure|unha|unhas|mao)\b/],['pedicure',/\b(pedicure|pe|pes)\b/],['corte',/\b(corte|cortar|franja)\b/],['escova',/\b(escova|escovar)\b/],['hidratacao',/\b(hidratacao|hidratar)\b/],['coloracao',/\b(coloracao|pintar|tintura|luzes|mechas)\b/],['sobrancelha',/\b(sobrancelha|design)\b/],['cilios',/\b(cilios|extensao)\b/],['progressiva',/\b(progressiva|alisamento)\b/],['penteado',/\b(penteado|coque)\b/]];
    const found=entries.find(e=>e[1].test(t));if(!found)return 'Com prazer! 💙 Você procura um serviço de cabelo, unhas, sobrancelhas ou cílios? Pode me dizer o procedimento que deseja.';
    s.service=found[0];s.price=servicePrices[s.service];s.stage='detail';
    return s.service==='corte'?'Ótimo! Para o cabelo, você pensa em corte de pontas, camadas, long bob ou outro estilo?':s.service==='coloracao'?'Adorei! Você procura coloração completa, retoque de raiz, luzes ou mechas?':s.service==='manicure'||s.service==='pedicure'?'Perfeito! Você prefere esmaltação tradicional, francesinha ou decoração?':'Que ótimo! Tem alguma preferência de estilo, acabamento ou resultado que você gostaria de alcançar?';
  }
  if(s.stage==='detail'){
    if(t.length<2)return 'Pode me contar qual estilo ou acabamento você prefere?';
    s.detail=raw.trim();s.stage='extra';return `Anotei ${s.service} com preferência por ${s.detail}. ✨ Gostaria de adicionar outro serviço ao atendimento ou seguimos só com esse?`;
  }
  if(s.stage==='extra'){
    const more=Object.keys(servicePrices).find(x=>t.includes(x)&&x!==s.service);
    if(more){s.extra=more;s.price+=servicePrices[more]}
    s.stage='day';return `Combinado! ${s.extra?'Incluí '+s.extra+'. ':''}O valor ilustrativo ${s.extra?'dos serviços':'do serviço'} fica em ${priceFormat(s.price)}. Para qual dia você gostaria de agendar?`;
  }
  if(s.stage==='day'){
    const day=t.match(dayRe);if(!day)return 'Qual dia você prefere? Por exemplo, terça, sexta ou uma data específica.';
    s.day=day[1];s.stage='time';return `Perfeito, ${s.day}! Qual horário seria melhor? Pode dizer, por exemplo, 9h ou 15h30.`;
  }
  if(s.stage==='time'){
    const hour=t.match(timeRe);if(!hour)return 'Você prefere qual horário exato? Por exemplo, 10h, 14h ou 16h30.';
    s.time=hour[0];return otherSummary('salao');
  }
  return 'Posso te ajudar a continuar o atendimento. Qual serviço você deseja?';
}
function receptionReply(raw,t){
  const s=otherState;
  if(s.stage==='showcase')return showcaseReply(t,'recepcao');
  if((s.stage==='service'||s.stage==='info')&&/\b(explique|explicar|qual|quais|diferenca|lista|conhecer|informac|servicos|oferecem|funciona)\w*\b/.test(t)&&!/\b(quero (uma )?consulta|marcar|agendar)\b/.test(t)){
    s.stage='info';
    if(/\b(consulta)\b/.test(t)&&/\b(retorno|avaliacao)\b/.test(t))return 'Boa pergunta! 😊 A consulta é o atendimento com o profissional; a avaliação inicial busca entender a necessidade e os próximos passos; e o retorno acompanha um atendimento anterior. Os detalhes dependem da clínica. Quer simular consulta, avaliação ou retorno?';
    if(/\b(retorno)\b/.test(t))return 'O retorno é um novo atendimento de acompanhamento após uma consulta anterior. As condições e eventuais valores dependem das regras da clínica. Você quer solicitar um retorno ou saber sobre outra opção?';
    if(/\b(avaliacao)\b/.test(t))return 'A avaliação inicial serve para conhecer a necessidade do paciente e orientar os próximos passos. O conteúdo depende da especialidade. Você gostaria de simular uma avaliação ou saber sobre consultas?';
    if(/\b(consulta)\b/.test(t))return 'A consulta é um atendimento com um profissional de determinada especialidade. Na simulação, você escolhe a área, informa se já é paciente e indica dia e horário. Gostaria de começar?';
    return 'Claro! 😊 Nesta recepção demonstrativa, posso te orientar sobre:\n\n• Consulta: atendimento com profissional de uma especialidade;\n• Avaliação inicial: primeiro contato para entender a necessidade;\n• Retorno: acompanhamento de um atendimento anterior.\n\nPodemos simular áreas como odontologia, dermatologia, estética e clínica geral. O catálogo real depende de cada clínica. Sobre qual opção você quer saber mais?';
  }
  if(s.stage==='info'){
    if(/\b(odontologia|dentista|dermatologia|estetica|clinica geral)\b/.test(t))return 'Essa área pode ser configurada na recepção conforme os profissionais disponíveis. Nesta demonstração, posso simular uma consulta, avaliação ou retorno nessa especialidade. Qual das três opções você prefere?';
    s.stage='service';
  }
  if(s.stage==='service'){
    if(/\b(retorno|voltar)\b/.test(t)){s.service='retorno';s.price=80}
    else if(/\b(avaliacao|avaliar|primeira avaliacao)\b/.test(t)){s.service='avaliação';s.price=100}
    else if(/\b(consulta|consultar|agendar|marcar|horario)\b/.test(t)){s.service='consulta';s.price=150}
    else return 'Será um prazer ajudar! 😊 Você procura uma consulta, uma avaliação inicial ou um retorno?';
    s.stage='specialty';return `Entendi, vamos organizar ${s.service==='avaliação'?'uma avaliação':'um atendimento de '+s.service}. Em qual especialidade ou área você gostaria de ser atendido? Por exemplo, odontologia, dermatologia, estética ou clínica geral.`;
  }
  if(s.stage==='specialty'){
    if(t.length<3)return 'Qual área ou especialidade você procura?';
    s.specialty=raw.trim();s.stage='patient';return `Certo, ${s.specialty}. Você já é paciente da clínica ou seria seu primeiro atendimento?`;
  }
  if(s.stage==='patient'){
    if(/\b(primeira|novo|nunca|primeiro)\b/.test(t))s.patient='primeiro atendimento';
    else if(/\b(sim|ja|retorno|sou paciente|antigo)\b/.test(t))s.patient='paciente já cadastrado';
    else return 'Só para organizar: você já passou por atendimento nessa clínica ou seria sua primeira vez?';
    s.stage='day';return `Obrigada! Para ${s.service}, o valor ilustrativo desta demonstração é ${priceFormat(s.price)}. A tabela real depende da clínica. Qual dia seria melhor para você?`;
  }
  if(s.stage==='day'){
    const day=t.match(dayRe);if(!day)return 'Pode me dizer o dia da semana ou uma data em que gostaria de atendimento?';
    s.day=day[1];s.stage='time';return `Perfeito, ${s.day}. Você prefere qual horário? Pode dizer, por exemplo, 10h ou 15h.`;
  }
  if(s.stage==='time'){
    const hour=t.match(timeRe);if(!hour)return 'Qual horário exato você prefere? Por exemplo, 9h30 ou 14h.';
    s.time=hour[0];return otherSummary('recepcao');
  }
  return 'Como posso ajudar com seu atendimento?';
}
contextualReply=function(raw){
  if(current==='barbearia')return previousReply(raw);
  demoState.finished=false;
  const t=normalize(raw).replace(/[^\p{L}\p{N}\s:\/]/gu,' ').trim();
  return current==='salao'?salonReply(raw,t):receptionReply(raw,t);
};
