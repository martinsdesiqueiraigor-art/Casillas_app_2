import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
function dom(){const {document}=parseHTML('<html><body><main></main></body></html>');globalThis.document=document;return document.querySelector('main');}
test('E2E G76 real: pergunta → FSM → Result Map → evento → rota → GuiaManager → renderer',async()=>{
 const {ConsultorAgent}=await import('../../js/modules/consultor/ConsultorAgent.js');
 const {ResultCard}=await import('../../js/modules/consultor/resultCard.js');
 const {EventBus,EVT}=await import('../../js/core/eventBus.js');
 const {wireGuideRouter,parseRoute}=await import('../../js/core/router.js');
 const {GuiaManager}=await import('../../js/modules/guia/GuiaManager.js');
 const {renderCycle}=await import('../../js/modules/guia/renderers/blocks.js');
 const root=dom(),bus=new EventBus(),manager=new GuiaManager(),agent=new ConsultorAgent();
 const result=agent.ask('  ROSCA   torno FANUC ').result;
 assert.equal(agent.state,'PRESENTING');assert.equal(result.candidates[0].meta.id,'fanuc_torno_g76');
 let hash='',target;const unsubscribe=wireGuideRouter(bus,manager,(h,t)=>{hash=h;target=t;});
 const card=new ResultCard(bus);root.append(card.render(result.candidates[0]));
 const button=root.querySelector('[data-action="guide-open"]');
 button.dataset.cycleId='hostile';button.dataset.tabId='hostile';button.textContent='<img src=x onerror=alert(1)>';
 assert.equal(card.open('unknown'),false);button.click();
 assert.equal(hash,'#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe');
 assert.deepEqual(manager.resolveTarget(parseRoute(hash)),target);
 root.replaceChildren();renderCycle(root,manager.lookup(target.cycleId),target);
 assert.equal(root.querySelector('[data-tab-id="referencia"]').hidden,false);
 assert.equal(root.querySelector('details[data-accordion-id="sintaxe"]').open,true);
 assert.match(root.textContent,/G76 P/);assert.equal(root.querySelector('img'),null);
 root.querySelector('[data-action="tab-exemplo"]').click();
 assert.equal(root.querySelector('[data-tab-id="exemplo"]').hidden,false);unsubscribe();
 let count=0;bus.on(EVT.GUIDE_OPEN,()=>count++);card.clear();assert.equal(card.open(button.dataset.resultId),false);assert.equal(count,0);
});
test('texto hostil renderiza apenas texto',async()=>{
 const {bancoCiclosCNC}=await import('../../js/modules/guia/bancoCiclosCNC.js');
 const {renderCycle}=await import('../../js/modules/guia/renderers/blocks.js');
 const c=structuredClone(bancoCiclosCNC[0]);c.meta.titulo='<img src=x onerror=alert(1)>';
 c.abas[0].acordeoes[0].texto=c.meta.titulo;const root=dom();
 renderCycle(root,c,{cycleId:c.meta.id,tabId:'referencia',accordionId:'sintaxe'});
 assert.ok(root.textContent.includes(c.meta.titulo));assert.equal(root.querySelector('img'),null);
});
