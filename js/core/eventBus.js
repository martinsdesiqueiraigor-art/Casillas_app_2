// @ts-check
/** @typedef {import('../modules/guia/types.js').Target} Target */
export const EVT=Object.freeze({GUIDE_OPEN:'casillas:guide-open'});
export class EventBus {
 constructor(){/** @type {Map<string,Set<(target:Target)=>void>>} */this.listeners=new Map();}
 /** @param {string} event @param {(target:Target)=>void} handler */
 on(event,handler){if(!this.listeners.has(event))this.listeners.set(event,new Set());this.listeners.get(event)?.add(handler);return ()=>{this.listeners.get(event)?.delete(handler);};}
 /** @param {string} event @param {Target} target */
 emit(event,target){for(const handler of this.listeners.get(event)||[])handler({...target});}
}
export const eventBus=new EventBus();
