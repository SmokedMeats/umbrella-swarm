import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const scriptSrc = fileURLToPath(new URL('./check-public-safe.mjs', import.meta.url));
const FAKE_TOKEN = 'ghp_' + '1'.repeat(36);

const gitEnv = {
  GIT_AUTHOR_NAME: 'public-safe-test',
  GIT_AUTHOR_EMAIL: 'public-safe-test@example.com',
  GIT_COMMITTER_NAME: 'public-safe-test',
  GIT_COMMITTER_EMAIL: 'public-safe-test@example.com',
};

function git(cwd, args) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...gitEnv } });
  if (run.status !== 0) throw new Error((run.stderr || run.stdout || `git ${args.join(' ')}`).trim());
}

function crashingGitleaks(bin) {
  mkdirSync(bin, { recursive: true });
  const file = path.join(bin, 'gitleaks');
  writeFileSync(file, [
    '#!/usr/bin/env node',
    "import { appendFileSync } from 'node:fs';",
    'const args = process.argv.slice(2);',
    "if (args[0] === 'version') { console.log('stand-in'); process.exit(0); }",
    "if (process.env.GITLEAKS_LOG) appendFileSync(process.env.GITLEAKS_LOG, args.join(' ') + '\\n');",
    "console.error('gitleaks stand-in crashed');",
    'process.exit(1);',
    '',
  ].join('\n'));
  chmodSync(file, 0o755);
}

function makeRepo() {
  const parent = mkdtempSync(path.join(tmpdir(), 'public-safe-'));
  const repo = path.join(parent, 'repo');
  const bin = path.join(parent, 'bin');
  const log = path.join(parent, 'gitleaks.log');
  mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  writeFileSync(path.join(repo, 'scripts', 'check-public-safe.mjs'), readFileSync(scriptSrc));
  writeFileSync(path.join(repo, 'note.txt'), `clean\n${FAKE_TOKEN}\n`);
  crashingGitleaks(bin);
  git(repo, ['init', '-b', 'main']);
  git(repo, ['add', '-A']);
  git(repo, ['commit', '-m', 'base']);
  git(repo, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
  writeFileSync(path.join(repo, 'note.txt'), `committed token\n${FAKE_TOKEN}\n`);
  git(repo, ['add', 'note.txt']);
  git(repo, ['commit', '-m', 'add fake token']);
  const denylist = path.join(parent, 'denylist.txt');
  writeFileSync(denylist, 'DENY_MARKER_NOT_IN_THE_TREE\n');
  return { parent, repo, bin, log, denylist };
}

function runScan(fixture, args) {
  const env = {
    ...process.env,
    ...gitEnv,
    PUBLIC_SAFE_DENYLIST: fixture.denylist,
    PATH: `${fixture.bin}${path.delimiter}${process.env.PATH}`,
    GITLEAKS_LOG: fixture.log,
  };
  return spawnSync(process.execPath, ['scripts/check-public-safe.mjs', ...args], {
    cwd: fixture.repo,
    encoding: 'utf8',
    env,
  });
}

function output(run) {
  return `${run.stdout || ''}${run.stderr || ''}`;
}

test('crashing gitleaks and a fake token fail --tree', () => {
  const fixture = makeRepo();
  try {
    const run = runScan(fixture, ['--tree']);
    const text = output(run);
    assert.notEqual(run.status, 0);
    assert.match(text, /check:public-safe FAIL/);
    assert.match(text, /fail closed/);
    assert.doesNotMatch(text, /check:public-safe PASS/);
    assert.match(readFileSync(fixture.log, 'utf8'), /^dir /m);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('crashing gitleaks and a fake token fail the commit range', () => {
  const fixture = makeRepo();
  try {
    const run = runScan(fixture, ['--range', 'origin/main..HEAD']);
    const text = output(run);
    assert.notEqual(run.status, 0);
    assert.match(text, /check:public-safe FAIL/);
    assert.match(text, /fail closed/);
    assert.doesNotMatch(text, /check:public-safe PASS/);
    assert.match(readFileSync(fixture.log, 'utf8'), /^git /m);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

function cleanGitleaks(bin) {
  const file = path.join(bin, 'gitleaks');
  writeFileSync(file, `#!/usr/bin/env node
import { appendFileSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args[0] === 'version') {
  console.log('stand-in');
  process.exit(0);
}
if (process.env.GITLEAKS_LOG) appendFileSync(process.env.GITLEAKS_LOG, args.join(' ') + '\\n');
const at = args.indexOf('--report-path');
if (at < 0 || !args[at + 1]) {
  console.error('missing report path');
  process.exit(2);
}
writeFileSync(args[at + 1], '[]');
process.exit(0);
`);
  chmodSync(file, 0o755);
}

test('a clean --tree stdout is only the pass line', () => {
  const fixture = makeRepo();
  try {
    cleanGitleaks(fixture.bin);
    const run = runScan(fixture, ['--tree']);
    const captured = (run.stdout || '').replace(/\n$/, '');
    assert.equal(run.status, 0, output(run));
    assert.match(captured, /^check:public-safe PASS \S+ \(gitleaks 0, denylist 0\)$/);
    assert.doesNotMatch(run.stdout || '', /gitleaks dir/);
    assert.match(run.stderr || '', /gitleaks dir /);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('pre-push of an already-pushed commit passes without gitleaks', () => {
  const fixture = makeRepo();
  try {
    git(fixture.repo, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
    const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: fixture.repo, encoding: 'utf8' }).stdout.trim();
    const stdin = `refs/heads/again ${sha} refs/heads/again ${'0'.repeat(40)}\n`;
    const env = {
      ...process.env,
      ...gitEnv,
      PUBLIC_SAFE_DENYLIST: fixture.denylist,
      PATH: `${fixture.bin}${path.delimiter}${process.env.PATH}`,
      GITLEAKS_LOG: fixture.log,
    };
    const run = spawnSync(process.execPath, ['scripts/check-public-safe.mjs', '--pre-push'], {
      cwd: fixture.repo,
      encoding: 'utf8',
      env,
      input: stdin,
    });
    assert.equal(run.status, 0, output(run));
    assert.match(run.stdout, /check:public-safe PASS/);
    assert.match(run.stdout, /gitleaks did not run/);
    assert.doesNotMatch(`${run.stdout || ''}${run.stderr || ''}`, /gitleaks 0/);
    let log = '';
    try {
      log = readFileSync(fixture.log, 'utf8');
    } catch {
      log = '';
    }
    assert.equal(log, '');
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('an empty --range fails closed', () => {
  const fixture = makeRepo();
  try {
    git(fixture.repo, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
    const run = runScan(fixture, ['--range', 'origin/main..HEAD']);
    const text = output(run);
    assert.notEqual(run.status, 0);
    assert.match(text, /empty range origin\/main\.\.HEAD \(fail closed\)/);
    assert.doesNotMatch(text, /gitleaks 0/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

test('an unresolved range fails closed', () => {
  const fixture = makeRepo();
  try {
    const run = runScan(fixture, ['--range', 'does-not-exist..HEAD']);
    const text = output(run);
    assert.notEqual(run.status, 0);
    assert.match(text, /range not resolved \(fail closed\)/);
    assert.doesNotMatch(text, /check:public-safe PASS/);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});
