import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
function run(args){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run(['tools/validate-bancoCiclos.mjs']);
run(['--test',...readdirSync('tests/ev3').filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/ev3/'+p)]);
run(['node_modules/typescript/bin/tsc','-p','tools/tsconfig.ev3.json']);
run(['node_modules/eslint/bin/eslint.js','-c','tools/eslint.ev3.config.mjs','js/core','js/modules/consultor','js/modules/guia','js/modules/guia.js','js/db.js','js/app.js']);
console.log('EV3: banco, testes, checkJs e ESLint PASS');
