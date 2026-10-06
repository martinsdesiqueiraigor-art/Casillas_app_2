import {test} from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {parseHTML} from 'linkedom';
globalThis.indexedDB=new IDBFactory();
test('IndexedDB v1 → v2 preserva stores e dados; UI CNC offline enfileira interação e feedback',async()=>{
 await new Promise((resolve,reject)=>{
  const req=indexedDB.open('casillas-app',1);
  req.onupgradeneeded=()=>{for(const name of ['config','historico','cache'])req.result.createObjectStore(name);};
  req.onsuccess=()=>{const db=req.result,tx=db.transaction('config','readwrite');tx.objectStore('config').put('preservado','existing');
   tx.oncomplete=()=>{db.close();resolve();};tx.onabort=reject;};req.onerror=reject;
 });
 const {initDB,getDB,getAllDB,setDB,deleteDB}=await import('../../js/db.js');
 const db=await initDB();assert.equal(db.version,2);assert.deepEqual([...db.objectStoreNames],['cache','config','historico','outbox']);
 assert.equal(await getDB('config','existing'),'preservado');
 const {document,window}=parseHTML('<html><body><main></main></body></html>');
 globalThis.document=document;globalThis.Node=window.Node;
 globalThis.window={location:{hash:''},history:{replaceState:()=>{}}};
 const {supabase}=await import('../../js/supabase.bundle.js');
 const originalSession=supabase.auth.getSession,originalFrom=supabase.from,originalFetch=globalThis.fetch;
 let owner='A',requests=0;
 supabase.auth.getSession=async()=>({data:{session:owner?{user:{id:owner}}:null},error:null});
 supabase.from=()=>({insert:async()=>({error:{code:'NETWORK'}})});
 globalThis.fetch=()=>{requests++;throw Error('rede indisponível');};
 try{
  const {render}=await import('../../js/modules/consultor/index.js');
  const {eventBus}=await import('../../js/core/eventBus.js');
  const {wireGuideRouter}=await import('../../js/core/router.js');
  const {GuiaManager}=await import('../../js/modules/guia/GuiaManager.js');
  const {render:renderGuia}=await import('../../js/modules/guia.js');
  const root=document.querySelector('main');render(root,null,{ownerUserId:'A'});
  root.querySelector('input').value='rosca torno fanuc';
  root.querySelector('form').dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));
  async function until(predicate){for(let i=0;i<100;i++){if(await predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('timeout');}
  await until(async()=> (await getAllDB('outbox')).length===1 && !root.querySelector('button[type="submit"]').disabled);
  assert.match(root.textContent,/Ciclo Automático/);
  const helpful=[...root.querySelectorAll('button')].find(b=>b.textContent==='Útil');
  helpful.click();helpful.click();await until(async()=> (await getAllDB('outbox')).length===2);
  const pending=await getAllDB('outbox');assert.equal(pending.filter(i=>i.type==='guide_feedback').length,1);
  assert.ok(pending.every(i=>i.ownerUserId==='A'));assert.equal(pending[1].payload.interaction_id||pending[0].payload.interaction_id,pending.find(i=>i.type==='chat_interaction').id);
  const stop=wireGuideRouter(eventBus,new GuiaManager(),hash=>{globalThis.window.location.hash=hash;});
  root.querySelector('[data-action="guide-open"]').click();
  assert.equal(globalThis.window.location.hash,'#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe');
  renderGuia(root);assert.match(root.textContent,/G76 P021060 Q100 R0.05/);assert.equal(requests,0);stop();
  const {SyncQueue}=await import('../../js/core/syncQueue.js'),{outboxStore}=await import('../../js/core/outboxStore.js');
  const sent=[],q=new SyncQueue(outboxStore,()=>owner,{send:async i=>{sent.push(i.type);return true;}});
  owner='B';await q.flush();assert.equal((await getAllDB('outbox')).length,2);assert.equal(sent.length,0);
  owner='A';await q.flush();assert.deepEqual(sent,['chat_interaction','guide_feedback']);assert.equal((await getAllDB('outbox')).length,0);
  await setDB('cache','verify',123);await deleteDB('cache','verify');assert.equal(await getDB('cache','verify'),null);
 }finally{await supabase.auth.stopAutoRefresh();supabase.auth.broadcastChannel?.close();supabase.auth.getSession=originalSession;supabase.from=originalFrom;globalThis.fetch=originalFetch;db.close();}
});
