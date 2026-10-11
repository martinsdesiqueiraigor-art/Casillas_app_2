// @ts-check
import { ConsultorAgent } from './ConsultorAgent.js';
import { ResultCard } from './resultCard.js';
import { Telemetry } from './telemetry.js';
import { SyncQueue } from '../../core/syncQueue.js';
import { outboxStore } from '../../core/outboxStore.js';
import { createTransport,sessionOwner } from '../../core/supabaseClient.js';

/** @param {string} tag @param {string} className @param {string} [text] */
function element(tag,className,text){
 const node=document.createElement(tag);node.className=className;
 if(text!==undefined)node.textContent=text;return node;
}
/** @param {HTMLElement} container @param {unknown} accessStatus @param {{ownerUserId:string}} context */
export function render(container,accessStatus,context){
 const agent=new ConsultorAgent(),cards=new ResultCard();
 const queue=new SyncQueue(outboxStore,sessionOwner,createTransport()),telemetry=new Telemetry(context.ownerUserId,queue);
 container.replaceChildren();
 const shell=element('section','cs-shell');
 const hero=element('header','cs-hero');
 hero.append(element('span','cs-eyebrow','CONSULTA TÉCNICA LOCAL'),element('h2','cs-title','Consultor Técnico'),element('p','cs-lead','Descreva a operação ou informe um código CNC. Os resultados são consultados na base técnica disponível no dispositivo.'));
 const form=element('form','cs-form'),label=element('label','cs-label','Sua consulta'),input=document.createElement('input');
 input.id='consultor-pergunta';input.className='input';input.dataset.nativeKeyboard='1';input.setAttribute('inputmode','text');input.required=true;
 input.placeholder='Ex.: rosca torno fanuc';label.htmlFor=input.id;
 const actions=element('div','cs-actions');
 const submit=element('button','btn btn-primary','Consultar');submit.type='submit';
 const reset=element('button','btn btn-outline','Nova consulta');reset.type='button';
 actions.append(submit,reset);form.append(label,input,actions);
 const status=element('p','cs-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const trail=element('section','cs-trail');trail.setAttribute('aria-label','Contexto da consulta');trail.hidden=true;
 const results=element('div','cs-results');shell.append(hero,form,trail,status,results);container.append(shell);
 let originalQuestion='';
 /** @param {string} question @param {string} [contextChoice] */
 function updateTrail(question,contextChoice=''){
  trail.replaceChildren();
  if(!question){trail.hidden=true;return;}
  trail.hidden=false;
  const questionRow=element('div','cs-trail-row');
  questionRow.append(element('span','cs-trail-label','Você perguntou'),element('strong','cs-trail-value',question));
  trail.append(questionRow);
  if(contextChoice){const contextRow=element('div','cs-trail-row');contextRow.append(element('span','cs-trail-label','Contexto selecionado'),element('strong','cs-trail-value',contextChoice));trail.append(contextRow);}
 }
 let busy=false;
 try{const pending=sessionStorage.getItem('casillas:consultor-prefill');if(pending){input.value=pending;sessionStorage.removeItem('casillas:consultor-prefill');}}
 catch(error){console.warn('[Consultor] Consulta inicial indisponível',error);}
 /** @param {unknown} error */
 function storageError(error){console.warn('[EV3] Persistência pendente',error);status.textContent='Resultado local disponível. Não foi possível salvar; tente novamente.';}
 /** @param {unknown} error */
 function consultationError(error){console.error('[EV3] Falha na consulta local',error);status.textContent='Não foi possível processar a consulta. Tente novamente.';}
 /** @param {string} text */
 async function consult(text){
  if(busy||!text.trim())return;busy=true;submit.disabled=true;
  try{
   cards.clear();results.replaceChildren();
   if(agent.state!=='FILLING_SLOTS'){originalQuestion=text.trim();updateTrail(originalQuestion);}
   agent.ask(text);input.value='';
   if(agent.result.outcome==='ambiguous'){
    status.textContent='Preciso de mais contexto para localizar a ficha correta.';
    const clarification=element('section','cs-clarify');
    clarification.append(element('h3','','Qual controle ou máquina você está usando?'),element('p','','Escolha uma opção encontrada na base técnica local.'));
    const options=element('div','cs-clarify-options');
    const choices=new Set(agent.result.candidates.map(c=>c.meta.controlador+' / '+c.meta.maquina.replaceAll('_',' ')));
    for(const choice of choices){
     const button=element('button','',choice);button.type='button';
     button.addEventListener('click',()=>{
      if(busy)return;
      // O agente permanece em FILLING_SLOTS: ask() incorpora o novo contexto
      // sem apagar a operação e os demais slots da pergunta original.
      for(const option of options.querySelectorAll('button'))option.disabled=true;
      updateTrail(originalQuestion,choice);
      status.textContent='Contexto selecionado: '+choice+'. Consultando a base local…';
      void consult(choice);
     });
     options.append(button);
    }
    clarification.append(options);results.append(clarification);
   }else if(agent.result.outcome==='no_match'){
    status.textContent='Nenhuma correspondência encontrada na base local.';
    results.append(element('div','cs-empty','Tente informar o código CNC, o controle ou a operação. Não serão apresentados ciclos sem correspondência validada.'));
   }else{
    status.textContent='Resultado encontrado na base local.';
    results.append(cards.render(agent.result.candidates[0]));
    const feedback=element('section','cs-feedback');
    feedback.append(element('p','cs-feedback-label','Este resultado ajudou?'));
    const feedbackActions=element('div','cs-feedback-actions'),buttons=[];
    for(const [title,helpful] of /** @type {[string,boolean][]} */([['Útil',true],['Não útil',false]])){
     const button=element('button','btn',title);button.type='button';buttons.push(button);
     button.addEventListener('click',async()=>{
      if(busy)return;busy=true;for(const b of buttons)b.disabled=true;
      try{await telemetry.feedback(agent,helpful);status.textContent='Feedback salvo neste dispositivo.';void queue.flush().catch(error=>console.warn('[EV3] Sync pendente',error));}
      catch(error){for(const b of buttons)b.disabled=false;storageError(error);}
      finally{busy=false;}
     });feedbackActions.append(button);
    }
    feedback.append(feedbackActions);results.append(feedback);
   }
   try{await telemetry.record(agent);void queue.flush().catch(error=>console.warn('[EV3] Sync pendente',error));}
   catch(error){storageError(error);}
  }catch(error){consultationError(error);}
  finally{busy=false;submit.disabled=false;}
 }
 form.addEventListener('submit',event=>{event.preventDefault();void consult(input.value);});
 reset.addEventListener('click',async()=>{
  if(busy)return;busy=true;
  try{await telemetry.record(agent,true);}catch(error){console.warn('[EV3] Registro pendente ao reiniciar',error);}
  try{agent.reset();originalQuestion='';updateTrail('');cards.clear();results.replaceChildren();status.textContent='';input.value='';input.focus();}
  catch(error){consultationError(error);}finally{busy=false;}
 });
}
