#!/usr/bin/env node
// pr-ready for this pack. Lighter than a product check:pr-ready:
// a clean tree whose HEAD contains origin/main, public-safe on that commit
// and on origin/main..HEAD, then the skill structure this repo already
// requires, then installed-copy drift when a baseline or export manifest exists.
//
//   node scripts/check-pr-ready.mjs
//   node --test scripts/check-pr-ready.test.mjs
//
// The last line is `pr-ready: PASS <HEAD sha>` or `pr-ready: FAIL <reasons>`.
// No package.json in this repo, so there is no npm script.
//
// Public-safe allow and omit stay in scripts/check-public-safe.mjs. This file
// does not add a denylist exception. A missing denylist is a failure.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASELINE = '.sync-workspace-baseline';
const MIRROR_MARKER = '.synced-by-sync-workspace';
const EXPORT_MANIFEST = 'export-manifest.json';
// Installed beside this pack. Every skill already links here; the file is not
// in this git tree. MAINTAINING.md: skill links stay relative, and they do not
// point at README.md or docs/.
const SIBLING_PACK_LINK = 'skills/umbrella/PROJECT-CONFIG.md';
const STRUCTURAL_SCRIPTS = ['scripts/check-steps.mjs', 'scripts/check-shared-flow.mjs'];

function normEol(text) {
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function git(top, args) {
  const run = spawnSync('git', args, { cwd: top, encoding: 'utf8' });
  if (run.status !== 0) {
    const detail = (run.stderr || run.stdout || '').trim().split('\n')[0];
    throw new Error(detail || `git ${args.join(' ')} failed`);
  }
  return run.stdout.trim();
}

// Same lookup order as scripts/check-public-safe.mjs. No fourth source.
function findDenylist(top) {
  if (process.env.PUBLIC_SAFE_DENYLIST) return process.env.PUBLIC_SAFE_DENYLIST;
  const cfg = spawnSync('git', ['config', '--get', 'publicsafe.denylist'], { cwd: top, encoding: 'utf8' });
  if (cfg.status === 0 && cfg.stdout.trim()) return cfg.stdout.trim();
  const parent = path.dirname(top);
  try {
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(parent, entry.name, 'public-safe', 'denylist.txt');
      if (existsSync(candidate)) return candidate;
    }
  } catch {
    // unreadable parent: fail closed below
  }
  return null;
}

function runNode(top, args) {
  const run = spawnSync(process.execPath, args, { cwd: top, encoding: 'utf8' });
  const text = `${run.stdout || ''}${run.stderr || ''}`.trim();
  if (text) console.error(text);
  return run.status === 0;
}

function frontmatterBlock(text) {
  const body = normEol(text);
  if (!body.startsWith('---\n')) return null;
  const end = body.indexOf('\n---\n', 4);
  if (end < 0) return null;
  return body.slice(4, end);
}

function skillFiles(root) {
  const skillsDir = path.join(root, 'skills');
  if (!existsSync(skillsDir)) return [];
  const out = [];
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (existsSync(skillMd)) out.push(entry.name);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function linkTarget(hrefRaw) {
  let href = hrefRaw.trim().replace(/\s+(?:"[^"]*"|'[^']*')\s*$/, '').trim();
  if (!href || href.startsWith('#')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  if (href.startsWith('<') && href.endsWith('>')) href = href.slice(1, -1).trim();
  if (!href.includes('/') && !href.includes('.')) return null;
  return href;
}

function linkProblems(root, relFile, text) {
  const problems = [];
  const body = normEol(text).replace(/```[\s\S]*?```/g, '');
  const fromDir = path.posix.dirname(relFile);
  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = linkTarget(match[1]);
    if (!target) continue;
    let rel = path.posix.normalize(path.posix.join(fromDir, target));
    if (rel.startsWith('./')) rel = rel.slice(2);
    const docsOrReadme = rel === 'README.md'
      || rel.endsWith('/README.md')
      || rel === 'docs'
      || rel.startsWith('docs/')
      || rel.includes('/docs/');
    if (docsOrReadme) {
      problems.push(`${relFile}: links to ${rel}`);
      continue;
    }
    if (rel.startsWith('..') || path.posix.isAbsolute(rel)) {
      problems.push(`${relFile}: link escapes the repo (${target})`);
      continue;
    }
    if (rel === SIBLING_PACK_LINK) continue;
    const abs = path.join(root, ...rel.split('/'));
    if (!existsSync(abs)) problems.push(`${relFile}: missing ${target}`);
  }
  return problems;
}

function markdownFiles(dir) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) visit(abs);
      else if (entry.isFile() && entry.name.endsWith('.md')) files.push(abs);
    }
  };
  visit(dir);
  return files;
}

/** Skill frontmatter, agent files, and relative links. Empty when the tree matches the files already in this pack. */
export function structureProblems(root) {
  const problems = [];
  for (const name of skillFiles(root)) {
    const skillDir = path.join(root, 'skills', name);
    for (const abs of markdownFiles(skillDir)) {
      const rel = path.relative(root, abs).split(path.sep).join('/');
      let text;
      try {
        text = readFileSync(abs, 'utf8');
      } catch {
        problems.push(`${rel}: unreadable`);
        continue;
      }
      if (rel === `skills/${name}/SKILL.md`) {
        const fm = frontmatterBlock(text);
        if (fm === null) problems.push(`${rel}: frontmatter missing or unclosed`);
        else {
          if (!/^name:\s*\S/m.test(fm)) problems.push(`${rel}: frontmatter has no name`);
          if (!/^description:\s*\S/m.test(fm)) problems.push(`${rel}: frontmatter has no description`);
        }
      }
      problems.push(...linkProblems(root, rel, text));
    }
    const agentRel = `skills/${name}/agents/openai.yaml`;
    const agentFile = path.join(root, 'skills', name, 'agents', 'openai.yaml');
    if (!existsSync(agentFile)) continue;
    const agent = normEol(readFileSync(agentFile, 'utf8'));
    if (!/^\s*display_name:/m.test(agent)) problems.push(`${agentRel}: no display_name`);
    if (!/^\s*short_description:/m.test(agent)) problems.push(`${agentRel}: no short_description`);
  }
  return problems;
}

function structuralScriptProblems(top) {
  const problems = [];
  for (const rel of STRUCTURAL_SCRIPTS) {
    if (!existsSync(path.join(top, rel))) continue;
    const ok = runNode(top, [rel]);
    if (!ok) problems.push(rel);
  }
  return problems;
}

// Same tree hash as umbrella-skills scripts/sync-workspace.mjs. The baseline
// file itself is not part of the hash.
function treeHash(dir) {
  const hash = createHash('sha256');
  const walk = (rel) => {
    const abs = rel ? path.join(dir, rel) : dir;
    const entries = readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (!rel && entry.name === BASELINE) continue;
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      const childAbs = path.join(dir, child);
      if (entry.isSymbolicLink()) {
        hash.update('symlink\0');
        hash.update(child);
        hash.update('\0');
        hash.update(readlinkSync(childAbs));
        hash.update('\0');
      } else if (entry.isDirectory()) {
        hash.update('dir\0');
        hash.update(child);
        hash.update('\0');
        if (!walk(child)) return false;
      } else if (entry.isFile()) {
        hash.update('file\0');
        hash.update(child);
        hash.update('\0');
        hash.update(readFileSync(childAbs));
        hash.update('\0');
      } else {
        return false;
      }
    }
    return true;
  };
  if (!walk('')) return null;
  return hash.digest('hex');
}

function walkNamed(root, names, found) {
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === '.git') continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(abs);
      else if (names.includes(entry.name)) found.push(abs);
    }
  };
  visit(root);
}

function baselineProblem(dir, root) {
  const baselinePath = path.join(dir, BASELINE);
  let info;
  try {
    info = lstatSync(baselinePath);
  } catch {
    return `installed copy missing baseline: ${path.relative(root, dir).split(path.sep).join('/')}`;
  }
  if (!info.isFile()) {
    return `installed copy baseline is not a regular file: ${path.relative(root, dir).split(path.sep).join('/')}`;
  }
  const recorded = readFileSync(baselinePath, 'utf8').trim();
  const actual = treeHash(dir);
  if (actual === null) return `installed copy unreadable: ${path.relative(root, dir).split(path.sep).join('/')}`;
  if (recorded !== actual) return `installed copy hand-edited: ${path.relative(root, dir).split(path.sep).join('/')}`;
  return null;
}

function manifestProblems(abs, root) {
  const rel = path.relative(root, abs).split(path.sep).join('/');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(abs, 'utf8'));
  } catch {
    return [`export manifest unreadable: ${rel}`];
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.files || typeof parsed.files !== 'object') {
    return [`export manifest unreadable: ${rel}`];
  }
  const problems = [];
  for (const [fileRel, expected] of Object.entries(parsed.files)) {
    if (typeof expected !== 'string' || fileRel.split('/').includes('..')) {
      problems.push(`export manifest unreadable: ${rel}`);
      continue;
    }
    const fileAbs = path.join(root, ...fileRel.split('/'));
    if (!existsSync(fileAbs)) {
      problems.push(`export manifest missing ${fileRel}`);
      continue;
    }
    const actual = createHash('sha256').update(readFileSync(fileAbs)).digest('hex');
    if (actual !== expected) problems.push(`export manifest hand-edited: ${fileRel}`);
  }
  return problems;
}

export function generatedCopyReport(root) {
  const baselines = [];
  const markers = [];
  const manifests = [];
  walkNamed(root, [BASELINE], baselines);
  walkNamed(root, [MIRROR_MARKER], markers);
  walkNamed(root, [EXPORT_MANIFEST], manifests);
  const baselineDirs = new Set(baselines.map((file) => path.dirname(file)));
  const problems = [];
  for (const dir of baselineDirs) {
    const problem = baselineProblem(dir, root);
    if (problem) problems.push(problem);
  }
  for (const marker of markers) {
    const dir = path.dirname(marker);
    if (!baselineDirs.has(dir)) {
      problems.push(`installed copy missing baseline: ${path.relative(root, dir).split(path.sep).join('/')}`);
    }
  }
  for (const manifest of manifests) problems.push(...manifestProblems(manifest, root));
  const note = baselines.length === 0 && markers.length === 0 && manifests.length === 0
    ? 'generated copies: none (skipped)'
    : null;
  return { note, problems };
}

function worktreeProblem(top) {
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: top, encoding: 'utf8' });
  if (status.status !== 0) return 'git status failed';
  if (status.stdout.trim()) return 'dirty tree';
  return null;
}

function behindMainProblem(top) {
  const hasBase = spawnSync('git', ['rev-parse', '--verify', '-q', 'origin/main'], { cwd: top, encoding: 'utf8' });
  if (hasBase.status !== 0) return 'origin/main not found';
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { cwd: top, encoding: 'utf8' });
  if (ancestor.status !== 0) return 'origin/main is not an ancestor of HEAD';
  return null;
}

function publicSafeProblems(top) {
  const deny = findDenylist(top);
  if (!deny || !existsSync(deny)) {
    return ['private denylist not found (fail closed). Set PUBLIC_SAFE_DENYLIST, git config publicsafe.denylist, or a sibling public-safe/denylist.txt'];
  }
  const script = path.join(top, 'scripts', 'check-public-safe.mjs');
  if (!existsSync(script)) return ['public-safe script missing'];
  const problems = [];
  if (!runNode(top, [script, '--tree'])) problems.push('public-safe --tree');
  const hasBase = spawnSync('git', ['rev-parse', '--verify', '-q', 'origin/main'], { cwd: top, encoding: 'utf8' }).status === 0;
  if (!hasBase) problems.push('public-safe --range origin/main..HEAD (origin/main not found)');
  else if (!runNode(top, [script, '--range', 'origin/main..HEAD'])) problems.push('public-safe --range origin/main..HEAD');
  return problems;
}

function finish(sha, reasons, note) {
  if (note) console.log(note);
  if (reasons.length === 0) console.log(`pr-ready: PASS ${sha}`);
  else console.log(`pr-ready: FAIL ${reasons.join('; ')}`);
  process.exit(reasons.length === 0 ? 0 : 1);
}

function main() {
  const topRun = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (topRun.status !== 0) {
    console.log('pr-ready: FAIL not a git checkout');
    process.exit(1);
  }
  const top = topRun.stdout.trim();
  let sha = 'HEAD';
  const reasons = [];
  try {
    sha = git(top, ['rev-parse', 'HEAD']);
    const dirty = worktreeProblem(top);
    if (dirty) reasons.push(dirty);
    const behind = behindMainProblem(top);
    if (behind) reasons.push(behind);
    // A dirty worktree is not HEAD. Do not scan it and then name that sha.
    let note = null;
    if (!dirty) {
      reasons.push(...publicSafeProblems(top));
      for (const problem of structureProblems(top)) reasons.push(`structural ${problem}`);
      for (const problem of structuralScriptProblems(top)) reasons.push(`structural ${problem}`);
      const generated = generatedCopyReport(top);
      reasons.push(...generated.problems);
      note = generated.note;
    }
    finish(sha, reasons, note);
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : 'pr-ready failed';
    finish(sha, [...reasons, message], null);
  }
}

function invokedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invokedDirectly()) main();
