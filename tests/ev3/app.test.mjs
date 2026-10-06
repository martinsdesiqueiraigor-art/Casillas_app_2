import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {IDBFactory} from 'fake-indexeddb';
test('app real respeita gates, deep link inicial, navegação e identidade Consultor',async()=>{
 const {supabase}=await import('../../js/supabase.bundle.js');
 const original={getUser:supabase.auth.getUser,getSession:supabase.auth.getSession,onAuthStateChange:supabase.auth.onAuthStateChange,rpc:supabase.rpc,from:supabase.from,fetch:globalThis.fetch};
 let allowed=false,network=0;
 const user={id:'a0000000-0000-4000-8000-000000000001'};
 supabase.auth.getUser=async()=>({data:{user},error:null});
 supabase.auth.getSession=async()=>({data:{session:{user}},error:null});
 supabase.auth.onAuthStateChange=()=>({data:{subscription:{unsubscribe(){}}}});
 supabase.rpc=async name=>{assert.equal(name,'get_casillas_entitlement');allowed=true;return {data:[{has_access:true}],error:null};};
 supabase.from=()=>({insert:async()=>({error:{code:'NETWORK'}})});
 globalThis.fetch=()=>{network++;throw Error('nenhuma rede permitida');};
 const {document,window}=parseHTML(readFileSync(new URL('../../index.html',import.meta.url),'utf8'));
 Object.defineProperty(window,'location',{value:{hash:'#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe',href:'http://localhost/index.html'},configurable:true});
 Object.defineProperty(window,'history',{value:{replaceState(_a,_b,hash){window.location.hash=hash;}},configurable:true});
 globalThis.document=document;globalThis.window=window;globalThis.Node=window.Node;globalThis.DOMParser=window.DOMParser;
 globalThis.indexedDB=new IDBFactory();Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
 async function until(predicate){for(let i=0;i<100;i++){if(await predicate())return;await new Promise(r=>setTimeout(r,10));}throw Error('timeout app');}
 try{
  await import('../../js/app.js');assert.equal(allowed,false);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await until(()=>document.querySelector('details[data-accordion-id="sintaxe"]')?.open);
  assert.equal(allowed,true);assert.match(document.getElementById('app-content').textContent,/G76 P021060/);
  document.querySelector('[data-module="consultor-tecnico"]').click();
  await until(()=>document.getElementById('consultor-pergunta'));
  assert.equal(document.getElementById('module-indicator-name').textContent,'Consultor Técnico');
  document.getElementById('consultor-pergunta').value='rosca torno fanuc';
  document.querySelector('#app-content form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  await until(()=>document.querySelector('[data-action="guide-open"]'));
  const {getAllDB}=await import('../../js/db.js');await until(async()=> (await getAllDB('outbox')).length===1);
  document.querySelector('[data-action="guide-open"]').click();
  await until(()=>document.querySelector('details[data-accordion-id="sintaxe"]')?.open);
  assert.equal(window.location.hash,'#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe');
  window.location.hash='#/guia/missing';window.dispatchEvent(new window.Event('hashchange'));
  await until(()=>document.getElementById('guia-contador')?.textContent==='4 de 4 ciclos');
  assert.equal(window.location.hash,'#/guia');assert.ok(document.body.textContent.includes('Destino do Guia inválido'));
  assert.equal(network,0);
  await new Promise(r=>setTimeout(r,250));
 }finally{
  Object.assign(supabase.auth,{getUser:original.getUser,getSession:original.getSession,onAuthStateChange:original.onAuthStateChange});
  supabase.rpc=original.rpc;supabase.from=original.from;globalThis.fetch=original.fetch;
  (await import('../../js/db.js')).initDB().then(db=>db.close());
 }
});
