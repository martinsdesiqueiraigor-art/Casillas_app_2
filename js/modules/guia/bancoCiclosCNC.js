// @ts-check
import { deepFreeze } from './deepFreeze.js';
/** @type {import('./types.js').Cycle[]} */
export const bancoCiclosCNC = deepFreeze([
  {
    "meta": {
      "id": "siemens_torno_cycle97",
      "aliases": [
        "siemens-cycle97"
      ],
      "controlador": "siemens",
      "maquina": "torno",
      "codigo": "cycle97",
      "titulo": "Ciclo de Rosqueamento Longitudinal",
      "tags": [
        "rosca",
        "torneamento",
        "siemens",
        "cycle97",
        "roscamento"
      ]
    },
    "contexto": {
      "operacao": "rosca",
      "categoriaOriginal": "Rosca"
    },
    "abas": [
      {
        "id": "referencia",
        "tipo": "acordeon",
        "titulo": "Referência",
        "acordeoes": [
          {
            "id": "sintaxe",
            "titulo": "Sintaxe",
            "texto": "CYCLE97(P, L, T, F, H, D, G, I, J, K, N, Q, V)"
          },
          {
            "id": "parametros",
            "titulo": "Parâmetros",
            "parametros": [
              {
                "nome": "P",
                "desc": "Passo da rosca em mm"
              },
              {
                "nome": "L",
                "desc": "Comprimento total da rosca (absoluto)"
              },
              {
                "nome": "T",
                "desc": "Profundidade total (raio)"
              },
              {
                "nome": "F",
                "desc": "Avanço = passo (mm/rot)"
              },
              {
                "nome": "H",
                "desc": "Primeiro passo de corte (geralmente = P)"
              },
              {
                "nome": "D",
                "desc": "Número de passes de desbaste"
              },
              {
                "nome": "G",
                "desc": "Ângulo de inclinação do filete (60° métrica, 55° Whitworth)"
              },
              {
                "nome": "I",
                "desc": "Diâmetro externo maior da rosca"
              },
              {
                "nome": "J",
                "desc": "Diâmetro externo menor"
              },
              {
                "nome": "K",
                "desc": "Diâmetro interno (fundo do filete)"
              }
            ]
          }
        ]
      },
      {
        "id": "exemplo",
        "tipo": "codigo_comentado",
        "titulo": "Exemplo",
        "bloco_gcode": [
          "CYCLE97(2.5, -30, 1.84, 2.5, 2.5, 6, 60, -10, -25, -26.8, 0, 0, 1)"
        ],
        "linhas_explicadas": []
      }
    ],
    "defaultTarget": {
      "tabId": "referencia",
      "accordionId": "sintaxe"
    }
  },
  {
    "meta": {
      "id": "siemens_centro_de_usinagem_cycle83",
      "aliases": [
        "siemens-cycle83"
      ],
      "controlador": "siemens",
      "maquina": "centro_de_usinagem",
      "codigo": "cycle83",
      "titulo": "Furação Profunda com Descarga de Cavaco",
      "tags": [
        "furação",
        "furacao",
        "profunda",
        "pica-pau",
        "siemens",
        "cycle83"
      ]
    },
    "contexto": {
      "operacao": "furacao",
      "categoriaOriginal": "Furação"
    },
    "abas": [
      {
        "id": "referencia",
        "tipo": "acordeon",
        "titulo": "Referência",
        "acordeoes": [
          {
            "id": "sintaxe",
            "titulo": "Sintaxe",
            "texto": "CYCLE83(RTP, RFP, SDIS, DP, DPR, FDEP, FDPR, DAM, DTB, DTS, FRF, VARI, _AXN, _MDEP, _VRT, _DTD, _DIS1)"
          },
          {
            "id": "parametros",
            "titulo": "Parâmetros",
            "parametros": [
              {
                "nome": "RTP",
                "desc": "Plano de retorno (altura segura)"
              },
              {
                "nome": "RFP",
                "desc": "Plano de referência"
              },
              {
                "nome": "SDIS",
                "desc": "Distância de segurança"
              },
              {
                "nome": "DP",
                "desc": "Profundidade final"
              },
              {
                "nome": "FDEP",
                "desc": "Profundidade do primeiro passe"
              },
              {
                "nome": "FDPR",
                "desc": "Redução da profundidade a cada passe"
              },
              {
                "nome": "DAM",
                "desc": "Tempo de espera no fundo (segundos)"
              },
              {
                "nome": "DTB",
                "desc": "Tempo de espera no fim do retorno"
              },
              {
                "nome": "FRF",
                "desc": "Fator de avanço de entrada"
              },
              {
                "nome": "VARI",
                "desc": "Tipo de furação (0=desbaste, 1=quebra-cavaco, 2=desbaste+acabamento)"
              }
            ]
          }
        ]
      },
      {
        "id": "exemplo",
        "tipo": "codigo_comentado",
        "titulo": "Exemplo",
        "bloco_gcode": [
          "CYCLE83(50, 0, 2, -40, 0, -10, -1, 1, 0.5, 0, 1, 1, 0, 0, 0, 0, 0)"
        ],
        "linhas_explicadas": []
      }
    ],
    "defaultTarget": {
      "tabId": "referencia",
      "accordionId": "sintaxe"
    }
  },
  {
    "meta": {
      "id": "fanuc_torno_g76",
      "aliases": [
        "fanuc-g76"
      ],
      "controlador": "fanuc",
      "maquina": "torno",
      "codigo": "g76",
      "titulo": "Ciclo Automático de Roscamento",
      "tags": [
        "rosca",
        "torneamento",
        "fanuc",
        "g76",
        "roscamento"
      ]
    },
    "contexto": {
      "operacao": "rosca",
      "categoriaOriginal": "Rosca"
    },
    "abas": [
      {
        "id": "referencia",
        "tipo": "acordeon",
        "titulo": "Referência",
        "acordeoes": [
          {
            "id": "sintaxe",
            "titulo": "Sintaxe",
            "texto": "G76 P(m)(r)(a) Q(dmin) R(d)  |  G76 X(u) Z(w) P(k) Q(Δd) F(l)"
          },
          {
            "id": "parametros",
            "titulo": "Parâmetros",
            "parametros": [
              {
                "nome": "P(m)",
                "desc": "Número de passes de acabamento (01 a 99)"
              },
              {
                "nome": "P(r)",
                "desc": "Chanfro de saída (00 a 99, em 0.1 × passo)"
              },
              {
                "nome": "P(a)",
                "desc": "Ângulo da ponta da ferramenta (00=0°, 60=60°, 55=55°)"
              },
              {
                "nome": "Q(dmin)",
                "desc": "Profundidade mínima de corte (em microns)"
              },
              {
                "nome": "R(d)",
                "desc": "Sobremetal para acabamento (em microns)"
              },
              {
                "nome": "X(u)",
                "desc": "Diâmetro final do fundo da rosca (absoluto ou incremental)"
              },
              {
                "nome": "Z(w)",
                "desc": "Posição final em Z"
              },
              {
                "nome": "P(k)",
                "desc": "Altura do filete (em microns)"
              },
              {
                "nome": "Q(Δd)",
                "desc": "Profundidade do primeiro passe (em microns)"
              },
              {
                "nome": "F(l)",
                "desc": "Passo da rosca (mm/rot)"
              }
            ]
          }
        ]
      },
      {
        "id": "exemplo",
        "tipo": "codigo_comentado",
        "titulo": "Exemplo",
        "bloco_gcode": [
          "G76 P021060 Q100 R0.05",
          "G76 X17.4 Z-30.0 P1530 Q350 F2.5"
        ],
        "linhas_explicadas": []
      }
    ],
    "defaultTarget": {
      "tabId": "referencia",
      "accordionId": "sintaxe"
    }
  },
  {
    "meta": {
      "id": "fanuc_centro_de_usinagem_g83",
      "aliases": [
        "fanuc-g83"
      ],
      "controlador": "fanuc",
      "maquina": "centro_de_usinagem",
      "codigo": "g83",
      "titulo": "Ciclo de Furação Pica-Pau (Peck Drilling)",
      "tags": [
        "furação",
        "furacao",
        "profunda",
        "pica-pau",
        "fanuc",
        "g83",
        "peck"
      ]
    },
    "contexto": {
      "operacao": "furacao",
      "categoriaOriginal": "Furação"
    },
    "abas": [
      {
        "id": "referencia",
        "tipo": "acordeon",
        "titulo": "Referência",
        "acordeoes": [
          {
            "id": "sintaxe",
            "titulo": "Sintaxe",
            "texto": "G83 X(u) Y(v) Z(w) R(r) Q(q) F(f)"
          },
          {
            "id": "parametros",
            "titulo": "Parâmetros",
            "parametros": [
              {
                "nome": "X Y",
                "desc": "Coordenadas do furo"
              },
              {
                "nome": "Z",
                "desc": "Profundidade final em Z"
              },
              {
                "nome": "R",
                "desc": "Plano de retorno (altura segura)"
              },
              {
                "nome": "Q",
                "desc": "Profundidade de cada pique (incremental)"
              },
              {
                "nome": "F",
                "desc": "Avanço de corte (mm/min)"
              }
            ]
          }
        ]
      },
      {
        "id": "exemplo",
        "tipo": "codigo_comentado",
        "titulo": "Exemplo",
        "bloco_gcode": [
          "G83 X50.0 Y0.0 Z-40.0 R5.0 Q5.0 F100.0"
        ],
        "linhas_explicadas": []
      }
    ],
    "defaultTarget": {
      "tabId": "referencia",
      "accordionId": "sintaxe"
    }
  }
]);
