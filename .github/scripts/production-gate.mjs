import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function assertRelease({ event, ref, sha, expectedSha, checkoutSha, remoteSha, approvalRecord, smokeRecord }) {
  assert.equal(event, 'workflow_dispatch', 'Release requires explicit dispatch');
  assert.equal(ref, 'refs/heads/casillas-2.0', 'Only the release branch may deploy');
  assert.match(expectedSha ?? '', /^[0-9a-f]{40}$/, 'Expected SHA must be complete');
  assert.equal(sha, expectedSha, 'Dispatch SHA differs from approval');
  assert.equal(checkoutSha, expectedSha, 'Checkout differs from approval');
  assert.equal(remoteSha, expectedSha, 'Release branch has advanced or SHA is not its HEAD');
  assert.ok(approvalRecord?.trim(), 'Explicit approval evidence is required');
  assert.ok(smokeRecord?.trim(), 'Candidate smoke evidence is required');
  return expectedSha;
}

export function runCommand(program, args, options = {}) {
  const result = spawnSync(program, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, program + ' failed with exit ' + result.status);
  return result.stdout;
}

function currentRelease() {
  const checkoutSha = runCommand('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const remote = runCommand('git', ['ls-remote', '--heads', 'origin', 'refs/heads/casillas-2.0'],
    { encoding: 'utf8', stdio: 'pipe' }).trim();
  return assertRelease({
    event: process.env.GITHUB_EVENT_NAME,
    ref: process.env.GITHUB_REF,
    sha: process.env.GITHUB_SHA,
    expectedSha: process.env.EXPECTED_SHA,
    checkoutSha,
    remoteSha: remote.split(/\s+/)[0],
    approvalRecord: process.env.APPROVAL_RECORD,
    smokeRecord: process.env.SMOKE_RECORD
  });
}

const publicPaths = [
  'index.html', 'auth.html', 'offline.html', 'manifest.json', 'service-worker.js',
  'css', 'js', 'dados', 'icons', 'manuais'
];

function walk(directory) {
  return readdirSync(directory).sort().flatMap(name => {
    const path = join(directory, name);
    const stat = lstatSync(path);
    assert.ok(!stat.isSymbolicLink(), 'Artifact must not follow symlinks: ' + path);
    return stat.isDirectory() ? walk(path) : [path];
  });
}

export function buildArtifact(destination, source = process.cwd()) {
  const root = resolve(destination);
  assert.ok(!existsSync(root), 'Artifact destination must be fresh');
  mkdirSync(root, { recursive: true });
  for (const name of publicPaths) cpSync(join(source, name), join(root, name), { recursive: true });

  const requireAsset = value => {
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return;
    const asset = value.split(/[?#]/)[0];
    if (!asset) return;
    const path = resolve(root, asset);
    assert.ok(path === root || path.startsWith(root + sep), 'Asset escapes artifact: ' + value);
    assert.ok(existsSync(path), 'Artifact asset missing: ' + value);
  };
  for (const name of ['index.html', 'auth.html', 'offline.html']) {
    const html = readFileSync(join(root, name), 'utf8');
    assert.ok(html.includes('<html'), 'Invalid entry page: ' + name);
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) requireAsset(match[1]);
  }
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  requireAsset(manifest.start_url);
  for (const icon of manifest.icons ?? []) requireAsset(icon.src);
  const sw = readFileSync(join(root, 'service-worker.js'), 'utf8');
  const assets = sw.match(/const CACHE_ASSETS = \[([\s\S]*?)\];/);
  assert.ok(assets, 'Service Worker precache list must be inspected');
  for (const match of assets[1].matchAll(/['"]([^'"]+)['"]/g)) requireAsset(match[1]);

  const files = walk(root).map(path => ({
    path: relative(root, path).split(sep).join('/'),
    sha256: createHash('sha256').update(readFileSync(path)).digest('hex')
  }));
  return createHash('sha256').update(JSON.stringify(files)).digest('hex');
}

function outputs(values) {
  if (process.env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries(values)) appendFileSync(process.env.GITHUB_OUTPUT, key + '=' + value + '\n');
  }
  console.log(JSON.stringify(values));
}

function validate() {
  const paths = runCommand('git', ['ls-files', '-z', '*.js', '*.mjs'], { encoding: 'utf8', stdio: 'pipe' })
    .split('\0').filter(Boolean);
  for (const path of paths) runCommand(process.execPath, ['--check', path]);
  console.log('Syntax checked: ' + paths.length + ' tracked executables; none executed');
  runCommand(process.execPath, ['--test', 'tests/trial-access.test.mjs']);
  runCommand(process.execPath, ['--test', '.github/tests/production-gate.test.mjs']);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const mode = process.argv[2];
  if (mode === 'validate') validate();
  else if (mode === 'release-check') {
    const sha = currentRelease();
    outputs({ sha });
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '## Release ' + sha + '\nApproval: ' + process.env.APPROVAL_RECORD +
      '\nCandidate smoke: ' + process.env.SMOKE_RECORD +
      '\n\nRecords require human review; their contents are not verified automatically.\n');
  } else if (mode === 'build') {
    const sha = currentRelease();
    const digest = buildArtifact(process.argv[3] ?? '_site');
    outputs({ sha, artifact_name: 'github-pages-' + sha, digest });
  } else throw new Error('Use validate, release-check or build');
}
