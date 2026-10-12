// trajetoria.js — Modelo DIDÁTICO de desbaste longitudinal em passes.
// CAS22-BIB-APRENDER-PILOTO-01 · funções puras, testáveis em Node.
//
// Não é o cálculo de nenhum controle CNC e não corresponde a um código G71.
// Trabalha em "unidades do desenho" (sem milímetros) para não sugerir valores
// de máquina. Convenção do torno: Z = 0 na face direita, Z cresce para a
// esquerda (em direção à placa); r = raio a partir da linha de centro.

/** Peça-exemplo: eixo escalonado. Degraus da direita para a esquerda, raio crescente. */
export const PECA = Object.freeze({
  comprimento: 100,
  raioBruto: 30,
  degraus: Object.freeze([
    Object.freeze({ zIni: 0, zFim: 25, r: 12 }),
    Object.freeze({ zIni: 25, zFim: 50, r: 18 }),
    Object.freeze({ zIni: 50, zFim: 75, r: 24 }),
    // Trecho preso na placa: mesmo raio do bruto, não é usinado.
    Object.freeze({ zIni: 75, zFim: 100, r: 30 }),
  ]),
});

/** Opções qualitativas (sem endereços nem números de máquina). */
export const PROFUNDIDADES = Object.freeze([
  { id: 'pequena', label: 'Pequena', valor: 2.5 },
  { id: 'media', label: 'Média', valor: 5 },
  { id: 'grande', label: 'Grande', valor: 8 },
]);
export const SOBREMETAIS = Object.freeze([
  { id: 'sem', label: 'Sem', valor: 0 },
  { id: 'com', label: 'Com', valor: 2 },
]);

/**
 * Perfil deslocado pelo sobremetal: cada degrau sobe `a` no raio e cada
 * ressalto anda `a` para a direita (fica mais material na face do degrau).
 * @param {typeof PECA} peca @param {number} a
 */
export function perfilComSobremetal(peca, a) {
  return peca.degraus.map((d, i) => ({
    zIni: i === 0 ? d.zIni : Math.max(0, d.zIni - a),
    zFim: i === peca.degraus.length - 1 ? d.zFim : Math.max(0, d.zFim - a),
    r: Math.min(d.r + a, peca.raioBruto),
  }));
}

/**
 * Até onde (em Z) um passe no raio `y` pode ir antes de encostar no perfil
 * deslocado. Retorna o Z do primeiro ressalto mais alto que `y`.
 * @param {{zIni:number,zFim:number,r:number}[]} perfil @param {number} y @param {number} comprimento
 */
export function fimDoPasse(perfil, y, comprimento) {
  for (const d of perfil) if (d.r > y + 1e-9) return d.zIni;
  return comprimento;
}

/**
 * Calcula os passes de desbaste do modelo didático.
 * Níveis = descidas iguais a partir do bruto + um nível em cada degrau,
 * para que o material restante seja exatamente o sobremetal.
 * @param {{profundidade:number, sobremetal:number, peca?: typeof PECA}} opcoes
 * @returns {{passes:{n:number,y:number,yAnterior:number,zFim:number}[], perfil:{zIni:number,zFim:number,r:number}[]}}
 */
export function calcularPasses({ profundidade, sobremetal, peca = PECA }) {
  if (!(profundidade > 0) || !(sobremetal >= 0)) return { passes: [], perfil: [] };
  const perfil = perfilComSobremetal(peca, sobremetal);
  const R = peca.raioBruto;
  const fundo = Math.min(...perfil.map((d) => d.r));

  const niveis = new Set();
  for (let y = R - profundidade; y > fundo + 1e-9 && niveis.size < 200; y -= profundidade) niveis.add(round(y));
  for (const d of perfil) if (d.r < R - 1e-9) niveis.add(round(d.r));
  const ordenados = [...niveis].sort((x, y) => y - x);
  // Remove níveis muito próximos (passe sem material útil).
  const filtrados = ordenados.filter((y, i) => i === 0 || ordenados[i - 1] - y > 0.75 || perfil.some((d) => round(d.r) === y));

  const passes = [];
  let anterior = R;
  for (const y of filtrados) {
    const zFim = fimDoPasse(perfil, y, peca.comprimento);
    if (zFim > 0) passes.push({ n: passes.length + 1, y, yAnterior: anterior, zFim });
    anterior = y;
  }
  return { passes, perfil };
}

/** @param {number} v */
function round(v) {
  return Math.round(v * 100) / 100;
}
