// @ts-check
export class Telemetry {
 /** @param {string} ownerUserId @param {{enqueue:(item:import('../../core/syncQueue.js').OutboxItem)=>Promise<void>}} queue */
 constructor(ownerUserId,queue){this.ownerUserId=ownerUserId;this.queue=queue;/** @type {Map<string,Promise<void>>} */this.interactions=new Map();/** @type {Set<string>} */this.feedbacks=new Set();}
 /** @param {import('./ConsultorAgent.js').ConsultorAgent} agent @param {boolean} final */
 async record(agent,final=false){
  if(!agent.interactionId||(!final&&agent.state==='FILLING_SLOTS'))return;
  const id=agent.interactionId;
  if(this.interactions.has(id))return this.interactions.get(id);
  const pending=this.queue.enqueue({id,type:'chat_interaction',ownerUserId:this.ownerUserId,createdAt:agent.clientCreatedAt,
   payload:{id,user_id:this.ownerUserId,client_created_at:agent.clientCreatedAt,slots:{...agent.slots},outcome:agent.result.outcome,
   resolved_cycle_id:agent.result.outcome==='resolved'?agent.result.candidates[0].meta.id:null,result_count:agent.result.candidates.length,schema_version:1}});
  this.interactions.set(id,pending);
  try{await pending;}catch(e){this.interactions.delete(id);throw e;}
 }
 /** @param {import('./ConsultorAgent.js').ConsultorAgent} agent @param {boolean} helpful */
 async feedback(agent,helpful){
  if(agent.result.outcome!=='resolved'||!['PRESENTING','FEEDBACK'].includes(agent.state))throw new Error('Feedback sem resultado');
  const interactionId=agent.interactionId,cycleId=agent.result.candidates[0].meta.id,key=interactionId+':'+cycleId;
  if(this.feedbacks.has(key))return false;
  this.feedbacks.add(key);
  try{
   await this.record(agent);
   const id=crypto.randomUUID(),createdAt=new Date().toISOString();
   await this.queue.enqueue({id,type:'guide_feedback',ownerUserId:this.ownerUserId,createdAt,payload:{id,user_id:this.ownerUserId,
    interaction_id:interactionId,cycle_id:cycleId,helpful,client_created_at:createdAt,schema_version:1}});
   if(agent.state==='PRESENTING')agent.transition('FEEDBACK');return true;
  }catch(e){this.feedbacks.delete(key);throw e;}
 }
}
