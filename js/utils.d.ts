// Typed boundary for unchanged legacy DOM helpers.
export function createElementSafe<K extends keyof HTMLElementTagNameMap>(tag:K,attrs?:Record<string,any>,children?:Node[]):HTMLElementTagNameMap[K];
export function showToast(message:string,type?:string):void;
