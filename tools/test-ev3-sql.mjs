// Supabase LOCAL descartável: não usa configuração/link remoto nem stack de outra frente.
import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'casillas-ev3-')),root=resolve(import.meta.dirname,'..');
const cli=process.env.CASILLAS_SUPABASE_CLI||'supabase';
mkdirSync(join(dir,'supabase'));
let config=readFileSync(join(root,'supabase/config.toml'),'utf8')
 .replace(/^project_id = .*/m,'project_id = "Casillas_ev3_'+Date.now()+'"')
 .replaceAll('54321','55321').replaceAll('54322','55322').replaceAll('54320','55320');
writeFileSync(join(dir,'supabase/config.toml'),config);
cpSync(join(root,'supabase/migrations'),join(dir,'supabase/migrations'),{recursive:true});
cpSync(join(root,'supabase/tests'),join(dir,'supabase/tests'),{recursive:true});
function run(args){
 const r=spawnSync(cli,[...args,'--workdir',dir,'--agent','no'],{stdio:'inherit'});
 if(r.error)throw r.error;if(r.status!==0)throw new Error('CLI local falhou: '+args.join(' '));
}
try{
 run(['start','--exclude','gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor']);
 run(['db','reset','--local','--no-seed']);
 run(['test','db','--local']);
}finally{run(['stop','--no-backup']);}
