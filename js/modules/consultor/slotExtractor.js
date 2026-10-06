// @ts-check
import { bancoCiclosCNC } from '../guia/bancoCiclosCNC.js';
/** @param {string} text */
export function normalize(text){return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ');}
/** @param {string} text @param {import('../guia/types.js').Cycle[]} bank @returns {import('../guia/types.js').Slots} */
export function extractSlots(text,bank=bancoCiclosCNC){
 const n=normalize(text);
 const tokens=new Set(n.split(/[^a-z0-9_]+/));
 /** @type {import('../guia/types.js').Slots} */
 const slots={};
 const controllers=[...new Set(bank.map(c=>c.meta.controlador))].filter(c=>tokens.has(c));
 if(controllers.length===1)slots.controlador=controllers[0];
 const machines=[...new Set(bank.map(c=>c.meta.maquina))].filter(m=>m==='torno'?tokens.has(m):n.includes(m.replaceAll('_',' ')));
 if(machines.length===1)slots.maquina=machines[0];
 const ops=[...new Set(bank.map(c=>c.contexto.operacao))].filter(op=>tokens.has(op)||bank.some(c=>c.contexto.operacao===op&&c.meta.tags.some(t=>tokens.has(normalize(t))&& ![c.meta.codigo,c.meta.controlador].includes(normalize(t)))));
 if(ops.length===1)slots.operacao=ops[0];
 // Reconhecer uma solicitação de código ausente permite "não encontrado"; não cria catálogo.
 const codes=[...new Set(n.match(/\b(?:g\d+|cycle\d+)\b/g)||[])];
 if(codes.length===1)slots.codigo=codes[0];
 return slots;
}
