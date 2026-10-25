// @ts-check
// Preferências locais de acessibilidade. Não altera autenticação ou licença.
const KEY = 'casillas:settings:v1';
const DEFAULTS = { fontSize: 16, highContrast: false };
export function readSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      fontSize: [16, 19, 22].includes(raw.fontSize) ? raw.fontSize : DEFAULTS.fontSize,
      highContrast: raw.highContrast === true
    };
  } catch { return { ...DEFAULTS }; }
}
export function applySettings(settings = readSettings()) {
  // Escala proporcional de toda a interface (textos, espaços e ícones). "Normal" (16) = 87,5%.
  document.documentElement.style.fontSize = '16px';
  document.documentElement.style.setProperty('--cas-ui-zoom', String(+(settings.fontSize / 16 * 0.875).toFixed(4)));
  document.documentElement.dataset.casillasContrast = settings.highContrast ? 'high' : 'normal';
}
function saveSettings(settings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); }
  catch (error) { console.warn('[Configurações] Preferências não persistidas', error); }
  applySettings(settings);
}
function node(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}
function navigateHome() {
  window.dispatchEvent(new CustomEvent('casillas:navigate-module', { detail: { key: 'home' } }));
}
export function render(container) {
  const settings = readSettings();
  const root = node('section', 'cas22-settings');
  const top = node('div', 'cas22-settings-top');
  const back = node('button', 'cas22-settings-back', '‹');
  back.type = 'button'; back.setAttribute('aria-label', 'Voltar para início');
  back.addEventListener('click', navigateHome);
  top.append(back, node('h2', '', 'Configurações'));
  root.append(top);

  const fontHeading = node('h3', '', 'Tamanho da fonte');
  const fontCard = node('section', 'cas22-settings-card');
  const choices = node('div', 'cas22-settings-choices');
  const buttons = [];
  for (const [size, label] of [[16, 'Normal'], [19, 'Grande'], [22, 'Muito grande']]) {
    const button = node('button', 'cas22-settings-choice', label);
    button.type = 'button'; button.setAttribute('aria-pressed', String(settings.fontSize === size));
    button.addEventListener('click', () => {
      settings.fontSize = size;
      saveSettings(settings);
      buttons.forEach(([element, value]) => element.setAttribute('aria-pressed', String(value === size)));
    });
    buttons.push([button, size]); choices.append(button);
  }
  fontCard.append(choices, node('p', 'cas22-settings-sample', 'Ciclo G76 — exemplo de leitura técnica.'));
  root.append(fontHeading, fontCard);

  root.append(node('h3', '', 'Alto contraste'));
  const contrastCard = node('section', 'cas22-settings-card');
  const contrastRow = node('div', 'cas22-settings-row');
  const contrastText = node('div', '');
  contrastText.append(node('strong', '', 'Alto contraste'), node('small', '', 'Textos e bordas mais definidos para leitura.'));
  const toggle = node('button', 'cas22-settings-toggle');
  toggle.type = 'button'; toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-label', 'Alto contraste');
  toggle.setAttribute('aria-checked', String(settings.highContrast));
  toggle.addEventListener('click', () => {
    settings.highContrast = !settings.highContrast;
    toggle.setAttribute('aria-checked', String(settings.highContrast));
    saveSettings(settings);
  });
  contrastRow.append(contrastText, toggle); contrastCard.append(contrastRow);
  root.append(contrastCard);

  root.append(node('h3', '', 'Idioma'));
  const languageCard = node('section', 'cas22-settings-card');
  languageCard.append(node('p', '', 'Português (Brasil)'));
  languageCard.append(node('small', 'cas22-settings-muted', 'Inglês será disponibilizado após a tradução completa do aplicativo.'));
  root.append(languageCard);

  root.append(node('h3', '', 'Acesso e licença'));
  const accessCard = node('section', 'cas22-settings-card');
  accessCard.append(node('p', '', 'O acesso continua sendo gerenciado pelo sistema de autenticação e licenciamento existente.'));
  accessCard.append(node('small', 'cas22-settings-muted', 'Esta tela não modifica o plano, a licença nem a validação offline.'));
  root.append(accessCard);

  root.append(node('h3', '', 'Sobre'));
  const about = node('section', 'cas22-settings-card');
  about.append(node('p', '', 'Casillas — Calculadora Técnica de Usinagem'));
  root.append(about);
  container.append(root);
}
