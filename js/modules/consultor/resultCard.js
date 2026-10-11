// @ts-check
import { EVT,eventBus } from '../../core/eventBus.js';
import { createLocalId } from './localId.js';
export class ResultCard {
 /** @param {import('../../core/eventBus.js').EventBus} bus */
 constructor(bus=eventBus){this.bus=bus;/** @type {Map<string,import('../guia/types.js').Target>} */this.targets=new Map();}
 clear(){this.targets.clear();}
 /** @param {string} resultId */
 open(resultId){const target=this.targets.get(resultId);if(!target)return false;this.bus.emit(EVT.GUIDE_OPEN,{...target});return true;}
 /** @param {import('../guia/types.js').Cycle} cycle */
 render(cycle){
  const resultId=createLocalId();
  this.targets.set(resultId,Object.freeze({cycleId:cycle.meta.id,...cycle.defaultTarget}));
  const card=document.createElement('article');card.className='cs-result';
  const tag=document.createElement('span');tag.className='cs-result-tag';tag.textContent='FICHA ENCONTRADA NA BASE LOCAL';
  const title=document.createElement('h3');title.textContent=cycle.meta.titulo;
  const meta=document.createElement('div');meta.className='cs-result-meta';
  for(const value of [cycle.meta.codigo.toUpperCase(),cycle.meta.controlador,cycle.meta.maquina.replaceAll('_',' ')]){
   const chip=document.createElement('span');chip.className='cs-chip';chip.textContent=value;meta.append(chip);
  }
  const button=document.createElement('button');button.type='button';button.className='btn btn-primary';
  button.textContent='Abrir no Guia';button.dataset.action='guide-open';button.dataset.resultId=resultId;
  button.addEventListener('click',()=>this.open(button.dataset.resultId||''));
  card.append(tag,title,meta,button);return card;
 }
}
