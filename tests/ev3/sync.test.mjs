import {test} from 'node:test';
import assert from 'node:assert/strict';
function store(){const rows=new Map();return {rows,put:async item=>{rows.set(item.id,structuredClone(item));},all:async()=>[...rows.values()],remove:async id=>{rows.delete(id);}};}
function item(id,type='chat_interaction',owner='A',interaction='interaction'){return {id,type,ownerUserId:owner,createdAt:'2026-10-06T00:00:00Z',payload:{id,user_id:owner,interaction_id:interaction}};}
test('ownership offline A → logout → B → A; ordem interação antes de feedback',async()=>{
 const {SyncQueue}=await import('../../js/core/syncQueue.js');const db=store();let user='A';const sent=[];
 const queue=new SyncQueue(db,()=>user,{send:async event=>{sent.push(event.type);return true;}});
 await queue.enqueue(item('feedback','guide_feedback','A','interaction'));await queue.enqueue(item('interaction'));
 user=null;await queue.flush();user='B';await queue.flush();assert.equal(sent.length,0);assert.equal(db.rows.size,2);
 user='A';await queue.flush();assert.deepEqual(sent,['chat_interaction','guide_feedback']);assert.equal(db.rows.size,0);
});
test('falha de rede preserva interação e feedback dependente',async()=>{
 const {SyncQueue}=await import('../../js/core/syncQueue.js');const db=store(),sent=[];
 const queue=new SyncQueue(db,()=> 'A',{send:async e=>{sent.push(e.id);throw new Error('offline');}});
 await queue.enqueue(item('interaction'));await queue.enqueue(item('f','guide_feedback'));
 await queue.flush();assert.deepEqual(sent,['interaction']);assert.equal(db.rows.size,2);
});
test('troca de identidade durante flush não apaga evento; flush concorrente serializado',async()=>{
 const {SyncQueue}=await import('../../js/core/syncQueue.js');const db=store();let user='A',calls=0;
 const queue=new SyncQueue(db,()=>user,{send:async()=>{calls++;user='B';return true;}});
 await queue.enqueue(item('interaction'));await Promise.all([queue.flush(),queue.flush()]);
 assert.equal(calls,1);assert.equal(db.rows.size,1);
});
test('interação independente de feedback e feedback local idempotente',async()=>{
 const {Telemetry}=await import('../../js/modules/consultor/telemetry.js');
 const {ConsultorAgent}=await import('../../js/modules/consultor/ConsultorAgent.js');
 const db=store(),t=new Telemetry('A',{enqueue:db.put}),a=new ConsultorAgent();
 a.ask('rosca');assert.equal(db.rows.size,0);a.ask('torno fanuc');
 await t.record(a);await t.record(a);assert.equal(db.rows.size,1);
 await Promise.all([t.feedback(a,true),t.feedback(a,true)]);assert.equal(db.rows.size,2);
 const rows=[...db.rows.values()];assert.equal(rows[0].id,a.interactionId);assert.equal(rows[0].payload.query,undefined);
 assert.equal(rows[1].payload.interaction_id,a.interactionId);assert.equal(rows[1].ownerUserId,'A');
});
test('retry só aceita unicidade quando registro equivalente é comprovado',async()=>{
 const {createTransport}=await import('../../js/core/supabaseClient.js');
 const event=item('interaction');event.payload={id:'interaction',user_id:'A',slots:{},outcome:'resolved'};
 let code='23505',stored=structuredClone(event.payload);
 const client={from:()=>({insert:async()=>({error:{code}}),select:()=>({eq(){return this;},maybeSingle:async()=>({data:stored,error:null})})})};
 const transport=createTransport(client);
 assert.equal(await transport.send(event),true);stored={...stored,outcome:'no_match'};assert.equal(await transport.send(event),false);
 code='23503';assert.equal(await transport.send(event),false);
 code='42501';assert.equal(await transport.send(event),false);
});
