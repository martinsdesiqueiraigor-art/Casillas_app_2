// consult.js (module) — UI do módulo Consultoria
// Contato direto + serviços + cursos + comunidade + ativação.

import { createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';
import { WHATSAPP } from '../trial.js';

// ═══════════════════════════════════════════════════════════
// LINKS
// ═══════════════════════════════════════════════════════════
const LINKS = {
  whatsapp:     `https://wa.me/${WHATSAPP}`,
  instagram:    'https://instagram.com/casillas_usinagem.br',
  youtube:      'https://youtube.com/@Casillasusinagembr',
  grupoWhatsapp: 'https://chat.whatsapp.com/Idw4zuVdlOW1oZf3DZLZ75'
};

// ═══════════════════════════════════════════════════════════
// SERVIÇOS
// ═══════════════════════════════════════════════════════════
const SERVICOS = [
  { icon: '🔩', titulo: 'Torneamento CNC',     desc: 'Programação, otimização de ciclos e cálculo de parâmetros.' },
  { icon: '⚙️', titulo: 'Fresamento CNC',      desc: 'Estratégias de desbaste, acabamento e fixação.' },
  { icon: '🖥️', titulo: 'Programação CNC',     desc: 'Fanuc Macro B, Siemens, Mach3 e ajustes finos.' },
  { icon: '🔧', titulo: 'Ferramental',         desc: 'Projetos de dispositivos, gabaritos e chavetas.' },
  { icon: '💼', titulo: 'Consultoria técnica', desc: 'Análise de processos e redução de tempo de ciclo.' },
  { icon: '🎓', titulo: 'Treinamento',         desc: 'Aulas in-company para operadores e programadores.' }
];

// ═══════════════════════════════════════════════════════════
// CURSOS
// ═══════════════════════════════════════════════════════════
const CURSOS = [
  {
    icon: '📘',
    titulo: 'Programação CAM',
    desc: 'Do zero ao avançado — Mastercam, Fusion 360 e estratégias de usinagem.'
  },
  {
    icon: '📗',
    titulo: 'SolidWorks',
    desc: 'Modelagem 3D, montagem, desenho técnico e preparação para fabricação.'
  },
  {
    icon: '📙',
    titulo: 'Programação Parametrizada',
    desc: 'Fanuc Macro B, variáveis, subprogramas e automação de ciclos.'
  }
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function abrirLink(url) {
  window.open(url, '_blank');
}

function abrirWhatsApp(mensagem) {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

function botaoLink(texto, url, classe = 'btn btn-secondary') {
  return createElementSafe('button', {
    type: 'button',
    class: classe,
    text: texto,
    onclick: () => abrirLink(url)
  });
}

// ═══════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════
export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Consultoria', '💬');

  // ─── Card 1: Contato direto ───
  const cardContato = createElementSafe('div', { class: 'card' });
  cardContato.appendChild(createElementSafe('h2', {
    class: 'card-title',
    text: '📞 Contato direto'
  }));
  cardContato.appendChild(createElementSafe('p', {
    class: 'result-hint',
    text: 'Fale conosco pelos canais abaixo:'
  }));

  const btnsContato = createElementSafe('div', { class: 'btn-row' });
  btnsContato.appendChild(createElementSafe('button', {
    type: 'button',
    class: 'btn btn-primary',
    text: '📱 WhatsApp',
    onclick: () => abrirWhatsApp('Olá! Vim pelo Casillas App.')
  }));
  btnsContato.appendChild(botaoLink('👥 Entrar no Grupo', LINKS.grupoWhatsapp, 'btn btn-outline'));
  btnsContato.appendChild(botaoLink('📷 Instagram', LINKS.instagram, 'btn btn-outline'));
  btnsContato.appendChild(botaoLink('🎥 YouTube', LINKS.youtube, 'btn btn-outline'));
  cardContato.appendChild(btnsContato);
  container.appendChild(cardContato);

  // ─── Card 2: Serviços de Usinagem ───
  const cardServicos = createElementSafe('div', { class: 'card' });
  cardServicos.appendChild(createElementSafe('h3', {
    class: 'card-title',
    text: '🔧 Serviços de Usinagem'
  }));

  const listaServicos = createElementSafe('div', { class: 'consult-grid' });
  SERVICOS.forEach((s) => {
    const card = createElementSafe('div', {
      class: 'consult-card',
      role: 'button',
      tabindex: '0',
      onclick: () => abrirWhatsApp(`Olá! Gostaria de saber mais sobre: ${s.titulo}`)
    }, [
      createElementSafe('span', { class: 'cc-icon', text: s.icon }),
      createElementSafe('span', { class: 'cc-title', text: s.titulo }),
      createElementSafe('span', { class: 'cc-desc', text: s.desc })
    ]);
    listaServicos.appendChild(card);
  });
  cardServicos.appendChild(listaServicos);
  container.appendChild(cardServicos);

  // ─── Card 3: Cursos ───
  const cardCursos = createElementSafe('div', { class: 'card' });
  cardCursos.appendChild(createElementSafe('h3', {
    class: 'card-title',
    text: '🎓 Cursos disponíveis'
  }));

  const listaCursos = createElementSafe('div', { class: 'consult-grid' });
  CURSOS.forEach((c) => {
    const card = createElementSafe('div', {
      class: 'consult-card',
      role: 'button',
      tabindex: '0',
      onclick: () => abrirWhatsApp(`Olá! Tenho interesse no curso: ${c.titulo}`)
    }, [
      createElementSafe('span', { class: 'cc-icon', text: c.icon }),
      createElementSafe('span', { class: 'cc-title', text: c.titulo }),
      createElementSafe('span', { class: 'cc-desc', text: c.desc }),
      createElementSafe('span', {
        class: 'cc-extra',
        text: '💰 Sob consulta',
        style: { color: 'var(--accent-primary)', fontWeight: '700', fontSize: '11px', marginTop: '4px' }
      })
    ]);
    listaCursos.appendChild(card);
  });
  cardCursos.appendChild(listaCursos);
  container.appendChild(cardCursos);

  // ─── Card 5: Ativação ───
  const cardAtivacao = createElementSafe('div', { class: 'card' });
  cardAtivacao.appendChild(createElementSafe('h3', {
    class: 'card-title',
    text: '🔑 Ativação de licença'
  }));
  cardAtivacao.appendChild(createElementSafe('p', {
    class: 'result-hint',
    text: 'Para ativar o app ou renovar sua licença, entre em contato.'
  }));

  const btnsAtivacao = createElementSafe('div', { class: 'btn-row' });
  btnsAtivacao.appendChild(createElementSafe('button', {
    type: 'button',
    class: 'btn btn-secondary',
    text: '🔑 Ativação',
    onclick: () => abrirWhatsApp('Olá! Preciso de ajuda para ativar minha licença do Casillas App.')
  }));
  btnsAtivacao.appendChild(createElementSafe('button', {
    type: 'button',
    class: 'btn btn-outline',
    text: '💳 Comprar licença',
    onclick: () => abrirWhatsApp('Olá! Quero comprar uma licença do Casillas App.')
  }));
  cardAtivacao.appendChild(btnsAtivacao);
  container.appendChild(cardAtivacao);

  // ─── Card 6: Sobre ───
  const cardInfo = createElementSafe('div', { class: 'card' });
  cardInfo.appendChild(createElementSafe('h3', {
    class: 'card-title',
    text: 'ℹ️ Sobre o Casillas App'
  }));
  cardInfo.appendChild(createElementSafe('p', {
    class: 'result-hint',
    text: 'Casillas App — Calculadora Técnica de Usinagem. Versão 1.3.0. Funciona 100% offline. Todos os cálculos seguem normas ISO, DIN e práticas de oficina.'
  }));
  container.appendChild(cardInfo);

  // KPIs
  updateKPIs([
    { label: 'Serviços', value: String(SERVICOS.length) },
    { label: 'Cursos',   value: String(CURSOS.length) },
    { label: 'Suporte',  value: 'WhatsApp' }
  ]);

  showToast('Consultoria disponível', 'info');
}
