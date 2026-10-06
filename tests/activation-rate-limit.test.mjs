// EV2-06 integration: synthetic users/licenses, disposable LOCAL Docker only.
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHmac } from 'node:crypto';

const cli = process.env.CASILLAS_SUPABASE_CLI || 'supabase';
const root = resolve(import.meta.dirname, '..');
const dir = mkdtempSync(join(tmpdir(), 'casillas-ev206-'));
const project = 'Casillas_ev206_' + Date.now();
const container = 'supabase_db_' + project;
const rest = 'casillas_ev206_rest_' + Date.now();
const red = process.argv.includes('--red');
const excludes = 'gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor';
const secret = 'LOCAL_DISPOSABLE_EV206_JWT_FIXTURE_NOT_A_REAL_SECRET';
let assertions = 0;
function run(program, args, input) {
  const r = spawnSync(program, args, { cwd: root, input, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (r.error) throw r.error;
  assert.equal(r.status, 0, program + ' failed: ' + r.stdout + r.stderr);
  return r.stdout.trim();
}
function check(actual, expected, description) {
  assert.deepEqual(actual, expected, description);
  assertions++;
  console.log('PASS ' + description);
}
function sql(statement) {
  assert.match(container, /^supabase_db_Casillas_ev206_[0-9]+$/);
  return run('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-f', '-'], statement);
}
mkdirSync(join(dir, 'supabase', 'migrations'), { recursive: true });
mkdirSync(join(dir, 'supabase', 'tests'), { recursive: true });
const config = readFileSync(join(root, 'supabase', 'config.toml'), 'utf8')
  .replace(/^project_id\s*=.*$/m, 'project_id = "' + project + '"')
  .replace(/\b5432([0-9])\b/g, (_, d) => '5672' + d);
writeFileSync(join(dir, 'supabase', 'config.toml'), config);
for (const file of readdirSync(join(root, 'supabase', 'migrations'))) {
  if (file.endsWith('.sql') && !(red && file.includes('rate_limit_commercial_activation')))
    copyFileSync(join(root, 'supabase', 'migrations', file), join(dir, 'supabase', 'migrations', file));
}
for (const file of ['000-setup-tests-hooks.sql', 'activation_rate_limit.test.sql', ...(!red ? ['commercial_access_ev2.test.sql'] : [])])
  copyFileSync(join(root, 'supabase', 'tests', file), join(dir, 'supabase', 'tests', file));
const before = run('docker', ['ps', '--format', '{{.ID}} {{.Names}}']).split('\n').sort();
// The unique LOCAL rest name is inspected during cleanup, including partial starts.
try {
  console.log('Starting disposable LOCAL project ' + project);
  run(cli, ['start', '--workdir', dir, '--agent', 'no', '--exclude', excludes]);
  if (red) {
    const r = spawnSync(cli, ['test', 'db', '--local', '--workdir', dir, '--agent', 'no'],
      { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
    console.log(r.stdout + r.stderr);
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /Structured activation RPC exists/);
    console.log('RED confirmed: structured RPC missing on approved baseline');
  } else {
    console.log('Private search_path metadata: ' + sql("select jsonb_agg(jsonb_build_object('function',proname,'config',proconfig)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and proname in ('activation_retry_at','admit_activation_attempt','activate_casillas_license_v2');"));
    if (!process.argv.includes('--http-only') && !process.argv.includes('--acl-only'))
      console.log(run(cli, ['test', 'db', '--local', '--workdir', dir, '--agent', 'no']));
    // Additional committed-transaction, concurrency and HTTP assertions follow.

    check(sql('select count(*) from supabase_migrations.schema_migrations;'), '12',
      'Twelve versioned migrations reconstruct the LOCAL database');
    console.log('PostgreSQL ' + sql('show server_version;'));
    const users = ['shared','race','oracle','shape','success','oldsuccess','input','internal','unique'];
    const uid = n => '00000000-0000-4000-8000-' + String(600 + users.indexOf(n)).padStart(12,'0');
    const product = sql("select id from public.products where slug='casillas';");
    sql("insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at,updated_at) values "
      + users.map(n => "('" + uid(n) + "','rate-" + n + "@test.invalid','{}','{}',now(),now())").join(',') + ';');
    const hash = code => "encode(extensions.digest('" + code + "','sha256'),'hex')";
    sql("insert into public.licenses(product_id,license_code_hash) values ('" + product + "',"
      + hash('RATEHTTPSUCCESS') + "),('" + product + "'," + hash('RATEHTTPLEGACY') + "),('"
      + product + "'," + hash('RATEHTTPINTERNAL') + "),('" + product + "'," + hash('RATEHTTPUNIQUE') + ");");
    const quota = n => Number(sql("select coalesce((select cardinality(attempts) from private.activation_attempt_windows"
      + " where user_id='" + uid(n) + "' and product_id='" + product + "'),0);"));
    const token = n => {
      const enc = v => Buffer.from(JSON.stringify(v)).toString('base64url');
      const data = enc({ alg:'HS256', typ:'JWT' }) + '.' + enc({
        role:'authenticated', sub:uid(n), aud:'authenticated', exp:Math.floor(Date.now()/1000)+3600
      });
      return data + '.' + createHmac('sha256',secret).update(data).digest('base64url');
    };
    const network = Object.keys(JSON.parse(run('docker',['inspect',container]))[0].NetworkSettings.Networks)[0];
    // Fresh CLI database has the documented LOCAL postgres password; no role/ACL changes.
    // PostgREST switches to the signed JWT authenticated role for every request.
    const restImage = run('docker',['image','inspect','public.ecr.aws/supabase/postgrest:v16.3','--format','{{.Id}}']);
    console.log('LOCAL PostgREST v16.3 image ' + restImage);
    run('docker',['run','-d','--name',rest,'--network',network,'-p','127.0.0.1:55831:3000',
      '-e','PGRST_DB_URI=postgres://postgres:postgres@'+container+':5432/postgres',
      '-e','PGRST_DB_SCHEMAS=public,private','-e','PGRST_DB_ANON_ROLE=anon',
      '-e','PGRST_DB_EXTRA_SEARCH_PATH=public,extensions','-e','PGRST_JWT_SECRET='+secret,
      // Deliberately enable rollback overrides: the RPC must refuse this header before lookup.
      '-e','PGRST_DB_TX_END=commit-allow-override',restImage]);
    let ready = false;
    for (let i=0;i<30;i++) {
      try { ready = (await fetch('http://127.0.0.1:55831/')).ok; } catch {}
      if (ready) break;
      await new Promise(r => setTimeout(r,500));
    }
    assert.equal(ready,true,'Disposable PostgREST starts');
    async function rpc(n, name='activate_casillas_license_v2', code='INVALIDCODE', extra={}, params={}) {
      const r = await fetch('http://127.0.0.1:55831/rpc/'+name, {
        method:'POST', headers:{ 'Content-Type':'application/json', Accept:'application/json',
          Authorization:'Bearer '+token(n), ...extra },
        body:JSON.stringify(name === 'admit_activation_attempt' ? params : {p_license_code:code,...params})
      });
      const text = await r.text();
      let body;
      try { body=JSON.parse(text); } catch { body=text; }
      return {status:r.status,body};
    }
    if (!process.argv.includes('--acl-only')) {
    for (const [name,profile] of [
      ['activate_casillas_license','public'],['activate_casillas_license','private'],
      ['activate_casillas_license_v2','public'],['activate_casillas_license_v2','private'],
      ['activate_casillas_license','public']
    ]) {
      const r=await rpc('shared',name,'INVALIDCODE',{'Content-Profile':profile});
      check(r.status,200,'Direct '+profile+'.'+name+' failure is HTTP 200, not a rollback exception');
      check(r.body,name.endsWith('_v2')?{result:'ACTIVATION_DENIED'}:[],
        'Expected refusal never supplies an activation');
    }
    check(quota('shared'),5,'All four routes share one committed quota');
    check((await rpc('shared')).body.result,'RATE_LIMITED','Sixth HTTP attempt blocked across routes');
    check(quota('shared'),5,'HTTP blocked attempt never appends a timestamp');

    const concurrent=await Promise.all(Array.from({length:12},()=>rpc('race')));
    check(concurrent.filter(r=>r.status===200&&r.body.result==='ACTIVATION_DENIED').length,5,
      'Twelve concurrent first calls admit exactly five');
    check(concurrent.filter(r=>r.status===200&&r.body.result==='RATE_LIMITED').length,7,
      'Seven concurrent calls are blocked, not admitted');
    check(quota('race'),5,'Concurrent committed timestamps cannot exceed five');

    check((await rpc('input','activate_casillas_license_v2','!')).body.result,'INVALID_REQUEST','HTTP invalid syntax controlled');
    check((await rpc('input','activate_casillas_license_v2','')).body.result,'INVALID_REQUEST','HTTP empty input controlled');
    check((await rpc('input','activate_casillas_license_v2','é'.repeat(65))).body.result,'INVALID_REQUEST','HTTP oversized UTF8 controlled');
    check((await rpc('input','activate_casillas_license_v2','A'.repeat(65))).body.result,'INVALID_REQUEST','Normalized 65-character input controlled');
    check((await rpc('input','activate_casillas_license_v2','A'.repeat(64)+'-'.repeat(64))).body.result,'ACTIVATION_DENIED','Exactly 128 raw bytes and 64 normalized characters admitted');
    check(quota('input'),5,'All malformed/oversized HTTP input attempts commit');

    const unknown=await rpc('oracle');
    sql("insert into public.licenses(product_id,license_code_hash,status,activated_by,activated_at,revoked_at)"
      + " values ('"+product+"',"+hash('RATEREVOKEDCODE')+",'REVOKED','"+uid('oracle')+"',now(),now());");
    check((await rpc('oracle','activate_casillas_license_v2','RATEREVOKEDCODE')).body,unknown.body,
      'Missing and revoked codes have exactly the same external body');
    const active=await rpc('success','activate_casillas_license_v2','RATEHTTPSUCCESS');
    check(active.body.result,'SUCCESS','HTTP valid code activates normally');
    assert.match(active.body.license_id,/^[0-9a-f-]{36}$/);
    check((await rpc('oracle','activate_casillas_license_v2','RATEHTTPSUCCESS')).body,unknown.body,
      'Unavailable and nonexistent codes have identical bodies');
    sql("insert into public.entitlements(user_id,product_id,source) values ('"+uid('oracle')+"','"+product+"','ADMIN');");
    check((await rpc('oracle')).body,unknown.body,'Independent-right conflict discloses no additional commercial detail');
    check(quota('oracle'),4,'Each distinct commercial refusal commits an admitted attempt');

    const old=await rpc('oldsuccess','activate_casillas_license','RATEHTTPLEGACY');
    check(old.status,200,'Legacy success remains HTTP 200');
    check(Object.keys(old.body[0]).sort(),['activated_at','entitlement_id','license_id','product_slug'],
      'Legacy success preserves the four original columns');
    check(old.body[0].product_slug,'casillas','Legacy success belongs to canonical product');
    check((await rpc('shape','activate_casillas_license_v2','RATEHTTPINTERNAL',{},
      {p_product_id:'00000000-0000-4000-8000-999999999999'})).status,404,
      'Client-supplied product cannot select another quota');
    check(quota('shape'),0,'Unknown product argument never reaches activation');
    check((await rpc('shape','activate_casillas_license_v2','RATEHTTPINTERNAL',
      {Prefer:'tx=rollback'})).body.result,'INVALID_REQUEST','Requested rollback never reaches commercial lookup');
    check((await rpc('shape','activate_casillas_license','RATEHTTPINTERNAL',
      {Accept:'application/vnd.pgrst.object+json'})).status,406,
      'Legacy singular representation is rejected without a key lookup');
    check((await rpc('shape','activate_casillas_license','RATEHTTPINTERNAL',
      {Prefer:'handling=strict, max-affected=0'})).body,[],
      'Result-count rollback preference cannot probe a license');
    check(quota('shape'),0,'Unsupported transport is never admitted or hashed');
    check(sql("select status from public.licenses where license_code_hash="+hash('RATEHTTPINTERNAL')+";"),
      'AVAILABLE','Transport probes never activate/consume a code');
    const head=await fetch('http://127.0.0.1:55831/rpc/activate_casillas_license_v2?p_license_code=RATEHTTPINTERNAL',
      {headers:{Authorization:'Bearer '+token('shape')}});
    check(head.status,405,'GET cannot invoke a mutating activation');
    check(quota('shape'),0,'GET neither queries a key nor changes quota');

    // A technical/audit error must stay technical and roll back commercial state.
    sql("create function public.ev206_fail_activation() returns trigger language plpgsql as $$ begin"
      + " if new.license_code_hash="+hash('RATEHTTPINTERNAL')+" then raise exception 'EV206_INTERNAL_FIXTURE_FAILURE'; end if;"
      + " return new; end $$; create trigger ev206_fail_activation before update on public.licenses"
      + " for each row execute function public.ev206_fail_activation();");
    const technical=await rpc('internal','activate_casillas_license_v2','RATEHTTPINTERNAL');
    check(technical.status,400,'Unexpected infrastructure exception remains a technical RPC failure');
    check(technical.body.message,'EV206_INTERNAL_FIXTURE_FAILURE','Unexpected exception is not disguised as commercial denial');
    check(quota('internal'),0,'Technical transaction rollback is explicit, not a committed business refusal');
    check(sql("select status from public.licenses where license_code_hash="+hash('RATEHTTPINTERNAL')+";"),'AVAILABLE',
      'Technical failure consumes no license');
    sql('drop trigger ev206_fail_activation on public.licenses; drop function public.ev206_fail_activation();');

    // Deterministic injection of the same unique-index reservation conflict as a concurrent grant.
    sql("create function public.ev206_reservation_race() returns trigger language plpgsql as $$ begin"
      + " if new.license_code_hash="+hash('RATEHTTPUNIQUE')+" then"
      + " insert into public.entitlements(user_id,product_id,source) values(new.activated_by,new.product_id,'GRANT'); end if;"
      + " return new; end $$; create trigger ev206_reservation_race before update on public.licenses"
      + " for each row execute function public.ev206_reservation_race();");
    check((await rpc('unique','activate_casillas_license_v2','RATEHTTPUNIQUE')).body,{result:'ACTIVATION_DENIED'},
      'Known unique reservation race returns controlled refusal');
    check(quota('unique'),1,'Admission survives the commercial subtransaction rollback');
    check(sql("select status from public.licenses where license_code_hash="+hash('RATEHTTPUNIQUE')+";"),'AVAILABLE',
      'Reservation race rolls back license consumption');
    sql('drop trigger ev206_reservation_race on public.licenses; drop function public.ev206_reservation_race();');
    }
    const helper=await rpc('shape','admit_activation_attempt',undefined,{'Content-Profile':'private'},
      {p_user_id:uid('shape'),p_product_id:product});
    check([401,403,404].includes(helper.status),true,'Internal admission helper cannot be called through PostgREST');
    check(sql("select count(*) from public.trials where user_id in ("+users.map(n=>"'"+uid(n)+"'").join(',')+");"),
      '0','HTTP refusals and successes create no trial');

  }
} finally {
  const restExists = run('docker', ['ps', '-a', '--filter', 'name=^/' + rest + '$', '--format', '{{.Names}}']);
  if (restExists) {
    assert.equal(restExists, rest, 'Only the test-owned REST container can be removed');
    run('docker', ['rm', '-f', rest]);
  }
  run(cli, ['stop', '--no-backup', '--workdir', dir, '--agent', 'no']);
  check(run('docker', ['ps', '--format', '{{.ID}} {{.Names}}']).split('\n').sort(), before,
    'Existing containers preserved');
  check(run('docker', ['ps', '-a', '--filter', 'name=' + project, '--format', '{{.Names}}']), '',
    'Disposable containers removed');
  check(run('docker', ['volume', 'ls', '--filter', 'name=' + project, '--format', '{{.Name}}']), '',
    'Disposable volumes removed');
  console.log('Cleanup PASS; project ' + project);
}
console.log(JSON.stringify({ result: red ? 'RED_EXPECTED' : 'PASS', assertions, project, local_only: true }));
