// Verificações estáticas de isolamento da Biblioteca Técnica (CAS22-BIB-INTEGRATION-FASE-01).
// Garante que a Fase 1 não toca o app: CSS com escopo, sem rede, sem roteamento global,
// sem HTML de dados e sem registro nos arquivos protegidos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const dir = new URL('js/modules/biblioteca/', root);
const read = (rel, base = root) => readFileSync(new URL(rel, base), 'utf8');
const moduleJs = readdirSync(dir).filter((f) => f.endsWith('.js'));

test('todas as regras de biblioteca.css estão sob .cbib e usam classes cbib-', () => {
  const css = read('biblioteca.css', dir).replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [];
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (sel.startsWith('@media') || sel.startsWith('@keyframes') || /^(from|to|\d+%)$/.test(sel)) continue;
    // separa por vírgulas que não estão dentro de parênteses (:where(...), :is(...))
    let depth = 0, cur = '';
    for (const ch of sel) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { selectors.push(cur.trim()); cur = ''; } else cur += ch;
    }
    selectors.push(cur.trim());
  }
  assert.ok(selectors.length > 100, 'seletores lidos');
  for (const sel of selectors) {
    assert.match(sel, /^\.cbib(?=[\s.:\[]|$)/, `fora do escopo: ${sel}`);
    for (const cls of sel.match(/\.[a-zA-Z][\w-]*/g) || []) assert.match(cls, /^\.cbib(-|$)/, `classe sem prefixo: ${cls} em ${sel}`);
    assert.doesNotMatch(sel, /(^|\s)(html|body|:root)\b/, sel);
  }
  for (const kf of css.match(/@keyframes\s+[\w-]+/g) || []) assert.match(kf, /@keyframes cbib-/, kf);
});

test('módulo sem rede, sem roteamento global, sem armazenamento e sem HTML de dados', () => {
  for (const f of moduleJs) {
    const src = read(f, dir).replace(/\/\/.*$/gm, '');
    for (const [re, why] of [
      [/\bfetch\s*\(/, 'rede'], [/XMLHttpRequest|WebSocket|sendBeacon|EventSource/, 'rede'],
      [/\bimport\s*\(\s*['"]https?:/, 'import remoto'], [/from\s+['"]https?:/, 'import remoto'],
      [/\blocation\b/, 'window.location'], [/\bhistory\.(pushState|replaceState|back|forward|go|state)\b/, 'history API'], [/hashchange|popstate/, 'roteamento global'],
      [/localStorage|sessionStorage|indexedDB/, 'armazenamento'],
      [/\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/, 'HTML interpretado'],
      [/\beval\s*\(|new Function\s*\(/, 'código dinâmico'],
      [/(?:from|import\s*\()\s*['"][^'"]*(?:supabase|trial|auth|service-worker|consultor\/|guia\/|state\.js|db\.js)/i, 'importa núcleo protegido'],
      [/(?:from|import\s*\()\s*['"](?!\.\/)/, 'importa fora da pasta do módulo'],
    ]) assert.doesNotMatch(src, re, `${f}: ${why}`);
  }
});

test('DOMParser só é usado para os SVG estáticos de dom.js', () => {
  for (const f of moduleJs) {
    const uses = (read(f, dir).match(/DOMParser/g) || []).length;
    assert.equal(uses, f === 'dom.js' ? 1 : 0, f);
  }
  const dom = read('dom.js', dir);
  assert.match(dom, /staticSvg\(`i:\$\{name\}`/);
  assert.doesNotMatch(dom, /ICON_PATHS\[[^\]]*\]\s*=/, 'mapa de ícones não é alterado em tempo de execução');
});

test('Fase 2: Biblioteca registrada sem eliminar o modulo consult legado', () => {
  const app = read('js/app.js');
  const nav = read('js/bottom-nav.js');
  const sw = read('service-worker.js');
  assert.match(app, /biblioteca:\s*\(\) => import\('\.\/modules\/biblioteca\/index\.js'\)/);
  assert.match(app, /consult:\s*\(\) => import\('\.\/modules\/consult\.js'\)/);
  assert.match(nav, /key: 'biblioteca', label: 'Biblioteca'/);
  for (const f of ['index.js', 'data.js', 'dom.js', 'routes.js', 'search.js', 'views.js', 'biblioteca.css']) {
    assert.ok(sw.includes(`./js/modules/biblioteca/${f}`), f);
  }
});
test('o módulo segue o contrato de render do app', async () => {
  const src = read('index.js', dir);
  assert.match(src, /export function render\(container\)/);
  assert.match(src, /export function mountBiblioteca\(/);
});
