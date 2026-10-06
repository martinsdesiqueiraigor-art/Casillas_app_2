import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
test('EV3 disponibiliza banco próprio', () => assert.ok(existsSync(new URL('../../js/modules/guia/bancoCiclosCNC.js',import.meta.url)),'banco canônico ausente'));
test('paridade e deepFreeze dos quatro ciclos reais', async () => {
 const {bancoCiclosCNC:b}=await import('../../js/modules/guia/bancoCiclosCNC.js');
 const {validateBank}=await import('../../js/modules/guia/adapter.js');
 const legacy=JSON.parse(readFileSync(new URL('../../dados/guia_cnc.json',import.meta.url)));
 assert.equal(b.length,4); validateBank(b);
 for(const i of legacy.itens){const c=b.find(c=>c.meta.aliases.includes(i.id)); assert.ok(c);
 assert.equal(c.meta.titulo,i.titulo);assert.equal(c.contexto.categoriaOriginal,i.categoria);assert.deepEqual(c.meta.tags,i.tags);
 assert.equal(c.abas[0].acordeoes[0].texto,i.sintaxe);assert.deepEqual(c.abas[0].acordeoes[1].parametros,i.parametros);
 assert.equal(c.abas[1].bloco_gcode.join('\n'),i.exemplo);assert.deepEqual(c.abas[1].linhas_explicadas,[]);
 assert.ok(Object.isFrozen(c.abas[0].acordeoes));}
 assert.throws(()=>{b[0].meta.id='changed'},TypeError);
});
test('normalização, acentos, case, espaços e slots',async()=>{
 const {normalize,extractSlots}=await import('../../js/modules/consultor/slotExtractor.js');
 assert.equal(normalize('  FURAÇÃO   FaNuC  '),'furacao fanuc');
 assert.deepEqual(extractSlots('rosca torno fanuc'),{controlador:'fanuc',maquina:'torno',operacao:'rosca'});
 assert.deepEqual(extractSlots('FURAÇÃO centro de usinagem SIEMENS'),{controlador:'siemens',maquina:'centro_de_usinagem',operacao:'furacao'});
 assert.equal(extractSlots('G76').codigo,'g76');assert.equal(extractSlots('G71').codigo,'g71');assert.equal(extractSlots('fanuc-g76').codigo,'g76');
});
test('resolver único, ambíguo e sem resultado',async()=>{
 const {resolveSlots}=await import('../../js/modules/consultor/resolver.js');
 assert.equal(resolveSlots({controlador:'fanuc',maquina:'torno',operacao:'rosca'}).candidates[0].meta.id,'fanuc_torno_g76');
 assert.equal(resolveSlots({codigo:'g76'}).outcome,'resolved');
 assert.equal(resolveSlots({codigo:'g76',controlador:'siemens'}).outcome,'resolved');
 assert.equal(resolveSlots({codigo:'g71',controlador:'fanuc'}).outcome,'no_match');
 assert.equal(resolveSlots({}).outcome,'ambiguous');
});
test('FSM e slot filling mantêm interação; fixture isolada prova código ambíguo',async()=>{
 const {ConsultorAgent}=await import('../../js/modules/consultor/ConsultorAgent.js');
 const {bancoCiclosCNC:b}=await import('../../js/modules/guia/bancoCiclosCNC.js');
 const a=new ConsultorAgent();assert.equal(a.state,'IDLE');assert.throws(()=>a.transition('FEEDBACK'));
 assert.equal(a.ask('rosca').state,'FILLING_SLOTS');const id=a.interactionId;
 assert.equal(a.ask('torno fanuc').state,'PRESENTING');assert.equal(a.interactionId,id);
 assert.equal(a.result.candidates[0].meta.id,'fanuc_torno_g76');a.transition('FEEDBACK');a.reset();assert.equal(a.state,'IDLE');
 a.ask('G76');assert.notEqual(a.interactionId,id);
 const fixture=structuredClone(b.filter(c=>c.meta.maquina==='torno'));fixture[0].meta.codigo='g76';
 const amb=new ConsultorAgent(fixture);assert.equal(amb.ask('G76').state,'FILLING_SLOTS');assert.equal(amb.ask('fanuc').state,'PRESENTING');
 const no=new ConsultorAgent();assert.equal(no.ask('G71').result.outcome,'no_match');assert.equal(no.result.candidates.length,0);
});
test('validação rejeita IDs, aliases, enums, abas, acordeões, defaults e conteúdo inválido',async()=>{
 const {bancoCiclosCNC:b}=await import('../../js/modules/guia/bancoCiclosCNC.js');const {validateBank}=await import('../../js/modules/guia/adapter.js');
 const changes=[b=>b.push(structuredClone(b[0])),b=>b[1].meta.aliases.push(b[0].meta.aliases[0]),b=>b[0].meta.controlador='unknown',b=>b[0].meta.maquina='',b=>b[0].meta.codigo='',b=>b[0].meta.titulo='',b=>b[0].abas.push(structuredClone(b[0].abas[0])),b=>b[0].abas[0].acordeoes.push(structuredClone(b[0].abas[0].acordeoes[0])),b=>b[0].abas[0].tipo='unknown',b=>b[0].defaultTarget.tabId='missing',b=>b[0].defaultTarget.accordionId='missing',b=>b[0].defaultTarget.tabId='exemplo',b=>b[0].abas[1].bloco_gcode='not-array',b=>delete b[0].abas[0].acordeoes[0].texto];
 for(const change of changes){const copy=structuredClone(b);change(copy);assert.throws(()=>validateBank(copy));}
});
test('router encode/decode, alias, defaults e rejeição semântica',async()=>{
 const {GuiaManager}=await import('../../js/modules/guia/GuiaManager.js');const {encodeRoute,parseRoute}=await import('../../js/core/router.js');
 const m=new GuiaManager();const t=m.resolveTarget({cycleId:'fanuc-g76'});
 assert.deepEqual(t,{cycleId:'fanuc_torno_g76',tabId:'referencia',accordionId:'sintaxe'});
 assert.equal(encodeRoute(t),'#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe');assert.deepEqual(parseRoute(encodeRoute(t)),t);
 assert.equal(m.resolveTarget(parseRoute('#/guia/fanuc_torno_g76')).tabId,'referencia');
 assert.equal(m.resolveTarget({cycleId:t.cycleId,tabId:'exemplo'}).accordionId,undefined);
 for(const hash of ['#/guia/missing','#/guia/fanuc_torno_g76?tab=bad','#/guia/fanuc_torno_g76?tab=exemplo&acc=sintaxe','#/guia/%ZZ','#/guia/fanuc_torno_g76?acc=missing'])assert.equal(m.resolveTarget(parseRoute(hash)),null);
 const special={cycleId:'a/b',tabId:'a & b',accordionId:'a?b'};assert.deepEqual(parseRoute(encodeRoute(special)),special);
});
