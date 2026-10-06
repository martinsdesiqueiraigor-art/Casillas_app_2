import { bancoCiclosCNC } from '../js/modules/guia/bancoCiclosCNC.js';
import { validateBank } from '../js/modules/guia/adapter.js';
validateBank(bancoCiclosCNC);
console.log('Banco CNC: '+bancoCiclosCNC.length+' ciclos válidos');
