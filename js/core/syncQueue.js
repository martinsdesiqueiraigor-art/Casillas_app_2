// @ts-check
/** @typedef {{id:string,type:'chat_interaction'|'guide_feedback',ownerUserId:string,createdAt:string,payload:Record<string,any>}} OutboxItem */
/** @typedef {{put:(item:OutboxItem)=>Promise<void>,all:()=>Promise<OutboxItem[]>,remove:(id:string)=>Promise<void>}} Store */
export class SyncQueue {
 /** @param {Store} store @param {()=>string|null|Promise<string|null>} owner @param {{send:(item:OutboxItem)=>Promise<boolean>}} transport */
 constructor(store,owner,transport){this.store=store;this.owner=owner;this.transport=transport;/** @type {Promise<void>|null} */this.running=null;}
 /** @param {OutboxItem} item */
 async enqueue(item){
  if(!item.ownerUserId||item.payload.user_id!==item.ownerUserId||item.payload.id!==item.id||!['chat_interaction','guide_feedback'].includes(item.type))throw new Error('Outbox inválida');
  await this.store.put(structuredClone(item));
 }
 async flush(){
  if(this.running)return this.running;
  this.running=this.drain();try{await this.running;}finally{this.running=null;}
 }
 async drain(){
  const owner=await this.owner();if(!owner)return;
  const items=(await this.store.all()).filter(i=>i.ownerUserId===owner)
   .sort((a,b)=>Number(a.type==='guide_feedback')-Number(b.type==='guide_feedback')||a.createdAt.localeCompare(b.createdAt));
  const pending=new Set(items.filter(i=>i.type==='chat_interaction').map(i=>i.id));
  for(const item of items){
   if(await this.owner()!==owner)return;
   if(item.type==='guide_feedback'&&pending.has(item.payload.interaction_id))continue;
   try{
    if(!await this.transport.send(item))continue;
    if(await this.owner()!==owner)return;
    await this.store.remove(item.id);pending.delete(item.id);
   }catch{ /* Rede/autenticação/integridade: preservar evento e dependentes. */ }
  }
 }
}
