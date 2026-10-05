import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { assertRelease, buildArtifact, runCommand } from '../scripts/production-gate.mjs';

const sha = 'f7fd1e2340b7d95f405c2c6f00e41ae4176d3cef';
const release = {
  event: 'workflow_dispatch', ref: 'refs/heads/casillas-2.0',
  sha, expectedSha: sha, checkoutSha: sha, remoteSha: sha,
  approvalRecord: 'Owner approval reference', smokeRecord: 'Candidate smoke reference'
};

test('approved release identity passes without publishing', () => {
  assert.equal(assertRelease(release), sha);
});
test('push cannot enter the release guard', () => {
  assert.throws(() => assertRelease({ ...release, event: 'push' }), /explicit dispatch/);
});
test('hardening branch and tags cannot enter the release guard', () => {
  for (const ref of ['refs/heads/casillas-2.0-hardening', 'refs/tags/release']) {
    assert.throws(() => assertRelease({ ...release, ref }), /release branch/);
  }
});
test('short or malformed approved SHA is rejected', () => {
  for (const expectedSha of ['f7fd1e2', 'x'.repeat(40), '']) {
    assert.throws(() => assertRelease({ ...release, expectedSha }), /complete/);
  }
});
test('dispatch, checkout and remote must all match approval', () => {
  for (const key of ['sha', 'checkoutSha', 'remoteSha']) {
    assert.throws(() => assertRelease({ ...release, [key]: '0'.repeat(40) }));
  }
});
test('approval and candidate smoke records are mandatory', () => {
  for (const key of ['approvalRecord', 'smokeRecord']) {
    assert.throws(() => assertRelease({ ...release, [key]: ' ' }), /required/);
  }
});
test('a failed validation command stops the next operation', () => {
  let nextOperation = false;
  assert.throws(() => {
    runCommand(process.execPath, ['-e', 'process.exit(7)'], { stdio: 'pipe' });
    nextOperation = true;
  }, /exit 7/);
  assert.equal(nextOperation, false);
});
test('public artifact is repeatable and preserves executable content', () => {
  const root = mkdtempSync(join(tmpdir(), 'casillas-gate-test-'));
  try {
    const first = join(root, 'first');
    const second = join(root, 'second');
    assert.equal(buildArtifact(first), buildArtifact(second));
    for (const path of ['js/app.js', 'js/trial.js', 'service-worker.js']) {
      assert.deepEqual(readFileSync(join(first, path)), readFileSync(path));
    }
    assert.throws(() => buildArtifact(first), /fresh/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
