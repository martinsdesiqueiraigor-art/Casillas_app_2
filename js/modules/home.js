import { ICONS } from '../icons.js';

const QUICK = [
  ['trig', 'Trigonometria', 'Triângulos e ângulos'],
  ['coni', 'Conicidade', 'Cones e conicidades'],
  ['poly', 'Polígonos', 'Cálculos geométricos'],
  ['furos', 'Furação circular', 'Padrões de furos']
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function navigate(key) {
  window.dispatchEvent(new CustomEvent('casillas:navigate-module', { detail: { key } }));
}

function accessPill(status) {
  const activated = status?.activated === true && status?.daysLeft === Infinity;
  const trial = status?.ok === true && Number.isFinite(status.daysLeft);
  const pill = element('span', 'home22-pill ' + (activated ? 'is-active' : trial ? 'is-trial' : 'is-neutral'));
  if (activated) pill.textContent = '✓ Licença ativa';
  else if (trial) pill.textContent = '◷ Teste · ' + status.daysLeft + (status.daysLeft === 1 ? ' dia' : ' dias');
  else pill.textContent = '✓ Acesso verificado';
  return pill;
}

function shortcut(key, title, description) {
  const btn = element('button', 'home22-tile');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Abrir ' + title);
  const icon = element('span', 'home22-tile-icon');
  icon.setAttribute('aria-hidden', 'true');
  if (ICONS[key]) icon.innerHTML = ICONS[key](24);
  const label = element('strong', '', title);
  const sub = element('small', '', description);
  btn.append(icon, label, sub);
  btn.addEventListener('click', () => navigate(key));
  return btn;
}

export function render(container, accessStatus) {
  const view = element('div', 'home22-view');

  const status = element('div', 'home22-status');
  status.append(accessPill(accessStatus));
  // A disponibilidade offline não pode ser inferida só pela conexão de rede.
  // Não exibir um selo de cache/offline sem verificação real.

  const intro = element('section', 'home22-intro');
  intro.append(
    element('h2', '', 'O que vamos resolver?'),
    element('p', '', 'Calcule, consulte e encontre informações técnicas.')
  );

  const form = element('form', 'home22-consultor');
  form.setAttribute('aria-label', 'Acessar Consultor Técnico');
  const heading = element('div', 'home22-consultor-heading');
  heading.append(
    element('h2', '', 'Consultor Técnico'),
    element('p', '', 'Pergunte. O Casillas encontra o caminho técnico.')
  );
  const field = element('input', 'home22-question');
  field.type = 'text';
  field.dataset.nativeKeyboard = '1';
  field.setAttribute('inputmode', 'text');
  field.placeholder = 'Digite sua dúvida de usinagem ou CNC...';
  field.setAttribute('aria-label', 'Pergunta para o Consultor Técnico');
  field.autocomplete = 'off';
  const submit = element('button', 'home22-submit', 'Consultar');
  submit.type = 'submit';
  form.append(heading, field, submit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // A integração de envio automático depende de contrato do Consultor.
    // Navega para o módulo funcional sem simular que a pergunta foi enviada.
    const question = field.value.trim();
    if (question) {
      try { sessionStorage.setItem('casillas:consultor-prefill', question); } catch (error) { console.warn('Consulta nao persistida', error); }
    }
    navigate('consultor-tecnico');
  });

  const quick = element('section', 'home22-quick');
  const quickHead = element('div', 'home22-section-head');
  quickHead.append(element('h2', '', 'Acesso rápido'));
  const all = element('button', 'home22-text-link', 'Ver todas ›');
  all.type = 'button';
  all.addEventListener('click', () => navigate('calculadoras'));
  quickHead.append(all);
  const grid = element('div', 'home22-grid');
  QUICK.forEach(([key, name, description]) => grid.append(shortcut(key, name, description)));
  quick.append(quickHead, grid);

  const guide = element('section', 'home22-guide');
  guide.append(element('h2', '', 'Guia CNC'));
  const guideButton = element('button', 'home22-guide-link');
  guideButton.type = 'button';
  guideButton.append(
    element('span', 'home22-guide-icon', '▤'),
    element('span', 'home22-guide-copy', 'Consultar ciclos CNC'),
    element('span', 'home22-chevron', '›')
  );
  guideButton.querySelector('.home22-guide-copy').append(element('small', '', 'Referências técnicas disponíveis no app'));
  guideButton.addEventListener('click', () => navigate('guia'));
  guide.append(guideButton);

  view.append(status, intro, form, quick, guide);
  container.append(view);
}
