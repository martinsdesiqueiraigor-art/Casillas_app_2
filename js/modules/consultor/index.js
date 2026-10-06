// @ts-check
import { ConsultorAgent } from './ConsultorAgent.js';
import { ResultCard } from './resultCard.js';
import { Telemetry } from './telemetry.js';
import { SyncQueue } from '../../core/syncQueue.js';
import { outboxStore } from '../../core/outboxStore.js';
import { createTransport,sessionOwner } from '../../core/supabaseClient.js';
/** @param {HTMLElement} container @param {unknown} accessStatus @param {{ownerUserId:string}} context */
export function render(container,accessStatus,context){
 const agent=new ConsultorAgent(),cards=new ResultCard();
 const queue=new SyncQueue(outboxStore,sessionOwner,createTransport()),telemetry=new Telemetry(context.ownerUserId,queue);
 container.replaceChildren();
 const heading=document.createElement('h2');heading.textContent='Consultor Técnico';
 const description=document.createElement('p');description.textContent='Consulta local aos ciclos disponíveis. Exemplo: rosca torno fanuc';
 const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');
 input.id='consultor-pergunta';input.className='input';input.dataset.nativeKeyboard='1';input.setAttribute('inputmode','text');input.required=true;
 label.htmlFor=input.id;label.textContent='Sua consulta';
 const submit=document.createElement('button');submit.type='submit';submit.className='btn btn-primary';submit.textContent='Consultar';
 const reset=document.createElement('button');reset.type='button';reset.className='btn btn-outline';reset.textContent='Nova consulta';
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const results=document.createElement('div');form.append(label,input,submit,reset);container.append(heading,description,form,status,results);
 let busy=false;
 /** @param {unknown} error */
 function storageError(error){console.warn('[EV3] Persistência pendente',error);status.textContent='Resultado local disponível. Não foi possível salvar; tente novamente.';}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!input.value.trim())return;busy=true;submit.disabled=true;
  try{
   cards.clear();results.replaceChildren();agent.ask(input.value);input.value='';
   if(agent.result.outcome==='ambiguous'){
    const options=agent.result.candidates.map(c=>c.meta.controlador+' / '+c.meta.maquina.replaceAll('_',' '));
    status.textContent='Complete a consulta com controlador ou máquina: '+[...new Set(options)].join('; ');
   }else if(agent.result.outcome==='no_match')status.textContent='Nenhum ciclo encontrado na base local. Inicie uma nova consulta.';
   else{
    status.textContent='Resultado encontrado na base local.';results.append(cards.render(agent.result.candidates[0]));
    const feedback=document.createElement('div'),buttons=[];
    for(const [text,helpful] of /** @type {[string,boolean][]} */([['Útil',true],['Não útil',false]])){
     const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent=text;buttons.push(button);
     button.addEventListener('click',async()=>{
      if(busy)return;busy=true;for(const b of buttons)b.disabled=true;
      try{await telemetry.feedback(agent,helpful);status.textContent='Feedback salvo neste dispositivo.';void queue.flush().catch(error => console.warn('[EV3] Sync pendente', error));}
      catch(error){for(const b of buttons)b.disabled=false;storageError(error);}finally{busy=false;}
     });feedback.append(button);
    }results.append(feedback);
   }
   await telemetry.record(agent);void queue.flush().catch(error => console.warn('[EV3] Sync pendente', error));
  }catch(error){storageError(error);}finally{busy=false;submit.disabled=false;}
 });
 reset.addEventListener('click',async()=>{
  if(busy)return;busy=true;try{await telemetry.record(agent,true);agent.reset();cards.clear();results.replaceChildren();status.textContent='Nova consulta';input.value='';input.focus();}
  catch(error){storageError(error);}finally{busy=false;}
 });
}
