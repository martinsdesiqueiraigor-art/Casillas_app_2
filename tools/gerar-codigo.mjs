#!/usr/bin/env node

import { createHash, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const PRODUCT_SLUG = 'casillas';
const GROUPS = 4;
const CHARS_PER_GROUP = 5;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomIndex(max) {
  const limit = 256 - (256 % max);
  while (true) {
    const value = randomBytes(1)[0];
    if (value < limit) return value % max;
  }
}

function generateCode() {
  const groups = [];
  for (let group = 0; group < GROUPS; group += 1) {
    let value = '';
    for (let i = 0; i < CHARS_PER_GROUP; i += 1) {
      value += ALPHABET[randomIndex(ALPHABET.length)];
    }
    groups.push(value);
  }
  return groups.join('-');
}

export function normalizeLicenseCode(code) {
  return String(code ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '');
}

export function hashLicenseCode(code) {
  return createHash('sha256')
    .update(normalizeLicenseCode(code), 'utf8')
    .digest('hex');
}

function sqlLiteral(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

export function buildInsertSql(hash) {
  return [
    'insert into public.licenses (product_id, license_code_hash, status)',
    'select id, ' + sqlLiteral(hash) + ", 'AVAILABLE'",
    'from public.products',
    'where slug = ' + sqlLiteral(PRODUCT_SLUG) + ' and is_active = true',
    'returning id, status, created_at;'
  ].join('\n');
}

function main() {
  const code = generateCode();
  const normalized = normalizeLicenseCode(code);
  const hash = hashLicenseCode(code);

  console.log('=== CASILLAS — GERADOR LOCAL DE LICENÇA ===');
  console.log('Código para entregar ao cliente:');
  console.log(code);
  console.log('');
  console.log('Normalizado: ' + normalized);
  console.log('SHA-256: ' + hash);

  if (process.argv.includes('--sql')) {
    console.log('');
    console.log('SQL para executar manualmente no Supabase SQL Editor:');
    console.log(buildInsertSql(hash));
  } else {
    console.log('');
    console.log('Nenhuma escrita remota foi realizada.');
    console.log('Use --sql apenas para gerar o INSERT manual.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
