// @ts-check
// Conteúdo estendido do Guia (schema_version 2), separado do banco canônico.
// RASCUNHO: todo conteúdo aqui nasce "em_revisao" até conferência técnica do Igor (D2/D3).

/**
 * @typedef {{t:string,l:[string,string][]}} Passo
 * @typedef {{
 *   variante:string, status:'em_revisao'|'revisado', fonte:string, contexto:string[], aplicacao:string,
 *   precond:string[], obs:string[], sintaxe:[string,string][], params:[string,string,string][],
 *   exp:Record<string,[string,string]>, passos:Passo[], cod:string, calc:string, calcKey:string,
 *   traj:import('./trajetoria.js').Trajetoria, avisoMicron:string,
 *   cuid:{erros:string[],lim:string[],rev:string}
 * }} ConteudoCiclo
 */

/** @type {{schema_version:number, ciclos:Record<string,ConteudoCiclo>}} */
export const CONTEUDO_V2 = {
  schema_version: 2,
  ciclos: {
    fanuc_torno_g76: {
      variante: '0i-TF · Sistema A',
      status: 'em_revisao',
      fonte: 'Manual de programação Fanuc 0i-TF (conferir capítulo do ciclo de rosqueamento).',
      contexto: ['Plano G18', 'X em diâmetro', 'Unidades: mm'],
      aplicacao: 'Rosca externa ou interna em vários passes, com um único comando em dois blocos. O controle calcula a profundidade de cada passe.',
      precond: [
        'Rotação constante (G97) com a velocidade da rosca definida.',
        'Ferramenta de rosca posicionada no ponto inicial, afastada do material.',
        'Passo F igual ao passo real da rosca.'
      ],
      obs: [
        'Os dois blocos G76 são lidos em sequência. Não coloque outros comandos entre eles.',
        'Valores P(k), Q(Δd) e Q(Δdmin) são inseridos em microns, sem ponto decimal.',
        'Confira no manual da sua máquina o formato do primeiro bloco (P e Q).'
      ],
      sintaxe: [
        ['Bloco 1', 'G76 P(m)(r)(a) Q(Δdmin) R(d)'],
        ['Bloco 2', 'G76 X(u) Z(w) R(i) P(k) Q(Δd) F(l)']
      ],
      params: [
        ['P(m)', 'Número de passes de acabamento', '01 a 99'],
        ['P(r)', 'Chanfro de saída', '00 a 99, em 0,1 × passo'],
        ['P(a)', 'Ângulo da ponta da ferramenta', '00, 29, 30, 55, 60 ou 80 graus'],
        ['Q(Δdmin)', 'Profundidade mínima de corte', 'em microns'],
        ['R(d)', 'Sobremetal para acabamento', 'em mm (raio)'],
        ['X(u)', 'Diâmetro final do fundo da rosca', 'absoluto ou incremental'],
        ['Z(w)', 'Posição final em Z', 'absoluto ou incremental'],
        ['R(i)', 'Conicidade da rosca', '0 para rosca reta'],
        ['P(k)', 'Altura do filete', 'em microns'],
        ['Q(Δd)', 'Profundidade do primeiro passe', 'em microns'],
        ['F(l)', 'Passo da rosca', 'mm/rot']
      ],
      exp: {
        'P(m)': ['Quantos passes de acabamento o controle faz no fundo da rosca, depois do desbaste, sem remover mais material.', 'Dois dígitos: 02 = dois passes. Em P021060, m = 02.'],
        'P(r)': ['Define a saída em chanfro no fim da rosca, para a ferramenta sair sem deixar marca.', 'Exemplo: 10 = 1,0 × passo. Em P021060, r = 10.'],
        'P(a)': ['Ângulo da ponta da ferramenta de rosca. Define o ângulo do filete.', 'Rosca métrica ISO usa 60. Em P021060, a = 60.'],
        'Q(Δdmin)': ['Profundidade mínima de corte por passe. Evita passes tão finos que só raspam o material.', 'Exemplo: 100 = 0,1 mm.'],
        'R(d)': ['Sobremetal deixado para os passes de acabamento.', 'No exemplo, 0.05 mm no raio. Confira o formato no manual da sua máquina.'],
        'X(u)': ['Diâmetro do fundo da rosca, onde o último passe termina.', 'No exemplo, fundo em Ø17,4.'],
        'Z(w)': ['Posição final da rosca em Z.', 'Valor negativo, para dentro da peça. No exemplo, Z-30.'],
        'R(i)': ['Diferença de raio entre o início e o fim da rosca. Serve para rosca cônica.', 'Use 0 para rosca reta.'],
        'P(k)': ['Altura do filete, medida no raio.', 'Exemplo: 1530 = 1,530 mm.'],
        'Q(Δd)': ['Profundidade do primeiro passe de desbaste.', 'Exemplo: 350 = 0,35 mm.'],
        'F(l)': ['Passo da rosca, em mm por rotação.', 'Deve ser igual ao passo real da rosca.']
      },
      passos: [
        { t: 'Preparação e estados iniciais', l: [
          ['G18 G21 G97 S800 M03', 'Plano XZ, milímetros, rotação constante, fuso ligado.'],
          ['T0404', 'Chama a ferramenta de rosca.'],
          ['G00 X22.0 Z5.0', 'Aproxima do ponto inicial, fora do material.']
        ] },
        { t: 'Definição do ciclo e do perfil', l: [
          ['G76 P021060 Q100 R0.05', '02 passes de acabamento, chanfro 1,0 × passo, ponta de 60°, corte mínimo 0,1 mm, sobremetal 0,05 mm.'],
          ['G76 X17.4 Z-30.0 R0 P1530 Q350 F2.5', 'Fundo da rosca em Ø17,4, até Z-30, rosca reta, filete de 1,530 mm, primeiro passe 0,35 mm, passo 2,5.']
        ] },
        { t: 'Acabamento e encerramento', l: [
          ['G00 X100.0 Z100.0', 'Retira a ferramenta para a posição segura.'],
          ['M05', 'Para o fuso.']
        ] }
      ],
      cod: 'G76 P021060 Q100 R0.05\nG76 X17.4 Z-30.0 R0 P1530 Q350 F2.5',
      calc: 'Roscas (3 rolos)',
      calcKey: 'rosca',
      traj: { k: 1530, dd: 350, dmin: 100, d: 50, m: 2 },
      avisoMicron: 'P(k), Q(Δd) e Q(Δdmin) vão em microns, sem ponto decimal.',
      cuid: {
        erros: [
          'Passo F diferente do passo real da rosca.',
          'Sem distância de entrada em Z (use cerca de 3 × passo): o primeiro filete sai irregular.',
          'Q(Δd), Q(Δdmin) e P(k) digitados em mm em vez de microns.',
          'Ponto inicial com X dentro do diâmetro da peça: a ferramenta bate na entrada.',
          'Rotação variável (G96) durante a rosca. Use G97 com rotação constante.',
          'Esquecer o R(i) no segundo bloco: a rosca sai cônica ou inesperada.'
        ],
        lim: [
          'Exemplo de rosca externa reta, X em diâmetro, em mm.',
          'Não cobre rosca interna, rosca cônica nem rosca de várias entradas.',
          'Formato dos blocos conforme Fanuc 0i-TF Sistema A. Outros controles podem exigir outro formato.'
        ],
        rev: 'Revisão técnica pendente. Responsável e data a definir antes de marcar como revisado.'
      }
    }
  }
};
