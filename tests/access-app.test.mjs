import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8')
  .replace(/^import .+;\r?\n/gm, '')
  .replace("home:      () => import('./modules/home.js')", 'home: testLoader')
  .replaceAll('import.meta.url', JSON.stringify(new URL('../js/app.js', import.meta.url).href));
function fixture({ allowed = true, identity = true, loader } = {}) {
  let permit = allowed, renders = 0, cleared = 0, refresh;
  const winEvents = new Map(), docEvents = new Map();
  const content = { firstChild: null, classList: { add(){}, remove(){} }, removeChild(){} };
  const header = {textContent:'',dataset:{}};
  const deps = {
    initDB: async()=>{}, showToast:()=>{}, loadInitialState:async()=>{}, persistCurrentModule:async()=>{},
    appState:{currentModule:'home'}, checkTrialStatus:async()=>({ok:permit,remainingMs:1000,daysLeft:Infinity,activated:true}),
    invalidateAccessLease:()=>{cleared++;permit=false;}, inspectAccessLease:()=>({ok:permit}),
    showActivationScreen:()=>{}, startAccessLifecycle: options=>{refresh=options.refresh;return()=>{};},
    LEASE_KEY:'lease', initKeyboard:()=>{}, bindInputsToKeyboard:()=>{}, hideKeyboard:()=>{},
    initMenu:()=>{}, setActiveMenuItem:()=>{}, initOptionsMenu:()=>{}, closeOptionsMenu:()=>{},
    initShareButton:()=>{}, renderMenuIcons:()=>{}, ICONS:{},
    supabase:{auth:{storageKey:'session'}}, getCurrentUser:async()=>({user:identity?{id:'A'}:null,error:null}),
    onAuthStateChange:fn=>{winEvents.set('auth',fn);}, signOut:async()=>({error:null}),
    window:{addEventListener:(k,v)=>winEvents.set(k,v),location:{},console:{}},
    document:{addEventListener:(k,v)=>docEvents.set(k,v),getElementById:id=>id==='app-content'?content:id==='header-access-status'?header:null},
    navigator:{}, console:{log(){},error(){},warn(){}}, setTimeout:()=>{},
    testLoader:loader || (async()=>({render:()=>{renders++;}}))
  };
  const app=Function(...Object.keys(deps),source+'; return {boot,loadModule,refreshAccess};')(...Object.values(deps));
  return {app,header,winEvents,setAllowed:v=>permit=v,renders:()=>renders,cleared:()=>cleared,refresh:()=>refresh()};
}
test('app boot without identity fails closed before module render', async()=> {
  const f=fixture({identity:false});await f.app.boot();assert.equal(f.renders(),0);
});
test('app boot with denied access renders no calculator and starts recovery lifecycle',async()=>{
  const f=fixture({allowed:false});await f.app.boot();assert.equal(f.renders(),0);
  f.setAllowed(true);await f.refresh();assert.equal(f.renders(),1);
});
test('valid access mounts once; denial does not erase mounted technical content',async()=>{
  const f=fixture();await f.app.boot();assert.equal(f.renders(),1);
  f.setAllowed(false);await f.refresh();assert.equal(f.renders(),1);assert.equal(f.header.dataset.access,'blocked');
  await f.app.loadModule('home');assert.equal(f.renders(),1);
});
test('access lost during async module import cannot render afterward',async()=>{
  let resolve,renders=0;const promise=new Promise(r=>resolve=r);
  const f=fixture({loader:()=>promise});const pending=f.app.boot();
  for(let i=0;i<8;i++)await Promise.resolve();
  f.setAllowed(false);resolve({render:()=>renders++});await pending;assert.equal(renders,0);
});
test('signed out and different signed in user invalidate commercial lease',async()=>{
  const f=fixture();await f.app.boot();f.winEvents.get('auth')('SIGNED_IN',{user:{id:'B'}});
  assert.equal(f.cleared(),1);assert.equal(f.renders(),1);
  f.winEvents.get('auth')('SIGNED_OUT');assert.equal(f.cleared(),2);
});
