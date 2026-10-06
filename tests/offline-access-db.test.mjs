// Disposable LOCAL-only contract tests. Never links or contacts a remote database.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const cli = process.env.CASILLAS_SUPABASE_CLI || 'supabase';
const dir = mkdtempSync(join(tmpdir(), 'casillas-ev202-'));
const project = 'Casillas_ev202_' + Date.now();
function run(command, args) {
 const r = spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
 if(r.error) throw r.error;
 console.log(r.stdout + r.stderr);
 assert.equal(r.status,0,command+' exit code');
 return r.stdout;
}
const before=run('docker',['ps','--format','{{.ID}} {{.Names}}']).trim();
mkdirSync(join(dir,'supabase','migrations'),{recursive:true});
mkdirSync(join(dir,'supabase','tests'),{recursive:true});
writeFileSync(join(dir,'supabase','config.toml'),readFileSync(join(root,'supabase','config.toml'),'utf8')
 .replace(/^project_id\s*=.*$/m,'project_id = "'+project+'"')
 .replace(/\b5432([0-9])\b/g,(_,d)=>'5682'+d));
for(const f of readdirSync(join(root,'supabase','migrations')))
 if(f.endsWith('.sql')) copyFileSync(join(root,'supabase','migrations',f),join(dir,'supabase','migrations',f));
for(const f of ['000-setup-tests-hooks.sql','offline_access_v2.test.sql'])
 copyFileSync(join(root,'supabase','tests',f),join(dir,'supabase','tests',f));
try {
 run(cli,['start','--workdir',dir,'--agent','no','--exclude','gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor']);
 run(cli,['test','db','--local','--workdir',dir,'--agent','no']);
} finally {
 run(cli,['stop','--workdir',dir,'--agent','no','--no-backup']);
 assert.equal(run('docker',['ps','--format','{{.ID}} {{.Names}}']).trim(),before,'original containers preserved');
}
console.log('EV2-02 LOCAL contract + cleanup PASS');
