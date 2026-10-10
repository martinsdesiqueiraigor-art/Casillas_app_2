import ts from 'typescript';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'../..'),read=p=>readFileSync(resolve(root,p),'utf8');
function files(dir){return readdirSync(resolve(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
const runtime=[...files('js/core'),...files('js/modules/consultor'),...files('js/modules/guia')].filter(p=>p.endsWith('.js'));
test('precache contém todo runtime EV3 e nenhum path ausente',()=>{
 const sw=read('service-worker.js');assert.match(sw,/casillas-v19/);
 const assets=[...sw.match(/const CACHE_ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 for(const path of assets)assert.ok(existsSync(resolve(root,path)),path);
 for(const path of runtime)assert.ok(assets.includes('./'+path),path+' ausente no precache');
 for(const path of runtime){
  const source=ts.createSourceFile(path,read(path),ts.ScriptTarget.Latest,true);
  const dependencies=[];
  function visit(node){
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))dependencies.push(node.moduleSpecifier.text);
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))dependencies.push(node.arguments[0].text);
   ts.forEachChild(node,visit);
  }
  visit(source);
  for(const dependency of dependencies){
   if(!dependency.startsWith('.'))continue;const p=resolve(root,dirname(path),dependency);
   assert.ok(assets.some(a=>resolve(root,a)===p),'dependência não precacheada: '+p);
  }
 }
});
test('DOM gate focalizado: sem sinks, eval ou configuração paralela',()=>{
 for(const path of [...runtime,'js/modules/guia.js','js/db.js','js/app.js']){
  const s=read(path);assert.match(s,/\/\/ @ts-check/);
  assert.doesNotMatch(s,/\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\s*\(|new Function)\b/,path);
  assert.doesNotMatch(s,/import\.meta\.env|service_role|createClient\s*\(/,path);
 }
});
test('Consultoria legada permanece com identidade consult',()=>{
 assert.ok(existsSync(resolve(root,'js/modules/consult.js')));
 assert.match(read('js/app.js'),/consult:\s*\(\) => import\('\.\/modules\/consult\.js'\)/);
 assert.match(read('js/app.js'),/'consultor-tecnico':\s*\(\) => import\('\.\/modules\/consultor\/index\.js'\)/);
});
test('SW mantém exatamente a estratégia baseline além de versão/lista',()=>{
 const normalized=read('service-worker.js').replace(/const CACHE_VERSION = [^;]+;/,'VERSION').replace(/const CACHE_ASSETS = \[[\s\S]*?\];/,'ASSETS').replace(/\r\n/g,'\n');
 assert.equal(createHash('sha256').update(normalized).digest('hex'),'036a05b25c719f84ab6c7fcf0ad4b7b6426fdc245e2318ddfb1dd1b1e8bf477a');
});
