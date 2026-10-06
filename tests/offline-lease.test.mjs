import assert from 'node:assert/strict';
import { test } from 'node:test';
let api = {};
try { api = await import('../js/auth.js'); }
catch (e) { if(e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
const A='11111111-1111-4111-8111-111111111111', B='22222222-2222-4222-8222-222222222222';
const DAY=86400000, START=Date.parse('2026-10-10T12:00:00Z');
function storage() {
 const map=new Map();
 return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};
}
function fixture(overrides={}) {
 let time=START, online=true, uid=A, error=null;
 let data={contract_version:2,user_id:A,product:'casillas',state:'VALID',has_access:true,source:'LICENSE',
 validated_at:new Date(START).toISOString(),valid_until:null,...overrides};
 let calls=0; const store=storage();
 const ctl=api.createLeaseController({storage:()=>store,now:()=>time,online:()=>online,
 identity:async()=>({user:{id:uid},offline:!online}),
 cachedUser:()=>({id:uid}),
 request:async(name)=>{assert.equal(name,'get_casillas_access_v2');calls++;return {data,error};}});
 return {ctl,store,setTime:v=>time=v,setOnline:v=>online=v,setUser:v=>uid=v,
 setError:v=>error=v,setData:v=>data=v,calls:()=>calls,data:()=>data};
}
test('offline lease controller exists',()=>assert.equal(typeof api.createLeaseController,'function'));
test('online authority creates versioned lease without privileged fields',async()=>{
 const f=fixture({access_token:'must-not-copy',license_code:'must-not-copy'});
 assert.equal((await f.ctl.check()).ok,true);
 const saved=JSON.parse(f.store.getItem(api.LEASE_KEY));
 assert.equal(saved.formatVersion,1);assert.equal(saved.user_id,A);assert.equal(saved.product,'casillas');
 assert.equal(saved.validated_at,new Date(START).toISOString());
 assert.equal(Date.parse(saved.leaseExpiresAt),START+7*DAY);
 assert.equal(saved.access_token,undefined);assert.equal(saved.license_code,undefined);
});
test('valid persisted lease continues offline without any RPC',async()=>{
 const f=fixture();await f.ctl.check();f.setOnline(false);f.setTime(START+DAY);
 const r=await f.ctl.check();assert.equal(r.ok,true);assert.equal(r.offline,true);assert.equal(f.calls(),1);
});
for(const [name,elapsed] of [['exact seven day boundary',7*DAY],['after seven days',8*DAY]]){
 test(name+' denies unbounded right',async()=>{const f=fixture();await f.ctl.check();f.setOnline(false);f.setTime(START+elapsed);assert.equal((await f.ctl.check()).ok,false);});
}
for(const source of ['LICENSE','TRIAL']){
 test(source+' commercial end shorter than lease prevails',async()=>{
 const f=fixture({source,valid_until:new Date(START+2*DAY).toISOString()});
 await f.ctl.check();assert.equal(Date.parse(JSON.parse(f.store.getItem(api.LEASE_KEY)).leaseExpiresAt),START+2*DAY);
 f.setOnline(false);f.setTime(START+2*DAY);assert.equal((await f.ctl.check()).ok,false);
 });
}
test('trial requires bounded commercial end',async()=>assert.equal((await fixture({source:'TRIAL',valid_until:null}).ctl.check()).ok,false));
test('offline without prior lease denies without RPC',async()=>{const f=fixture();f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);assert.equal(f.calls(),0);});
test('unavailable localStorage fails closed',async()=>{
 const ctl=api.createLeaseController({storage:()=>{throw new Error('blocked');},now:()=>START,online:()=>false,
 identity:async()=>({user:{id:A},offline:true}),cachedUser:()=>({id:A}),request:()=>{throw new Error('offline RPC');}});
 assert.equal((await ctl.check()).ok,false);
});
test('corrupt lease fails closed',async()=>{const f=fixture();f.store.setItem(api.LEASE_KEY,'{broken');f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);});
test('clock marker corruption fails closed offline',async()=>{const f=fixture();await f.ctl.check();f.store.setItem(api.CLOCK_KEY,'bad');f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);});
test('user B cannot reuse A lease',async()=>{const f=fixture();await f.ctl.check();f.setUser(B);f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);});
test('wrong product fails closed',async()=>{const f=fixture();await f.ctl.check();const v=JSON.parse(f.store.getItem(api.LEASE_KEY));v.product='other';f.store.setItem(api.LEASE_KEY,JSON.stringify(v));f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);});
test('clock rollback never increases remaining lease',async()=>{
 const f=fixture();await f.ctl.check();f.setOnline(false);f.setTime(START+6*DAY);
 const before=await f.ctl.check();f.setTime(START+DAY);const after=await f.ctl.check();
 assert.equal(after.remainingMs,before.remainingMs);
 assert.equal(JSON.parse(f.store.getItem(api.LEASE_KEY)).maxObservedLocalTime,START+6*DAY);
});
test('large forward clock expires lease',async()=>{const f=fixture();await f.ctl.check();f.setOnline(false);f.setTime(START+30*DAY);assert.equal((await f.ctl.check()).ok,false);});
for(const state of ['NO_ACCESS','EXPIRED','REVOKED']){
 test('explicit '+state+' invalidates old lease without trial fallback',async()=>{
 const f=fixture();await f.ctl.check();f.setData({...f.data(),has_access:false,state});
 assert.equal((await f.ctl.check()).ok,false);assert.equal(f.store.getItem(api.LEASE_KEY),null);
 f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);assert.equal(f.calls(),2);
 });
}
for(const source of ['GRANT','PROMOTION','ADMIN']){
 test('independent '+source+' renews lease',async()=>{const f=fixture({source});assert.equal((await f.ctl.check()).source,source);});
}
test('network failure preserves lease but never renews it',async()=>{
 const f=fixture();await f.ctl.check();const old=JSON.parse(f.store.getItem(api.LEASE_KEY)).validated_at;
 f.setTime(START+DAY);f.setError(new TypeError('Failed to fetch'));
 const r=await f.ctl.check();assert.equal(r.ok,true);assert.equal(r.offline,true);
 assert.equal(JSON.parse(f.store.getItem(api.LEASE_KEY)).validated_at,old);
});
test('missing V2 RPC is technical failure, not offline permission',async()=>{
 const f=fixture();await f.ctl.check();f.setError({code:'PGRST202',message:'function not found',status:404});
 assert.equal((await f.ctl.check()).ok,false);assert.equal(f.store.getItem(api.LEASE_KEY),null);
});
test('second online validation renews using server timestamp, not client clock',async()=>{
 const f=fixture();await f.ctl.check();f.setTime(START+DAY);
 f.setData({...f.data(),validated_at:new Date(START+DAY).toISOString()});
 await f.ctl.check();assert.equal(Date.parse(JSON.parse(f.store.getItem(api.LEASE_KEY)).leaseExpiresAt),START+8*DAY);
});
test('forged overlong lease structure fails closed',async()=>{
 const f=fixture();await f.ctl.check();const l=JSON.parse(f.store.getItem(api.LEASE_KEY));l.leaseExpiresAt=new Date(START+8*DAY).toISOString();
 f.store.setItem(api.LEASE_KEY,JSON.stringify(l));f.setOnline(false);assert.equal((await f.ctl.check()).ok,false);
});
test('missing or contradictory server timestamp/identity/source denies',async()=>{
 for(const v of [{validated_at:undefined},{user_id:B},{product:'other'},{source:'UNKNOWN'},{state:'REVOKED'}]){
 const f=fixture(v);assert.equal((await f.ctl.check()).ok,false);
 }
});
test('invalidated in-flight request cannot resurrect lease after logout',async()=>{
 const f=fixture();await f.ctl.check();f.ctl.invalidate();f.setOnline(false);
 assert.equal((await f.ctl.check()).ok,false);
 let resolve; const promise=new Promise(r=>resolve=r);
 const ctl=api.createLeaseController({storage:()=>f.store,now:()=>START,online:()=>true,
 identity:async()=>({user:{id:A}}),cachedUser:()=>({id:A}),request:()=>promise});
 const pending=ctl.check();await Promise.resolve();ctl.invalidate();resolve({data:f.data(),error:null});
 assert.equal((await pending).ok,false);assert.equal(f.store.getItem(api.LEASE_KEY),null);
});
test('cached expired JWT keeps identity, not authorization',()=>{
 const s=storage();const token=Buffer.from('{}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:A,role:'authenticated',exp:1})).toString('base64url')+'.fixture';
 s.setItem('auth-session',JSON.stringify({user:{id:A},access_token:token,expires_at:1}));
 assert.equal(api.readCachedSessionUser(s,'auth-session').id,A);
 s.setItem('auth-session',JSON.stringify({user:{id:B},access_token:token}));
 assert.equal(api.readCachedSessionUser(s,'auth-session'),null);
 s.removeItem('auth-session');assert.equal(api.readCachedSessionUser(s,'auth-session'),null);
});
test('no authenticated offline identity cannot use a lease',async()=>{
 const f=fixture();await f.ctl.check();
 const ctl=api.createLeaseController({storage:()=>f.store,now:()=>START,online:()=>false,
 identity:async()=>({user:null}),cachedUser:()=>null,request:()=>{throw new Error('must not call');}});
 assert.equal((await ctl.check()).ok,false);
});
function target(){const handlers=new Map();return {visibilityState:'visible',
 addEventListener:(n,f)=>handlers.set(n,f),removeEventListener:n=>handlers.delete(n),
 emit:async n=>handlers.get(n)?.()};}
test('network return revalidates; focus bursts coalesce; expiry timer exists',async()=>{
 const events=target(),doc=target();let t=START,calls=0;const timers=new Map();let next=0;
 const stop=api.startAccessLifecycle({events,document:doc,now:()=>t,
 refresh:async()=>{calls++;return {ok:true,remainingMs:1000};},
 setTimer:(f,ms)=>{timers.set(++next,{f,ms});return next;},clearTimer:id=>timers.delete(id)});
 await events.emit('online');await events.emit('focus');await doc.emit('visibilitychange');
 assert.equal(calls,1);assert.equal([...timers.values()][0].ms,1000);
 t+=1000;await [...timers.values()][0].f();assert.equal(calls,2);stop();assert.equal(timers.size,0);
});
test('concurrent validation requests share one RPC',async()=>{
 const f=fixture();await Promise.all([f.ctl.check(),f.ctl.check(),f.ctl.check()]);assert.equal(f.calls(),1);
});

test('initial client clock offset never supplies the lease expiry anchor',async()=>{
 const f=fixture();f.setTime(START-30*DAY);await f.ctl.check();
 assert.equal(Date.parse(JSON.parse(f.store.getItem(api.LEASE_KEY)).leaseExpiresAt),START+7*DAY);
 f.setOnline(false);f.setTime(START-23*DAY);assert.equal((await f.ctl.check()).ok,false);
});
test('explicit HTTP authorization failure never becomes an offline network failure',async()=>{
 const f=fixture();await f.ctl.check();f.setError({status:401,message:'Failed to fetch authorization'});
 assert.equal((await f.ctl.check()).ok,false);assert.equal(f.store.getItem(api.LEASE_KEY),null);
});
test('post-activation validation cannot borrow an old offline lease',async()=>{
 const f=fixture();await f.ctl.check();f.setError(new TypeError('Failed to fetch'));
 assert.equal((await f.ctl.check({allowOffline:false})).ok,false);
 assert.equal((await f.ctl.check()).ok,true);
});

test('online renewal cannot erase previously observed clock rollback',async()=>{
 const f=fixture();await f.ctl.check();f.setOnline(false);f.setTime(START+6*DAY);await f.ctl.check();
 f.setOnline(true);f.setTime(START+DAY);f.setData({...f.data(),validated_at:new Date(START+6*DAY).toISOString()});
 const renewed=await f.ctl.check();assert.equal(renewed.ok,true);assert.equal(renewed.remainingMs,2*DAY);
});

test('hidden expiry resumes validation immediately on visibility, not cooldown',async()=>{
 const events=target(),doc=target();let t=START,calls=0;const timers=new Map();let next=0;
 const stop=api.startAccessLifecycle({events,document:doc,now:()=>t,
  refresh:async()=>{calls++;return {ok:true,remainingMs:1000};},
  setTimer:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},clearTimer:id=>timers.delete(id)});
 await events.emit('online');doc.visibilityState='hidden';t+=1000;await [...timers.values()][0].fn();
 doc.visibilityState='visible';await doc.emit('visibilitychange');assert.equal(calls,2);stop();
});
test('clock rollback cannot suppress lifecycle online revalidation for days',async()=>{
 const events=target(),doc=target();let t=START,calls=0;
 const stop=api.startAccessLifecycle({events,document:doc,now:()=>t,
  refresh:async()=>{calls++;return {ok:true,remainingMs:1000};},setTimer:()=>1,clearTimer:()=>{}});
 await events.emit('online');t-=86400000;await events.emit('focus');assert.equal(calls,2);stop();
});
