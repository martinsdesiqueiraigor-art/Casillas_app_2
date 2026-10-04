import { ICONS } from '../icons.js';

const MODULE_GROUPS = [
  {
    title: 'Cálculos',
    modules: [
      { key: 'trig', name: 'Trigonometria', description: 'Ângulos e relações do triângulo.' },
      { key: 'coni', name: 'Conicidade', description: 'Cálculos de cones e ângulos.' },
      { key: 'poly', name: 'Polígonos', description: 'Geometria de perfis poligonais.' },
      { key: 'furos', name: 'Furação Circular', description: 'Coordenadas para padrões circulares.' }
    ]
  },
  {
    title: 'Roscas e ajustes',
    modules: [
      { key: 'rosca', name: 'Roscas', description: 'Consulta técnica de roscas.' },
      { key: 'tol', name: 'Tolerâncias ISO', description: 'Ajustes e tolerâncias dimensionais.' },
      { key: 'chaveta', name: 'Chaveta DIN 6885', description: 'Dimensões normalizadas de chavetas.' },
      { key: 'conicpad', name: 'Conicidades Padrão', description: 'Referência de conicidades usuais.' }
    ]
  },
  {
    title: 'Usinagem',
    modules: [
      { key: 'potencia', name: 'Potência de Corte', description: 'Apoio ao planejamento de corte.' },
      { key: 'prog', name: 'Programação CNC', description: 'Ferramentas e referências CNC.' }
    ]
  },
  {
    title: 'Guias e suporte',
    modules: [
      { key: 'guia', name: 'Guia de Programação', description: 'Consulta de comandos e ciclos.' },
      { key: 'consult', name: 'Consultoria', description: 'Suporte técnico para sua usinagem.' }
    ]
  }
];

const QUICK_ACCESS = ['trig', 'rosca', 'potencia', 'prog'];
const MODULES_BY_KEY = new Map(
  MODULE_GROUPS.flatMap((group) => group.modules).map((module) => [module.key, module])
);

function getAccessPresentation(accessStatus) {
  if (accessStatus?.activated === true && accessStatus?.daysLeft === Infinity) {
    return {
      kind: 'licensed',
      icon: '✓',
      title: 'Licença ativa',
      description: 'Sua licença comercial está ativa.',
      detail: 'Acesso comercial confirmado'
    };
  }

  if (accessStatus?.ok === true && Number.isFinite(accessStatus.daysLeft)) {
    return {
      kind: 'trial',
      icon: '◷',
      title: 'Período de teste',
      description: 'Seu período de teste está em andamento.',
      daysLeft: accessStatus.daysLeft
    };
  }

  return {
    kind: 'verified',
    icon: '✓',
    title: 'Acesso verificado',
    description: 'Status confirmado pelo Casillas.',
    detail: ''
  };
}

function createModuleCard(module, compact = false) {
  const button = document.createElement('button');
  button.className = `home-module-card${compact ? ' home-quick-card' : ''}`;
  button.type = 'button';
  button.dataset.module = module.key;
  button.setAttribute('aria-label', `Abrir módulo ${module.name}`);

  const icon = document.createElement('span');
  icon.className = 'home-module-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = ICONS[module.key] ? ICONS[module.key](20) : '';

  const copy = document.createElement('span');
  copy.className = 'home-module-copy';

  const title = document.createElement('span');
  title.className = 'home-module-title';
  title.textContent = module.name;
  copy.append(title);

  if (!compact && module.description) {
    const description = document.createElement('span');
    description.className = 'home-module-description';
    description.textContent = module.description;
    copy.append(description);
  }

  const arrow = document.createElement('span');
  arrow.className = 'home-module-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';

  button.append(icon, copy, arrow);
  return button;
}

function createSectionHeading(kicker, title, id) {
  const heading = document.createElement('div');
  heading.className = 'home-section-heading';

  const copy = document.createElement('div');
  const label = document.createElement('div');
  label.className = 'home-section-kicker';
  label.textContent = kicker;

  const headingTitle = document.createElement('h2');
  headingTitle.className = 'home-section-title';
  headingTitle.id = id;
  headingTitle.textContent = title;
  copy.append(label, headingTitle);
  heading.append(copy);
  return heading;
}

function createAccessCard(access) {
  const card = document.createElement('section');
  card.className = `home-access-card is-${access.kind}`;
  card.setAttribute('aria-label', `Status da conta: ${access.title}`);
  card.setAttribute('role', 'status');

  const icon = document.createElement('span');
  icon.className = 'home-access-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = access.icon;

  const copy = document.createElement('div');
  copy.className = 'home-access-copy';

  const label = document.createElement('span');
  label.className = 'home-access-label';
  label.textContent = 'Status da conta';

  const title = document.createElement('h2');
  title.className = 'home-access-title';
  title.textContent = access.title;

  const description = document.createElement('p');
  description.className = 'home-access-description';
  description.textContent = access.description;
  copy.append(label, title, description);
  card.append(icon, copy);

  if (access.kind === 'trial') {
    const days = document.createElement('div');
    days.className = 'home-access-days';
    days.setAttribute('aria-label', `${access.daysLeft} ${access.daysLeft === 1 ? 'dia restante' : 'dias restantes'}`);

    const number = document.createElement('strong');
    number.className = 'home-access-days-number';
    number.textContent = String(access.daysLeft);

    const caption = document.createElement('span');
    caption.className = 'home-access-days-caption';
    caption.textContent = access.daysLeft === 1 ? 'dia restante' : 'dias restantes';
    days.append(number, caption);
    card.append(days);
  } else if (access.detail) {
    const detail = document.createElement('span');
    detail.className = 'home-access-detail';
    detail.textContent = access.detail;
    card.append(detail);
  }

  return card;
}

function createModuleGroup(group, headingIndex) {
  const section = document.createElement('section');
  section.className = 'home-module-group';
  const titleId = `home-group-title-${headingIndex}`;
  section.setAttribute('aria-labelledby', titleId);
  section.append(createSectionHeading('Ferramentas', group.title, titleId));

  const grid = document.createElement('div');
  grid.className = 'home-module-grid';
  group.modules.forEach((module) => {
    grid.append(createModuleCard(module));
  });
  section.append(grid);
  return section;
}

export function render(container, accessStatus) {
  const access = getAccessPresentation(accessStatus);
  const view = document.createElement('div');
  view.className = 'home-view';

  const hero = document.createElement('section');
  hero.className = 'home-hero';
  hero.setAttribute('aria-labelledby', 'home-title');

  const eyebrow = document.createElement('span');
  eyebrow.className = 'home-eyebrow';
  eyebrow.textContent = 'Casillas';

  const title = document.createElement('h2');
  title.className = 'home-title';
  title.id = 'home-title';
  title.textContent = 'Calculadora Técnica de Usinagem';

  const lead = document.createElement('p');
  lead.className = 'home-lead';
  lead.textContent = 'Ferramentas técnicas para consultar medidas, calcular operações e apoiar sua rotina de usinagem.';

  const heroCopy = document.createElement('div');
  heroCopy.append(eyebrow, title, lead);
  hero.append(heroCopy);

  const quickSection = document.createElement('section');
  quickSection.className = 'home-quick-section';
  quickSection.setAttribute('aria-labelledby', 'home-quick-title');
  quickSection.append(createSectionHeading('Comece por aqui', 'Acesso rápido', 'home-quick-title'));

  const quickGrid = document.createElement('div');
  quickGrid.className = 'home-quick-grid';
  QUICK_ACCESS.forEach((key) => {
    const module = MODULES_BY_KEY.get(key);
    if (module) quickGrid.append(createModuleCard(module, true));
  });
  quickSection.append(quickGrid);

  const catalog = document.createElement('section');
  catalog.className = 'home-catalog';
  catalog.setAttribute('aria-labelledby', 'home-catalog-title');
  catalog.append(createSectionHeading('Todos os módulos', 'Ferramentas de usinagem', 'home-catalog-title'));

  MODULE_GROUPS.forEach((group, index) => {
    catalog.append(createModuleGroup(group, index));
  });

  const accessCard = createAccessCard(access);
  view.append(hero, accessCard, quickSection, catalog);
  view.addEventListener('click', (event) => {
    const card = event.target.closest('button[data-module]');
    if (!card || !view.contains(card)) return;
    window.dispatchEvent(new CustomEvent('casillas:navigate-module', {
      detail: { key: card.dataset.module }
    }));
  });

  container.append(view);
}
