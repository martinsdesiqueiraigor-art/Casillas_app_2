// bottom-nav.js — Barra de navegação inferior (4 itens). Os módulos continuam
// sendo carregados por app.js; aqui só há apresentação e estado ativo.

const ITEMS = [
  { key: 'home', label: 'Início', icon: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>' },
  { key: 'calculadoras', label: 'Calculadoras', icon: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>' },
  { key: 'guia', label: 'Guia CNC', icon: '<path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z"/>' },
  { key: 'consult', label: 'Biblioteca', icon: '<path d="M5 4v16M10 4v16M14 6l4 14M5 4h5"/>' }
];

// Módulos que pertencem a cada item (o item fica ativo em qualquer um deles).
const CALCULATOR_KEYS = ['trig', 'coni', 'poly', 'furos', 'rosca', 'tol', 'chaveta', 'conicpad', 'potencia', 'prog'];

function itemForModule(moduleKey) {
  if (CALCULATOR_KEYS.includes(moduleKey)) return 'calculadoras';
  if (ITEMS.some((item) => item.key === moduleKey)) return moduleKey;
  return null;
}

/** @param {(key: string) => void} onSelect */
export function initBottomNav(onSelect) {
  const nav = document.getElementById('bottom-nav');
  if (!nav || nav.dataset.wired === '1') return;
  nav.dataset.wired = '1';

  const NS = 'http://www.w3.org/2000/svg';
  ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bottom-nav-item';
    button.dataset.navModule = item.key;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('bottom-nav-icon');
    // Ícones estáticos do desenvolvedor, sem dados de URL ou de usuário.
    svg.innerHTML = item.icon;

    const label = document.createElement('span');
    label.textContent = item.label;
    button.append(svg, label);
    nav.append(button);
  });

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-nav-module]');
    if (button && typeof onSelect === 'function') onSelect(button.dataset.navModule);
  });
}

export function setBottomNavActive(moduleKey) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const active = itemForModule(moduleKey);
  nav.querySelectorAll('[data-nav-module]').forEach((button) => {
    const isActive = button.dataset.navModule === active;
    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}
