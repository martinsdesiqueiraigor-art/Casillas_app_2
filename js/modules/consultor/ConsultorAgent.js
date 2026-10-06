// @ts-check
import { bancoCiclosCNC } from '../guia/bancoCiclosCNC.js';
import { extractSlots } from './slotExtractor.js';
import { resolveSlots } from './resolver.js';
import { TRANSITIONS } from './constants.js';
export class ConsultorAgent {
 /** @param {import('../guia/types.js').Cycle[]} bank */
 constructor(bank=bancoCiclosCNC){
  this.bank=bank;this.state='IDLE';this.interactionId='';this.clientCreatedAt='';
  /** @type {import('../guia/types.js').Slots} */ this.slots={};
  this.result=resolveSlots({},[]);
 }
 /** @param {string} next */
 transition(next){if(!TRANSITIONS[this.state]?.includes(next))throw new Error('Transição inválida: '+this.state+' → '+next);this.state=next;}
 reset(){if(this.state!=='IDLE')this.transition('IDLE');this.slots={};this.interactionId='';}
 /** @param {string} text */
 ask(text){
  if(this.state==='PRESENTING'||this.state==='FEEDBACK')this.reset();
  if(this.state==='IDLE'){this.interactionId=crypto.randomUUID();this.clientCreatedAt=new Date().toISOString();}
  this.slots={...this.slots,...extractSlots(text,this.bank)};
  if(this.state==='IDLE'&&!this.slots.codigo)this.transition('FILLING_SLOTS');
  this.transition('RESOLVING');this.result=resolveSlots(this.slots,this.bank);
  this.transition(this.result.outcome==='ambiguous'?'FILLING_SLOTS':'PRESENTING');
  return {state:this.state,result:this.result,interactionId:this.interactionId};
 }
}
