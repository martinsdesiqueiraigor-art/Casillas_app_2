// @ts-check
import { EVT } from './eventBus.js';
/** @param {import('../modules/guia/types.js').Target} target */
export function encodeRoute(target){
 const params=new URLSearchParams();if(target.tabId)params.set('tab',target.tabId);if(target.accordionId)params.set('acc',target.accordionId);
 return '#/guia/'+encodeURIComponent(target.cycleId)+(params.size?'?'+params.toString():'');
}
/** @param {string} hash @returns {import('../modules/guia/types.js').Target|null} */
export function parseRoute(hash){
 try{
  const match=/^#\/guia\/([^?]+)(?:\?(.*))?$/.exec(hash);if(!match)return null;
  const params=new URLSearchParams(match[2]||'');
  return {cycleId:decodeURIComponent(match[1]),...(params.has('tab')?{tabId:params.get('tab')||''}:{}),...(params.has('acc')?{accordionId:params.get('acc')||''}:{})};
 }catch{return null;}
}
/** @param {import('./eventBus.js').EventBus} bus @param {import('../modules/guia/GuiaManager.js').GuiaManager} manager @param {(hash:string,target:import('../modules/guia/types.js').Target|null)=>void} navigate */
export function wireGuideRouter(bus,manager,navigate){
 return bus.on(EVT.GUIDE_OPEN,target=>{const valid=manager.resolveTarget(target);navigate(valid?encodeRoute(valid):'#/guia',valid);});
}
