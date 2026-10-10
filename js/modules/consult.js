// consult.js (module) — Biblioteca: contato, serviços, cursos e licença.

import { createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';
import { WHATSAPP, showActivationScreen } from '../trial.js';

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
  { icon: 'lathe', titulo: 'Torneamento CNC',     desc: 'Programação, otimização de ciclos e cálculo de parâmetros.' },
  { icon: 'mill', titulo: 'Fresamento CNC',      desc: 'Estratégias de desbaste, acabamento e fixação.' },
  { icon: 'code', titulo: 'Programação CNC',     desc: 'Fanuc Macro B, Siemens, Mach3 e ajustes finos.' },
  { icon: 'tool', titulo: 'Ferramental',         desc: 'Projetos de dispositivos, gabaritos e chavetas.' },
  { icon: 'brief', titulo: 'Consultoria técnica', desc: 'Análise de processos e redução de tempo de ciclo.' },
  { icon: 'teach', titulo: 'Treinamento',         desc: 'Aulas in-company para operadores e programadores.' }
];

// ═══════════════════════════════════════════════════════════
// CURSOS
// ═══════════════════════════════════════════════════════════
const CURSOS = [
  {
    icon: 'cam',
    titulo: 'Programação CAM',
    desc: 'Do zero ao avançado — Mastercam, Fusion 360 e estratégias de usinagem.'
  },
  {
    icon: 'cube',
    titulo: 'SolidWorks',
    desc: 'Modelagem 3D, montagem, desenho técnico e preparação para fabricação.'
  },
  {
    icon: 'param',
    titulo: 'Programação Parametrizada',
    desc: 'Fanuc Macro B, variáveis, subprogramas e automação de ciclos.'
  }
];

// ═══════════════════════════════════════════════════════════
// ÍCONES (SVG estáticos do desenvolvedor; trocáveis num só lugar)
// ═══════════════════════════════════════════════════════════
const SVG_NS = 'http://www.w3.org/2000/svg';
const PATHS = {
  chat: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.8 4 4.5"/>',
  insta: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M16.5 7.5h.01"/>',
  play: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  lathe: '<rect x="3" y="8" width="12" height="8" rx="1"/><path d="M15 12h6M6 8V5M6 19v-3"/>',
  mill: '<path d="M12 3v10M9 13h6l-1 8h-4z"/><path d="M5 21h14"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  tool: '<path d="M14 6a4 4 0 0 0 4 4l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-1-1z"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  teach: '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"/>',
  cam: '<path d="M4 18l5-9 4 6 3-4 4 7z"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  param: '<path d="M5 6h4M5 12h6M5 18h3M15 6h4M13 12h6M12 18h7"/>'
};

function svgIcon(name, size = 24) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('lib-svg');
  svg.innerHTML = PATHS[name] || '';
  return svg;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function abrirLink(url) {
  window.open(url, '_blank', 'noopener');
}

function abrirWhatsApp(mensagem) {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener');
}

function linkButton(label, iconName, onClick, primary = false) {
  const button = createElementSafe('button', {
    type: 'button',
    class: primary ? 'btn btn-primary lib-btn' : 'btn btn-outline lib-btn',
    onclick: onClick
  });
  button.append(svgIcon(iconName, 22), document.createTextNode(label));
  return button;
}

function sectionTitle(text) {
  return createElementSafe('h3', { class: 'lib-heading', text });
}

/** Item expansível: toque abre o texto e o botão que fala no WhatsApp. */
function expandable(item, extra, whatsappText) {
  const details = createElementSafe('details', { class: 'lib-item' });

  const summary = document.createElement('summary');
  const icon = createElementSafe('span', { class: 'lib-item-icon' });
  icon.append(svgIcon(item.icon, 24));
  const copy = createElementSafe('span', { class: 'lib-item-copy' }, [
    createElementSafe('span', { class: 'lib-item-title', text: item.titulo }),
    ...(extra ? [createElementSafe('small', { text: extra })] : [])
  ]);
  const chev = createElementSafe('span', { class: 'lib-item-chev' });
  chev.append(svgIcon('chev', 22));
  summary.append(icon, copy, chev);

  const body = createElementSafe('div', { class: 'lib-item-body' }, [
    createElementSafe('p', { text: item.desc }),
    linkButton('Falar no WhatsApp', 'chat', () => abrirWhatsApp(whatsappText))
  ]);
  details.append(summary, body);
  return details;
}

// ═══════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════
export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Biblioteca', '📚');

  const view = createElementSafe('div', { class: 'lib-view' });

  view.append(createElementSafe('h2', { class: 'lib-title', text: 'Biblioteca' }));

  // Contato
  view.append(sectionTitle('Contato'));
  const contato = createElementSafe('div', { class: 'lib-grid' }, [
    linkButton('WhatsApp', 'chat', () => abrirWhatsApp('Olá! Vim pelo Casillas App.'), true),
    linkButton('Entrar no grupo', 'group', () => abrirLink(LINKS.grupoWhatsapp)),
    linkButton('Instagram', 'insta', () => abrirLink(LINKS.instagram)),
    linkButton('YouTube', 'play', () => abrirLink(LINKS.youtube))
  ]);
  view.append(contato);

  // Serviços
  view.append(sectionTitle('Serviços de usinagem'));
  view.append(createElementSafe('div', { class: 'lib-list' },
    SERVICOS.map((s) => expandable(s, '', `Olá! Gostaria de saber mais sobre: ${s.titulo}`))));

  // Cursos
  view.append(sectionTitle('Cursos'));
  view.append(createElementSafe('div', { class: 'lib-list' },
    CURSOS.map((c) => expandable(c, 'Sob consulta', `Olá! Tenho interesse no curso: ${c.titulo}`))));

  // Licença
  const licenca = createElementSafe('section', { class: 'lib-license', 'aria-label': 'Licença' });
  const head = createElementSafe('div', { class: 'lib-license-head' });
  const keyIcon = createElementSafe('span', { class: 'lib-item-icon lib-license-icon' });
  keyIcon.append(svgIcon('key', 24));
  head.append(
    keyIcon,
    createElementSafe('h3', { text: 'Licença' }),
    createElementSafe('span', { class: 'lib-tag', text: 'Licença vitalícia' })
  );
  licenca.append(
    head,
    createElementSafe('p', { class: 'lib-price' }, [
      createElementSafe('s', { text: 'R$ 49,90' }),
      ' ',
      createElementSafe('strong', { text: 'R$ 19,90' })
    ]),
    createElementSafe('p', { class: 'lib-muted', text: 'Preço promocional. Pagamento único, sem mensalidade e sem limite de aparelhos.' }),
    createElementSafe('p', { class: 'lib-muted', text: 'O app que você ativou é seu para sempre. Para receber os recursos novos de versões futuras, renove a licença.' }),
    createElementSafe('button', {
      type: 'button',
      class: 'btn btn-primary lib-btn',
      text: 'Ativar com código',
      onclick: () => showActivationScreen()
    }),
    createElementSafe('button', {
      type: 'button',
      class: 'btn btn-outline lib-btn',
      text: 'Comprar licença',
      onclick: () => abrirWhatsApp('Olá! Quero adquirir a licença vitalícia do Casillas App pelo preço promocional de R$ 19,90.')
    })
  );
  view.append(licenca);

  view.append(createElementSafe('p', {
    class: 'lib-note',
    text: 'Casillas App · Calculadora Técnica de Usinagem. Cálculos feitos no aparelho, funcionam offline, seguindo normas ISO, DIN e práticas de oficina.'
  }));

  container.appendChild(view);

  updateKPIs([
    { label: 'Serviços', value: String(SERVICOS.length) },
    { label: 'Cursos',   value: String(CURSOS.length) },
    { label: 'Suporte',  value: 'WhatsApp' }
  ]);
}
