// LOCAL-only forward-migration regression for pre-existing revoked licenses.
// Run: CASILLAS_SUPABASE_CLI=<installed binary> node tests/ev2-migration.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const cli = process.env.CASILLAS_SUPABASE_CLI || 'supabase';
const root = resolve(import.meta.dirname, '..');
const dir = mkdtempSync(join(tmpdir(), 'casillas-ev2-forward-'));
const project = 'Casillas_ev2_forward_' + Date.now();
const container = 'supabase_db_' + project;
const migration = '20261006020648_enforce_commercial_validity_and_license_revocation.sql';
const excludes = 'gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor';
let assertions = 0;
function run(program, args, input) {
  const result = spawnSync(program, args, { cwd: root, input, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, program + ' failed: ' + result.stderr);
  return result.stdout.trim();
}
function check(actual, expected, description) {
  assert.deepEqual(actual, expected, description);
  assertions++;
}
function sql(statement) {
  // Only this dynamically named, disposable LOCAL Docker container is accessible.
  assert.match(container, /^supabase_db_Casillas_ev2_forward_[0-9]+$/);
  return run('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-f', '-'], statement);
}
function access(userId) {
  return Number(sql("begin; select set_config('request.jwt.claims',"
    + "'{\"sub\":\"" + userId + "\"}',true); set local role authenticated;"
    + 'select count(*) from public.get_casillas_entitlement(); rollback;').split('\n').at(-1));
}

mkdirSync(join(dir, 'supabase', 'migrations'), { recursive: true });
let config = readFileSync(join(root, 'supabase', 'config.toml'), 'utf8');
config = config.replace(/^project_id\s*=.*$/m, 'project_id = "' + project + '"')
  .replace(/\b5432([0-9])\b/g, (_, digit) => '5562' + digit);
writeFileSync(join(dir, 'supabase', 'config.toml'), config);
for (const file of readdirSync(join(root, 'supabase', 'migrations'))) {
  if (file.endsWith('.sql') && file < migration)
    copyFileSync(join(root, 'supabase', 'migrations', file), join(dir, 'supabase', 'migrations', file));
}
const before = run('docker', ['ps', '--format', '{{.ID}} {{.Names}}']).split('\n').sort();
const user = '00000000-0000-4000-8000-000000000301';
const independent = '00000000-0000-4000-8000-000000000302';
const license = '00000000-0000-4000-8000-000000000303';
const entitlement = '00000000-0000-4000-8000-000000000304';
try {
  run(cli, ['start', '--workdir', dir, '--agent', 'no', '--exclude', excludes]);
  sql("begin; insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)"
    + " values ('" + user + "','ev2-forward-dependent@test.invalid','{}','{}',now(),now()),"
    + "('" + independent + "','ev2-forward-independent@test.invalid','{}','{}',now(),now());"
    + "insert into public.licenses(id,product_id,license_code_hash,status,activated_by,activated_at,revoked_at)"
    + " select '" + license + "',id,repeat('a',64),'REVOKED','" + user + "',now()-interval '2 days',now()-interval '1 day'"
    + " from public.products where slug='casillas';"
    + "insert into public.entitlements(id,user_id,product_id,license_id,source,valid_from)"
    + " select '" + entitlement + "','" + user + "',id,'" + license + "','LICENSE',now()-interval '2 days'"
    + " from public.products where slug='casillas';"
    + "insert into public.entitlements(user_id,product_id,source,valid_from)"
    + " select '" + independent + "',id,'GRANT',now()-interval '1 day' from public.products where slug='casillas'; commit;");

  // Deliberately inconsistent OLD-schema fixtures: both invariant directions.
  // A failed forward migration must leave these rows and product DDL untouched.
  sql("update public.entitlements set source='GRANT' where id='" + entitlement + "';"
    + "update public.entitlements set source='LICENSE' where user_id='" + independent + "';");
  const invalidSnapshot = sql("select jsonb_agg(to_jsonb(e) order by e.id) from public.entitlements e;");
  copyFileSync(join(root, 'supabase', 'migrations', migration), join(dir, 'supabase', 'migrations', migration));
  const rejected = spawnSync(cli, ['migration', 'up', '--local', '--workdir', dir, '--agent', 'no'],
    { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (rejected.error) throw rejected.error;
  check(rejected.status, 1, 'Inconsistent legacy data aborts the migration');
  check((rejected.stdout + rejected.stderr).includes('EV2 source/license_id inconsistentes: 2'), true,
    'Migration reports both inconsistent rows explicitly');
  check(sql("select jsonb_agg(to_jsonb(e) order by e.id) from public.entitlements e;"), invalidSnapshot,
    'Failed migration does not guess or alter legacy data');
  check(sql("select count(*) from supabase_migrations.schema_migrations where version='20261006020648';"), '0',
    'Rejected migration is not recorded as applied');
  check(sql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace"
    + " where n.nspname='private' and p.proname='enforce_terminal_license_revocation';"), '0',
    'Rejected migration rolls back preceding trigger/function DDL too');
  // Restore only the test-owned, known-origin fixtures. This is not migration logic.
  sql("update public.entitlements set source='LICENSE' where id='" + entitlement + "';"
    + "update public.entitlements set source='GRANT' where user_id='" + independent + "';");

  const snapshot = sql("select to_jsonb(e) from public.entitlements e where user_id='" + independent + "';");
  copyFileSync(join(root, 'supabase', 'migrations', migration), join(dir, 'supabase', 'migrations', migration));
  // Product DDL is applied exclusively through the versioned LOCAL migration chain.
  run(cli, ['migration', 'up', '--local', '--workdir', dir, '--agent', 'no']);
  check(sql("select count(*) from supabase_migrations.schema_migrations where version='20261006020648';"), '1',
    'New migration recorded once');
  check(sql("select status from public.entitlements where id='" + entitlement + "';"), 'REVOKED',
    'Pre-existing stale dependent is reconciled');
  check(sql("select (e.revoked_at=l.revoked_at)::text from public.entitlements e join public.licenses l on l.id=e.license_id"
    + " where e.id='" + entitlement + "';"), 'true', 'Historical license revocation timestamp preserved');
  check(sql("select to_jsonb(e) from public.entitlements e where user_id='" + independent + "';"), snapshot,
    'Independent grant remains byte-for-byte unchanged');
  check(sql("select count(*) from public.access_events where event_type='LICENSE_REVOKED'"
    + " and metadata->>'license_id'='" + license + "'"
    + " and metadata->>'reason'='EV2-04 dependency reconciliation'"
    + " and metadata->'dependent_entitlement_ids' @> '[\"" + entitlement + "\"]'::jsonb;"), '1',
    'Reconciliation audit identifies the license and dependent');
  check(access(user), 0, 'Reconciled dependency grants no access');
  check(access(independent), 1, 'Independent entitlement still grants access');
  check(sql('select count(*) from public.trials;'), '0', 'Forward migration does not create a trial');
  console.log(JSON.stringify({ result: 'PASS', assertions, project, dir, local_only: true }));
  // Legacy reconciliation assertions above target only the EV2-03/04 migration.
  // Current RPC regression below must use the current chain (EV2-06 changes failures).
  for (const file of readdirSync(join(root, 'supabase', 'migrations'))) {
    if (file.endsWith('.sql') && file > migration)
      copyFileSync(join(root, 'supabase', 'migrations', file), join(dir, 'supabase', 'migrations', file));
  }
  run(cli, ['migration', 'up', '--local', '--workdir', dir, '--agent', 'no']);
  // Directly affected SQL regression only; the setup file provides its test helpers.
  mkdirSync(join(dir, 'supabase', 'tests'), { recursive: true });
  for (const file of ['000-setup-tests-hooks.sql', 'commercial_access_ev2.test.sql'])
    copyFileSync(join(root, 'supabase', 'tests', file), join(dir, 'supabase', 'tests', file));
  console.log(run(cli, ['test', 'db', '--local', '--workdir', dir, '--agent', 'no']));
} finally {
  run(cli, ['stop', '--no-backup', '--workdir', dir, '--agent', 'no']);
  const after = run('docker', ['ps', '--format', '{{.ID}} {{.Names}}']).split('\n').sort();
  assert.deepEqual(after, before, 'Pre-existing containers preserved');
  assert.equal(run('docker', ['ps', '-a', '--filter', 'name=' + project, '--format', '{{.Names}}']), '');
  assert.equal(run('docker', ['volume', 'ls', '--filter', 'name=' + project, '--format', '{{.Name}}']), '');
  console.log('Cleanup PASS; existing containers unchanged; no disposable containers or volumes');
}
