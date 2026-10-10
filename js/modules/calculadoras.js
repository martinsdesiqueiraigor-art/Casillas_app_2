import { ICONS } from '../icons.js';
import { updateKPIs } from '../state.js';

const CATEGORIES = ['Todas', 'Geometria', 'Roscas e ajustes', 'Usinagem'];

const CALCULATORS = [
  { key: 'trig', name: 'Trigonometria', description: 'Ângulos e relações do triângulo.', category: 'Geometria' },
  { key: 'coni', name: 'Conicidade', description: 'Cálculos de cones e ângulos.', category: 'Geometria' },
  { key: 'poly', name: 'Polígonos', description: 'Geometria de perfis poligonais.', category: 'Geometria' },
  { key: 'furos', name: 'Furação Circular', description: 'Coordenadas para padrões circulares.', category: 'Geometria' },
  { key: 'rosca', name: 'Roscas', description: 'Consulta técnica de roscas.', category: 'Roscas e ajustes' },
  { key: 'tol', name: 'Tolerâncias ISO', description: 'Ajustes e tolerâncias dimensionais.', category: 'Roscas e ajustes' },
  { key: 'chaveta', name: 'Chaveta DIN 6885', description: 'Dimensões normalizadas de chavetas.', category: 'Roscas e ajustes' },
  { key: 'conicpad', name: 'Conicidades Padrão', description: 'Referência de conicidades usuais (Morse, ISO, métrico).', category: 'Roscas e ajustes' },
  { key: 'potencia', name: 'Potência de Corte', description: 'Apoio ao planejamento de corte.', category: 'Usinagem' },
  { key: 'prog', name: 'Programação CNC', description: 'Ferramentas e referências CNC.', category: 'Usinagem' }
];

/** Remove acentos e caixa para comparar textos de busca. */
function normalize(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function createItem(calc) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'calc-item';
  button.dataset.module = calc.key;
  button.setAttribute('aria-label', `Abrir ${calc.name}`);

  const icon = document.createElement('span');
  icon.className = 'calc-item-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = ICONS[calc.key] ? ICONS[calc.key](24) : '';

  const copy = document.createElement('span');
  copy.className = 'calc-item-copy';
  const name = document.createElement('span');
  name.className = 'calc-item-name';
  name.textContent = calc.name;
  const description = document.createElement('span');
  description.className = 'calc-item-description';
  description.textContent = calc.description;
  copy.append(name, description);

  const arrow = document.createElement('span');
  arrow.className = 'calc-item-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '›';

  button.append(icon, copy, arrow);
  return button;
}

export function render(container) {
  let category = 'Todas';

  const view = document.createElement('div');
  view.className = 'calc-view';

  const title = document.createElement('h2');
  title.className = 'calc-title';
  title.textContent = 'Calculadoras';

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'input calc-search';
  search.placeholder = 'Buscar: roscas, furos, tolerância';
  search.setAttribute('aria-label', 'Buscar calculadoras');
  search.autocomplete = 'off';

  const chips = document.createElement('div');
  chips.className = 'calc-chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Categorias');

  const count = document.createElement('p');
  count.className = 'calc-count';
  count.setAttribute('aria-live', 'polite');

  const list = document.createElement('div');
  list.className = 'calc-list';

  function renderChips() {
    chips.replaceChildren(...CATEGORIES.map((name) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'calc-chip';
      chip.dataset.category = name;
      chip.setAttribute('aria-pressed', String(name === category));
      chip.textContent = name;
      return chip;
    }));
  }

  function renderList() {
    const query = normalize(search.value.trim());
    const found = CALCULATORS.filter((calc) =>
      (category === 'Todas' || calc.category === category) &&
      (!query || normalize(`${calc.name} ${calc.description}`).includes(query))
    );
    count.textContent = found.length === 1 ? '1 calculadora' : `${found.length} calculadoras`;
    updateKPIs([
      { label: 'Resultados', value: String(found.length) },
      { label: 'Total', value: String(CALCULATORS.length) },
      { label: 'Categoria', value: category }
    ]);

    if (!found.length) {
      const empty = document.createElement('div');
      empty.className = 'calc-empty';
      const strong = document.createElement('strong');
      strong.textContent = 'Nenhuma calculadora encontrada';
      const hint = document.createElement('span');
      hint.textContent = 'Tente outras palavras ou mude a categoria.';
      empty.append(strong, hint);
      list.replaceChildren(empty);
      return;
    }
    list.replaceChildren(...found.map(createItem));
  }

  chips.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-category]');
    if (!chip) return;
    category = chip.dataset.category;
    renderChips();
    renderList();
  });

  list.addEventListener('click', (event) => {
    const item = event.target.closest('[data-module]');
    if (!item) return;
    window.dispatchEvent(new CustomEvent('casillas:navigate-module', {
      detail: { key: item.dataset.module }
    }));
  });

  search.addEventListener('input', renderList);

  renderChips();
  renderList();
  view.append(title, search, chips, count, list);
  container.replaceChildren(view);
}
