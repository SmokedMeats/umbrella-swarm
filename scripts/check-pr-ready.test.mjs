import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { structureProblems } from './check-pr-ready.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const scriptSrc = path.join(here, 'check-pr-ready.mjs');
const publicSafeSrc = path.join(here, 'check-public-safe.mjs');
const FAKE_TOKEN = 'ghp_' + '1'.repeat(36);

const gitEnv = {
  GIT_AUTHOR_NAME: 'pr-ready-test',
  GIT_AUTHOR_EMAIL: 'pr-ready-test@example.com',
  GIT_COMMITTER_NAME: 'pr-ready-test',
  GIT_COMMITTER_EMAIL: 'pr-ready-test@example.com',
};

function lastLine(text) {
  return (text || '').trim().split('\n').filter(Boolean).at(-1) || '';
}

function git(cwd, args) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...gitEnv } });
  if (run.status !== 0) throw new Error((run.stderr || run.stdout || `git ${args.join(' ')}`).trim());
}

function writeStubScanner(repo, fail) {
  const body = [
    "import { appendFileSync } from 'node:fs';",
    "appendFileSync('scanner-args.txt', process.argv.slice(2).join(' ') + '\\n');",
    fail ? "console.error('check:public-safe FAIL stub');" : "console.log('check:public-safe PASS stub');",
    fail ? 'process.exit(1);' : 'process.exit(0);',
    '',
  ].join('\n');
  writeFileSync(path.join(repo, 'scripts', 'check-public-safe.mjs'), body);
}

function writeSkill(repo, { broken }) {
  const dir = path.join(repo, 'skills', 'example');
  mkdirSync(path.join(dir, 'templates'), { recursive: true });
  writeFileSync(path.join(dir, 'templates', 'note.md'), '# Note\n');
  const link = broken ? 'missing.md' : 'templates/note.md';
  writeFileSync(path.join(dir, 'SKILL.md'), [
    '---',
    'name: example',
    'description: Fixture skill.',
    '---',
    '',
    `# Example`,
    '',
    `See [note](${link}) and [pack](../umbrella/PROJECT-CONFIG.md).`,
    '',
  ].join('\n'));
}

function makeRepo({ brokenSkill = false, scannerFails = false, withSkill = true } = {}) {
  const parent = mkdtempSync(path.join(tmpdir(), 'pr-ready-'));
  const repo = path.join(parent, 'repo');
  mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  writeFileSync(path.join(repo, 'scripts', 'check-pr-ready.mjs'), readFileSync(scriptSrc));
  writeStubScanner(repo, scannerFails);
  if (withSkill) writeSkill(repo, { broken: brokenSkill });
  git(repo, ['init', '-b', 'main']);
  git(repo, ['add', '-A']);
  git(repo, ['commit', '-m', 'fixture']);
  git(repo, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
  const denylist = path.join(parent, 'denylist.txt');
  writeFileSync(denylist, 'fixture-token-not-in-the-tree\n');
  return { parent, repo, denylist };
}

function runGate(repo, { denylist, stubFail, extraEnv } = {}) {
  const env = { ...process.env, ...gitEnv, ...extraEnv };
  delete env.PUBLIC_SAFE_DENYLIST;
  if (denylist) env.PUBLIC_SAFE_DENYLIST = denylist;
  if (stubFail) env.STUB_PUBLIC_SAFE_FAIL = '1';
  return spawnSync(process.execPath, ['scripts/check-pr-ready.mjs'], { cwd: repo, encoding: 'utf8', env });
}

function crashingGitleaks(bin) {
  mkdirSync(bin, { recursive: true });
  const file = path.join(bin, 'gitleaks');
  writeFileSync(file, [
    '#!/usr/bin/env node',
    "console.error('gitleaks stand-in crashed');",
    "if (process.argv[2] === 'version') process.exit(0);",
    'process.exit(1);',
    '',
  ].join('\n'));
  chmodSync(file, 0o755);
}

test('pass case prints the head sha', () => {
  const fixture = makeRepo();
  try {
    const run = runGate(fixture.repo, { denylist: fixture.denylist });
    const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: fixture.repo, encoding: 'utf8' }).stdout.trim();
    const calls = readFileSync(path.join(fixture.repo, 'scanner-args.txt'), 'utf8').trim().split('\n');
    assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
    assert.equal(lastLine(run.stdout), `pr-ready: PASS ${sha}`);
    assert.match(run.stdout, /generated copies: none \(skipped\)/);
    assert.deepEqual(calls, ['--tree', '--range origin/main..HEAD']);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('public-safe fail', () => {
  const fixture = makeRepo({ scannerFails: true });
  try {
    const run = runGate(fixture.repo, { denylist: fixture.denylist });
    assert.notEqual(run.status, 0);
    assert.match(lastLine(run.stdout), /^pr-ready: FAIL /);
    assert.match(lastLine(run.stdout), /public-safe --tree/);
    assert.match(lastLine(run.stdout), /public-safe --range origin\/main\.\.HEAD/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('structural fail', () => {
  const fixture = makeRepo({ brokenSkill: true });
  try {
    const run = runGate(fixture.repo, { denylist: fixture.denylist });
    const line = lastLine(run.stdout);
    assert.notEqual(run.status, 0);
    assert.match(line, /^pr-ready: FAIL /);
    assert.match(line, /structural skills\/example\/SKILL\.md: missing missing\.md/);
    assert.doesNotMatch(line, /public-safe/);
    assert.doesNotMatch(line, /denylist/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('missing denylist', () => {
  const fixture = makeRepo({ withSkill: false });
  try {
    const run = runGate(fixture.repo);
    const line = lastLine(run.stdout);
    assert.notEqual(run.status, 0);
    assert.match(line, /^pr-ready: FAIL /);
    assert.match(line, /denylist/);
    assert.match(line, /fail closed/);
    assert.equal(existsScannerLog(fixture.repo), false);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

function existsScannerLog(repo) {
  try {
    readFileSync(path.join(repo, 'scanner-args.txt'));
    return true;
  } catch {
    return false;
  }
}

test('this pack\'s skill files pass the structural checks', () => {
  assert.deepEqual(structureProblems(repoRoot), []);
});

test('dirty tree fails', () => {
  const fixture = makeRepo();
  try {
    writeFileSync(path.join(fixture.repo, 'uncommitted.txt'), 'not in HEAD\n');
    const run = runGate(fixture.repo, { denylist: fixture.denylist });
    const line = lastLine(run.stdout);
    assert.notEqual(run.status, 0);
    assert.match(line, /^pr-ready: FAIL /);
    assert.match(line, /dirty tree/);
    assert.doesNotMatch(line, /pr-ready: PASS/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('behind origin/main fails', () => {
  const fixture = makeRepo();
  try {
    git(fixture.repo, ['commit', '--allow-empty', '-m', 'main moves']);
    git(fixture.repo, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
    git(fixture.repo, ['reset', '--hard', 'HEAD~1']);
    const run = runGate(fixture.repo, { denylist: fixture.denylist });
    const line = lastLine(run.stdout);
    assert.notEqual(run.status, 0);
    assert.match(line, /^pr-ready: FAIL /);
    assert.match(line, /origin\/main is not an ancestor of HEAD/);
    assert.doesNotMatch(line, /pr-ready: PASS/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('crashing gitleaks fails', () => {
  const fixture = makeRepo({ withSkill: true });
  try {
    writeFileSync(path.join(fixture.repo, 'scripts', 'check-public-safe.mjs'), readFileSync(publicSafeSrc));
    writeFileSync(path.join(fixture.repo, 'note.txt'), `token\n${FAKE_TOKEN}\n`);
    git(fixture.repo, ['add', '-A']);
    git(fixture.repo, ['commit', '-m', 'fake token']);
    const bin = path.join(fixture.parent, 'bin');
    crashingGitleaks(bin);
    const run = runGate(fixture.repo, {
      denylist: fixture.denylist,
      extraEnv: { PATH: `${bin}${path.delimiter}${process.env.PATH || ''}` },
    });
    const line = lastLine(run.stdout);
    assert.notEqual(run.status, 0, `${run.stdout}\n${run.stderr}`);
    assert.match(line, /^pr-ready: FAIL /);
    assert.match(line, /public-safe/);
    assert.doesNotMatch(line, /pr-ready: PASS/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});
