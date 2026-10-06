// @ts-check
import { bancoCiclosCNC } from '../guia/bancoCiclosCNC.js';
/** @param {import('../guia/types.js').Slots} slots @param {import('../guia/types.js').Cycle[]} bank */
export function resolveSlots(slots,bank=bancoCiclosCNC){
 let candidates=slots.codigo?bank.filter(c=>c.meta.codigo===slots.codigo):bank;
 // Código único na base resolve diretamente; não afirma exclusividade universal.
 if(!slots.codigo||candidates.length>1)candidates=candidates.filter(c=>
  (!slots.controlador||c.meta.controlador===slots.controlador)
  &&(!slots.maquina||c.meta.maquina===slots.maquina)
  &&(!!slots.codigo||!slots.operacao||c.contexto.operacao===slots.operacao));
 return {outcome:candidates.length===1?'resolved':candidates.length===0?'no_match':'ambiguous',candidates};
}
