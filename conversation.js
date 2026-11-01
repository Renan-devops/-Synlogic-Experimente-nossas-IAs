/* Motor de conversa local baseado em regras contextuais. Não usa IA generativa. */
const conversation={name:'',service:'',date:'',period:'',professional:'',stage:'opening',lastIntent:'',lastAnswer:'',history:[],greeted:false};
const previousStart=startChat;
const barber={stage:'service',service:'',hairStyle:'',beardStyle:'',day:'',time:''};
startChat=function(){Object.assign(conversation,{name:'',service:'',date:'',period:'',professional:'',stage:'opening',lastIntent:'',lastAnswer:'',history:[],greeted:false});Object.assign(barber,{stage:'service',service:'',hairStyle:'',beardStyle:'',day:'',time:''});previousStart();$('chatText').placeholder='Digite sua mensagem...'};
const patterns={
 greeting:/\b(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|hello)\b/,
 thanks:/\b(obrigad[oa]|valeu|agradeco|show|perfeito)\b/,
 bye:/\b(tchau|ate logo|ate mais|falou)\b/,
 price:/\b(preco|precos|valor|valores|custa|quanto|orcamento|tabela)\b/,
 hours:/\b(horario de funcionamento|abre|fecha|funciona|expediente|atende aos sabados|domingo)\b/,
 location:/\b(onde fica|endereco|localizacao|bairro|como chegar)\b/,
 human:/\b(humano|atendente|pessoa|funcionario|equipe|recepcionista de verdade)\b/,
 booking:/\b(agendar|marcar|reservar|agendamento|consulta|horario|vaga|disponibilidade)\b/,
 cancel:/\b(cancelar|desmarcar|cancelamento)\b/,
 reschedule:/\b(remarcar|reagendar|mudar o dia|trocar horario)\b/,
 services:/\b(servico|servicos|fazem|oferece|procedimento|cardapio|catalogo|opcoes)\b/,
 professional:/\b(profissional|cabeleireir|barbeiro|especialista|com quem|atendido por)\b/,
 reminder:/\b(lembrete|confirmacao|confirmar|whatsapp|avisar|notificacao)\b/,
 today:/\b(hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|dia \d|\d{1,2}\/\d{1,2})\b/,
 period:/\b(manha|tarde|noite|depois do almoco|apos o almoco|antes do almoco|\d{1,2}h|\d{1,2}:\d{2})\b/,
 yes:/\b(sim|quero|pode|claro|beleza|isso|vamos|gostaria)\b/,
 no:/\b(nao|prefiro nao|deixa|agora nao)\b/
};
const catalogs={
 salao:['corte','escova','hidratacao','coloracao','manicure','pedicure','sobrancelha','cilios','progressiva','penteado'],
 barbearia:['corte','barba','combo','pezinho','sobrancelha','degrade'],
 recepcao:['consulta','avaliacao','retorno','exame','agendamento','atendimento']
};
const variants=(items)=>items[conversation.history.length%items.length];
function serviceFrom(text){return catalogs[current].find(item=>text.includes(item))||null}
function barberPrice(){return barber.service==='combo'?70:barber.service==='barba'?30:45}
function barberStylePrompt(){return barber.service==='barba'?'Perfeito! Para a barba, você prefere desenhada, degradê, aparada ou só alinhamento?':'Boa! Qual estilo de corte você quer: low fade, mid fade, high fade, militar, americano, social ou outro?'}
function barberQuote(){barber.stage='day';const style=barber.service==='combo'?`Cabelo: ${barber.hairStyle}; barba: ${barber.beardStyle}`:barber.service==='barba'?`Barba: ${barber.beardStyle}`:`Cabelo: ${barber.hairStyle}`;return `Fechado! 💈 ${style}. O valor de exemplo para ${barber.service==='combo'?'o combo corte + barba':barber.service==='barba'?'a barba':'o corte'} fica em R$ ${barberPrice()},00 (preço ilustrativo desta demonstração). Qual dia você gostaria de vir?`}
function barberFinalSummary(){barber.stage='showcase';return `Perfeito! 💈 Resumo da sua solicitação:\n• Serviço: ${barber.service==='combo'?'cabelo + barba':barber.service}\n• Estilo: ${barber.service==='combo'?barber.hairStyle+' / '+barber.beardStyle:barber.service==='barba'?barber.beardStyle:barber.hairStyle}\n• Valor ilustrativo: R$ ${barberPrice()},00\n• Preferência: ${barber.day}, às ${barber.time}\n\nTudo anotado! A reserva dependeria de consultar a agenda conectada.\n\nE tem mais: além de organizar pedidos como o seu, uma assistente da Synlogic pode ser configurada para:\n✅ Atender dúvidas sobre serviços e preços a qualquer hora;\n✅ Consultar vagas e confirmar horários na agenda;\n✅ Enviar lembretes automáticos pelo WhatsApp;\n✅ Apoiar reagendamentos e cancelamentos;\n✅ Encaminhar situações especiais para a equipe.\n\nEssas funções dependem das integrações contratadas. Quer que eu te explique alguma delas na prática?`}
function barberReply(raw,t){
  const is=(p)=>p.test(t),date=t.match(/\b(hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|\d{1,2}\/\d{1,2}|dia \d{1,2})\b/),hour=t.match(/\b([01]?\d|2[0-3])(?::([0-5]\d)|h(?:([0-5]\d))?)\b/),period=t.match(/\b(manha|tarde|noite|depois do almoco|apos o almoco)\b/);
  if(barber.stage!=='showcase'&&is(/\b(cancelar|desmarcar|remarcar|reagendar)\b/))return 'Posso te orientar sobre alterações de agendamento também. Por enquanto, vamos concluir esta simulação de novo horário. Você quer continuar?';
  if(is(/\b(preco|valor|quanto custa|custa quanto)\b/))return barber.service?`Para ${barber.service}, o valor ilustrativo é R$ ${barberPrice()},00. Vamos seguir? ${barber.stage==='style'?'Qual estilo você prefere?':barber.stage==='day'?'Qual dia fica melhor?':'Qual horário prefere?'}`:'Como referência desta demonstração: corte R$ 45,00, barba R$ 30,00 e combo R$ 70,00. Qual serviço você quer simular?';
  if(is(/\b(ja respondi|ja falei|repetindo|de novo)\b/))return `Foi mal pela repetição! Já tenho ${barber.service||'o serviço em aberto'}${barber.day?', '+barber.day:''}${barber.time?', '+barber.time:''}. Vamos seguir de onde paramos.`;
  if(barber.stage==='service'){
    if(is(/\b(combo|ambos|os dois|cabelo e barba|corte e barba)\b/))barber.service='combo';
    else if(is(/\b(barba|barbear)\b/))barber.service='barba';
    else if(is(/\b(cabelo|corte|degrade|fade|militar|americano|social)\b/))barber.service='corte';
    else return 'Bem-vindo! 💈 Você quer cuidar do cabelo, da barba ou fazer o combo dos dois?';
    barber.stage='style';
    const immediateStyle=t.match(/\b(low fade|mid fade|high fade|skin fade|militar|americano|social|degrade|degradê|buzz cut|undercut)\b/);
    if(immediateStyle&&barber.service==='corte'){barber.hairStyle=immediateStyle[1];return barberQuote()}
    return barberStylePrompt();
  }
  if(barber.stage==='style'){
    if(is(/\b(oi|ola|bom dia|boa tarde|boa noite)\b/)&&t.length<14)return barberStylePrompt();
    const style=t.match(/\b(low fade|mid fade|high fade|skin fade|militar|americano|social|degrade|degrad[eê]|buzz cut|undercut|tesoura|maquina|navalha|desenhada|aparada|alinhamento|alinhada|cavanhaque)\b/);
    if(!style&&t.length<3)return barberStylePrompt();
    if(barber.service==='barba')barber.beardStyle=style?.[0]||raw.trim();
    else barber.hairStyle=style?.[0]||raw.trim();
    if(barber.service==='combo'){barber.stage='beard-style';return `Show! Corte ${barber.hairStyle} anotado. E na barba, você prefere desenhada, degradê, aparada ou só alinhamento?`}
    return barberQuote();
  }
  if(barber.stage==='beard-style'){
    if(t.length<3)return 'Para a barba, você prefere desenhada, degradê, aparada ou alinhada?';
    barber.beardStyle=raw.trim();return barberQuote();
  }
  if(barber.stage==='day'){
    if(!date)return 'Certo! Para qual dia você gostaria de agendar? Pode dizer, por exemplo, quarta ou sábado.';
    barber.day=date[1];barber.stage='time';return `Ótimo, ${barber.day}! E qual horário você prefere? Pode me dizer, por exemplo, 10h ou 15h30.`;
  }
  if(barber.stage==='time'){
    if(!hour){if(period)return `Beleza, ${period[1].includes('tarde')||period[1].includes('almoco')?'à tarde':'pela '+period[1]}. Qual horário exato seria melhor: por exemplo, 14h ou 16h?`;return 'Qual horário exato você prefere? Pode enviar, por exemplo, 14h30.'}
    barber.time=hour[0];return barberFinalSummary();
  }
  if(is(/\b(outro dia|mudar dia|trocar dia)\b/)){barber.stage='day';barber.day='';barber.time='';return 'Claro! Qual outro dia seria melhor?'}
  if(is(/\b(outro horario|mudar horario|trocar horario)\b/)){barber.stage='time';barber.time='';return 'Sem problema! Qual horário você prefere?'}
  if(is(/\b(outro corte|outro estilo|mudar estilo)\b/)){barber.stage='style';return barberStylePrompt()}
  if(is(/\b(lembrete|avisar|notificacao|mensagem automatica)\b|^1$/))return 'Os lembretes podem ser enviados pelo WhatsApp antes do horário marcado, com data, hora e serviço. A empresa define a antecedência e o conteúdo. Isso ajuda o cliente a não esquecer e permite que ele responda caso precise mudar. Quer saber sobre reagendamentos também?';
  if(is(/\b(reagendar|reagendamento|cancelamento|cancelar|remarcar)\b|^2$/))return 'Para reagendar ou cancelar, a assistente pode localizar a reserva, consultar novas vagas e pedir sua confirmação antes de alterar a agenda. Assim, a equipe não precisa fazer tudo manualmente. Quer conhecer a parte de atendimento fora do horário comercial?';
  if(is(/\b(24 horas|fora do horario|madrugada|atendimento|duvidas|perguntas)\b|^3$/))return 'A assistente pode responder perguntas comuns mesmo quando a barbearia está fechada: serviços, preços cadastrados, localização, funcionamento e políticas. Ela também pode encaminhar casos que precisam de uma pessoa. Quer saber como funciona a integração com a agenda?';
  if(is(/\b(agenda|integracao|disponibilidade|vagas|confirmacao)\b|^4$/))return 'Com uma agenda integrada, a assistente consulta horários livres antes de oferecer opções e só registra o compromisso após a confirmação do cliente. Neste site, os horários são apenas exemplos. Quer ver como funcionam os lembretes?';
  if(is(/\b(equipe|humano|funcionario|pessoa)\b|^5$/))return 'Se surgir uma situação fora das regras ou o cliente pedir alguém da equipe, o atendimento pode ser encaminhado a uma pessoa, levando o contexto da conversa. Quer explorar outra função?';
  if(is(/\b(sim|claro|quero|pode|explica|funcionalidades|funcoes)\b/))return 'Claro! Posso detalhar uma destas possibilidades: 1) lembretes automáticos, 2) reagendamentos, 3) atendimento 24 horas, 4) integração com a agenda ou 5) transferência para a equipe. Qual te interessa mais?';
  if(is(/\b(nao|agora nao|suficiente)\b/))return 'Tranquilo! 💈 Obrigado por experimentar o atendimento. Você pode continuar perguntando sobre alguma função quando quiser.';
  if(is(/\b(obrigado|obrigada|valeu|tchau|ate mais)\b/))return 'Valeu! 💈 Foi um prazer te atender. Se precisar ajustar algo, é só falar!';
  return 'Fechamos esse exemplo de atendimento! Posso ajustar o dia, o horário ou o estilo do corte. O que você gostaria de mudar?';
}
function simulateResponse(raw){
  const t=normalize(raw).replace(/[^\p{L}\p{N}\s:\/]/gu,' ').trim();
  if(current==='barbearia')return barberReply(raw,t);
  conversation.history.push({speaker:'user',text:raw});
  const hit=key=>patterns[key].test(t);
  const nameMatch=t.match(/(?:me chamo|meu nome e|sou o|sou a)\s+([a-z]{2,20})/);
  if(nameMatch)conversation.name=nameMatch[1].replace(/^./,c=>c.toUpperCase());
  const svc=serviceFrom(t);if(svc)conversation.service=svc;
  const dayMatch=t.match(/\b(hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|dia \d{1,2}|\d{1,2}\/\d{1,2})\b/);
  const periodMatch=t.match(/\b(manha|tarde|noite|depois do almoco|apos o almoco|antes do almoco|\d{1,2}h|\d{1,2}:\d{2})\b/);
  if(dayMatch)conversation.date=dayMatch[1];
  if(periodMatch)conversation.period=/almoco/.test(periodMatch[1])?'à tarde':periodMatch[1]==='manha'?'pela manhã':periodMatch[1]==='tarde'?'à tarde':periodMatch[1];
  const first=conversation.name?conversation.name+', ':'',isSalon=current==='salao',isBarber=current==='barbearia';
  let intent='general',reply='';
  if(/\b(ja (te )?(respondi|falei|disse)|repetindo|de novo|novamente)\b/.test(t)){intent='correction';reply=conversation.date&&conversation.period?`Você tem razão, desculpa! Já anotei ${conversation.date} ${conversation.period}${conversation.service?' para '+conversation.service:''}. Não vou te perguntar isso de novo. Quer que eu explique como verificaria a disponibilidade?`:'Você tem razão, desculpa pela repetição. Vou considerar as informações que você já passou. O que ainda falta resolver?';conversation.stage=conversation.date&&conversation.period?'ready':conversation.stage}
  else if(hit('bye')){intent='bye';reply=`Até mais${conversation.name?', '+conversation.name:''}! 💙 Quando quiser, é só me chamar por aqui.`}
  else if(hit('human')){intent='human';reply='Claro! Posso deixar a solicitação pronta para a equipe assumir. Neste espaço de demonstração não há uma pessoa conectada, mas esse encaminhamento pode fazer parte do atendimento. Qual assunto você gostaria de resolver?'}
  else if(hit('cancel')){intent='cancel';reply='Sem problema, posso te orientar. Para cancelar com segurança, eu precisaria localizar o agendamento pelo nome e data antes de solicitar a confirmação. Qual é o dia do atendimento?'}
  else if(hit('reschedule')){intent='reschedule';reply='Vamos ajustar isso! Primeiro eu identificaria sua reserva e consultaria novos horários. Qual dia você gostaria de tentar?'}
  else if(hit('price')){intent='price';reply=conversation.service?`O valor de ${conversation.service} depende da tabela cadastrada pelo estabelecimento. Posso te orientar sobre o atendimento e a disponibilidade. Prefere manhã ou tarde?`:'Posso te ajudar a encontrar o serviço certo. Os preços variam conforme o estabelecimento e precisam ser cadastrados. Qual procedimento você tem em mente?'}
  else if(hit('location')){intent='location';reply='O endereço exato é informado pelo estabelecimento. Numa implantação, eu poderia enviar o mapa e as orientações para chegar. Enquanto isso, posso ajudar com serviços ou horários. O que prefere?'}
  else if(hit('hours')){intent='hours';reply='O horário de funcionamento é configurado de acordo com a rotina da empresa. Posso te ajudar a escolher um período para atendimento. Você prefere manhã ou tarde?'}
  else if(hit('professional')){intent='professional';reply=isSalon?'Posso te ajudar a escolher a profissional mais adequada para o serviço. Você procura cabelo, unhas ou outro procedimento?':isBarber?'Claro! É possível escolher um barbeiro específico quando a equipe estiver cadastrada. Você já tem preferência por alguém?':'Posso indicar a especialidade adequada e depois consultar a agenda do profissional. Qual tipo de atendimento você precisa?'}
  else if(hit('services')){intent='services';reply=isSalon?'Temos exemplos de corte, escova, hidratação, coloração, manicure e sobrancelhas. Qual deles te interessa?':isBarber?'Podemos conversar sobre corte, barba, combo e acabamento. Você quer algo clássico ou um visual diferente?':'Posso te orientar sobre consultas, avaliações e retornos. Qual é a necessidade do atendimento?'}
  else if(hit('reminder')){intent='reminder';reply='O processo pode incluir confirmação da reserva e lembretes automáticos pelo WhatsApp. Antes de enviar qualquer mensagem real, a empresa precisa configurar a integração. Quer simular a escolha de um horário?'}
  else if((dayMatch||periodMatch||svc)&&conversation.date&&conversation.period){intent='details-complete';const alreadyReady=conversation.stage==='ready';conversation.stage='ready';reply=alreadyReady?'Sim, já registrei essas preferências. 😊 Agora podemos avançar: quer entender como eu verificaria a disponibilidade ou prefere tirar outra dúvida?':`Perfeito! Anotei ${conversation.date} ${conversation.period}${conversation.service?' para '+conversation.service:''}. 😊 Para mostrar horários livres de verdade, eu precisaria consultar a agenda do estabelecimento. Quer entender como essa confirmação funcionaria?`}
  else if(svc){intent='service';conversation.stage=conversation.period?'date':'period';reply=conversation.period?'Já registrei seu período de preferência. Qual dia você gostaria?':`Ótima escolha! Já anotei ${conversation.service}. Qual período fica melhor para você: manhã ou tarde?`}
  else if(dayMatch){intent='date';conversation.stage='period';reply='Combinado, registrei '+conversation.date+'. Você prefere de manhã ou à tarde?'}
  else if(periodMatch){intent='period';conversation.stage='date';reply='Certo, registrei sua preferência '+conversation.period+'. Qual dia da semana você gostaria?'}
  else if(hit('booking')){intent='booking';conversation.stage=conversation.service?'date':'service';reply=conversation.service?`Claro! Vamos organizar o agendamento de ${conversation.service}. Qual dia seria ideal para você?`:isSalon?'Claro! 💙 Você gostaria de agendar cabelo, unhas, sobrancelhas ou outro serviço?':isBarber?'Bora marcar! 💈 Você quer corte, barba ou o combo?':'Claro, vamos começar. É uma consulta, avaliação ou retorno?'}
  else if(hit('greeting')){intent='greeting';reply=variants([`Oi${conversation.name?', '+conversation.name:''}! Tudo bem? 😊 Me conta: você quer conhecer os serviços ou simular um agendamento?`,'Olá! Que bom te receber por aqui. Em que posso facilitar seu atendimento hoje?'])}
  else if(hit('thanks')){intent='thanks';reply=variants(['Imagina! 😊 Fico feliz em ajudar. Tem mais alguma coisa que você gostaria de saber?','Por nada! Se precisar de mais alguma informação, estou por aqui.'])}
  else if(hit('no')){intent='no';reply='Tudo bem, sem problema! Podemos seguir por outro caminho. Você prefere conhecer os serviços ou tirar alguma dúvida?'}
  else if(hit('yes')){intent='yes';reply=conversation.stage==='ready'?'Numa integração completa, eu consultaria a agenda, apresentaria os horários livres e só confirmaria após você escolher um. Aqui não faço reservas reais. Gostaria de conhecer os lembretes automáticos também?':conversation.stage==='date'?'Perfeito! Qual dia é melhor para você?':conversation.stage==='period'?'Ótimo! Prefere manhã ou tarde?':'Vamos lá! Posso te ajudar com um serviço, uma dúvida ou um exemplo de agendamento. Qual você escolhe?'}
  else {intent='general';reply=conversation.stage==='ready'?`Já tenho as preferências: ${conversation.date} ${conversation.period}${conversation.service?' para '+conversation.service:''}. Podemos falar sobre como a confirmação do agendamento funcionaria, ou tirar outra dúvida.`:conversation.stage==='service'?`Entendi${conversation.name?', '+conversation.name:''}. Para eu te orientar direitinho, qual serviço você procura?`:conversation.stage==='date'?'Entendi! Que dia você tinha em mente?':conversation.stage==='period'?'Certo! Você prefere manhã ou tarde?':variants([`Entendi${conversation.name?', '+conversation.name:''}. Me conta um pouquinho mais do que você precisa e eu te ajudo a encontrar o melhor caminho.`,`Claro, vamos por partes. Você está buscando informações, um serviço específico ou um horário?`,`Quero te ajudar direitinho. O que seria mais importante resolver agora: agendar, conhecer os serviços ou tirar uma dúvida?`])}
  if(reply===conversation.lastAnswer)reply+=' Posso te ajudar com outra dúvida também.';
  conversation.lastAnswer=reply;conversation.lastIntent=intent;conversation.history.push({speaker:'assistant',text:reply});
  return reply;
}
contextualReply=function(value){demoState.finished=false;return simulateResponse(value)};
