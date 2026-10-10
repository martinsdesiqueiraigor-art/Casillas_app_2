// @ts-check
// Divisão estimada dos passes de rosca (modelo √n). Estimativa didática, não o cálculo do controle.

/** @typedef {{k:number,dd:number,dmin:number,d:number,m:number}} Trajetoria valores em microns, m = passes de acabamento */
/** @typedef {{d:number,inc:number,tipo:'desbaste'|'acabamento'}} Passe */

/** @param {Trajetoria} t @returns {Passe[]} */
export function calcularPasses(t) {
  const valores = [t.k, t.dd, t.dmin, t.d, t.m];
  if (!valores.every(Number.isFinite) || t.k <= 0 || t.dd <= 0 || t.dmin < 0 || t.d < 0 || t.m < 0) return [];
  /** @type {Passe[]} */
  const passes = [];
  const alvo = t.k - t.d;
  let anterior = 0;
  for (let n = 1; anterior < alvo && n < 200; n++) {
    const profundidade = Math.min(Math.max(t.dd * Math.sqrt(n), anterior + t.dmin), alvo);
    passes.push({ d: profundidade, inc: profundidade - anterior, tipo: 'desbaste' });
    anterior = profundidade;
  }
  for (let i = 0; i < Math.min(Math.floor(t.m), 20); i++) {
    passes.push({ d: t.k, inc: i ? 0 : t.k - anterior, tipo: 'acabamento' });
    anterior = t.k;
  }
  return passes;
}

/** @param {number} microns */
export function formatarMm(microns) {
  return (microns / 1000).toFixed(3).replace('.', ',');
}
