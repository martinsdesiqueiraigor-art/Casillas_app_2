// @ts-check
import { bancoCiclosCNC } from './bancoCiclosCNC.js';
import { validateBank } from './adapter.js';
export class GuiaManager {
 /** @param {import('./types.js').Cycle[]} bank */
 constructor(bank=bancoCiclosCNC){validateBank(bank);this.bank=bank;}
 /** @param {string} id */
 lookup(id){return this.bank.find(c=>c.meta.id===id||c.meta.aliases.includes(id))||null;}
 /** @param {import('./types.js').Target|null} requested @returns {import('./types.js').Target|null} */
 resolveTarget(requested){
  if(!requested)return null;const c=this.lookup(requested.cycleId);if(!c)return null;
  const tabId=requested.tabId||c.defaultTarget.tabId;
  const tab=c.abas.find(t=>t.id===tabId);if(!tab)return null;
  const accordionId=requested.accordionId||(tabId===c.defaultTarget.tabId?c.defaultTarget.accordionId:undefined);
  if(accordionId&&!tab.acordeoes?.some(a=>a.id===accordionId))return null;
  return {cycleId:c.meta.id,tabId,...(accordionId?{accordionId}:{})};
 }
}
