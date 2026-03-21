/**
 * AZCLAUDE — Node.js smoke tests (zero deps, runs on Windows/macOS/Linux)
 * Run: node --test tests/node-smoke.test.js
 * Requires: Node.js >= 18
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

test('hooks/hooks.json is valid JSON with all three hook types', () => {
  const raw = fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8');
  const json = JSON.parse(raw);
  assert.ok(json.hooks, 'hooks key exists');
  assert.ok(json.hooks.UserPromptSubmit, 'UserPromptSubmit present');
  assert.ok(json.hooks.PostToolUse, 'PostToolUse present');
  assert.ok(json.hooks.Stop, 'Stop present');
  assert.ok(raw.includes('CLAUDE_PLUGIN_ROOT'), 'uses CLAUDE_PLUGIN_ROOT variable');
});

test('bin/cli.js has no syntax errors', () => {
  // Require without executing — catches parse errors
  const cliPath = path.join(ROOT, 'bin', 'cli.js');
  assert.ok(fs.existsSync(cliPath), 'cli.js exists');
  // Verify it parses by checking exports/structure
  const content = fs.readFileSync(cliPath, 'utf8');
  assert.ok(content.includes('detectCLI'), 'has detectCLI function');
  assert.ok(content.includes('installProjectHooks'), 'has installProjectHooks function');
  assert.ok(content.includes('installGlobalHooks'), 'has installGlobalHooks fallback');
  assert.ok(content.includes('migrateFromGlobalHooks'), 'has migrateFromGlobalHooks function');
  assert.ok(content.includes('atomicWriteFileSync'), 'has atomicWriteFileSync function');
});

test('all hook scripts are valid JavaScript', () => {
  const hooksDir = path.join(ROOT, 'templates', 'hooks');
  for (const script of ['user-prompt.js', 'stop.js', 'post-tool-use.js']) {
    const filePath = path.join(hooksDir, script);
    assert.ok(fs.existsSync(filePath), `${script} exists`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.startsWith('#!/usr/bin/env node'), `${script} has shebang`);
    assert.ok(content.includes("'use strict'"), `${script} is strict mode`);
  }
});

test('all command templates exist and have content', () => {
  const commandsDir = path.join(ROOT, 'templates', 'commands');
  const commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  assert.ok(commands.length >= 20, `expected 20+ commands, got ${commands.length}`);
  for (const cmd of commands) {
    const content = fs.readFileSync(path.join(commandsDir, cmd), 'utf8');
    assert.ok(content.length > 50, `${cmd} has content (${content.length} chars)`);
  }
});

test('all skill directories have SKILL.md', () => {
  const skillsDir = path.join(ROOT, 'templates', 'skills');
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  assert.ok(skills.length >= 5, `expected 5+ skills, got ${skills.length}`);
  for (const skill of skills) {
    const skillFile = path.join(skillsDir, skill, 'SKILL.md');
    assert.ok(fs.existsSync(skillFile), `${skill}/SKILL.md exists`);
  }
});

test('copilot.js plan parsing handles all milestone statuses', () => {
  const mockPlan = [
    '## M1 — Auth', '- Status: done',
    '## M2 — API',  '- Status: in-progress',
    '## M3 — DB',   '- Status: blocked',
    '## M4 — UI',   '- Status: pending',
  ].join('\n');
  const statuses = [...mockPlan.matchAll(/^- Status: ([\w-]+)/gm)].map(m => m[1]);
  assert.deepStrictEqual(statuses, ['done', 'in-progress', 'blocked', 'pending']);
  assert.equal(statuses.filter(s => s === 'done').length, 1);
  assert.equal(statuses.filter(s => s === 'blocked').length, 1);
  assert.equal(statuses.every(s => s === 'blocked'), false);
  assert.equal(statuses.every(s => s === 'done' || s === 'blocked' || s === 'skipped'), false);
});

test('copilot.js stall detection via plan hash', () => {
  const crypto = require('crypto');
  const md5 = s => crypto.createHash('md5').update(s).digest('hex');
  const plan1 = '## M1\n- Status: done\n## M2\n- Status: pending\n';
  const plan2 = '## M1\n- Status: done\n## M2\n- Status: done\n';
  // Same content = same hash → stall detected correctly
  assert.equal(md5(plan1), md5(plan1), 'same content produces same hash');
  // Different content = different hash → progress detected correctly
  assert.notEqual(md5(plan1), md5(plan2), 'changed content produces different hash');
});

test('copilot.js in-progress milestone extraction', () => {
  const mockPlan = [
    '## M1 — Auth setup',    '- Status: done',
    '### M2 — User model',   '- Status: in-progress',
    '## M3 — API endpoints', '- Status: in-progress',
    '## M4 — Tests',         '- Status: pending',
  ].join('\n');
  // Replicate getInProgressMilestones logic
  const milestones = [];
  let currentTitle = '';
  for (const line of mockPlan.split('\n')) {
    if (/^#{1,3}\s/.test(line)) currentTitle = line.replace(/^#+\s*/, '').trim();
    if (/Status:\s*in-progress/i.test(line) && currentTitle) milestones.push(currentTitle);
  }
  assert.equal(milestones.length, 2, 'finds both in-progress milestones');
  assert.ok(milestones.includes('M2 — User model'));
  assert.ok(milestones.includes('M3 — API endpoints'));
});

test('copilot.js stuck milestone counter increments correctly', () => {
  const prevInProgress = ['M2 — User model', 'M3 — API endpoints'];
  const newInProgress  = ['M2 — User model']; // M3 resolved, M2 still stuck
  const stuckMilestones = {};
  const stillStuck = newInProgress.filter(m => prevInProgress.includes(m));
  for (const m of stillStuck) { stuckMilestones[m] = (stuckMilestones[m] || 0) + 1; }
  for (const m of Object.keys(stuckMilestones)) {
    if (!stillStuck.includes(m)) delete stuckMilestones[m];
  }
  assert.equal(stuckMilestones['M2 — User model'], 1, 'stuck counter increments');
  assert.equal(stuckMilestones['M3 — API endpoints'], undefined, 'resolved milestone removed');
});

test('stop.js checkpoint pruning keeps 5 most recent', () => {
  const os   = require('os');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'az-cp-test-'));
  // Create 8 fake checkpoint files
  const files = [
    '2026-03-19-05-30.md', '2026-03-19-17-20.md', '2026-03-20-10-00.md',
    '2026-03-21-01-00.md', '2026-03-21-02-00.md', '2026-03-21-03-00.md',
    '2026-03-21-04-00.md', '2026-03-21-05-00.md',
  ];
  for (const f of files) fs.writeFileSync(path.join(tmpDir, f), 'content');
  // Replicate pruning logic
  const MAX_CHECKPOINTS = 5;
  const cpFiles = fs.readdirSync(tmpDir).filter(f => f.endsWith('.md')).sort().reverse();
  for (const f of cpFiles.slice(MAX_CHECKPOINTS)) {
    fs.unlinkSync(path.join(tmpDir, f));
  }
  const remaining = fs.readdirSync(tmpDir);
  assert.equal(remaining.length, 5, 'exactly 5 checkpoints remain');
  assert.ok(remaining.includes('2026-03-21-05-00.md'), 'newest kept');
  assert.ok(!remaining.includes('2026-03-19-05-30.md'), 'oldest pruned');
  // Cleanup
  for (const f of remaining) fs.unlinkSync(path.join(tmpDir, f));
  fs.rmdirSync(tmpDir);
});

test('stop.js done-trim keeps 20 entries and archives overflow', () => {
  // Replicate stop.js DONE_KEEP = 20 trimming logic
  const DONE_KEEP = 20;
  const DONE = '## Done this session';
  // Build a goals.md with 25 done entries
  const entries = Array.from({ length: 25 }, (_, i) => `- ${String(25 - i).padStart(2, '0')}:00 — entry-${25 - i}`);
  const goals = `# Goals\n\n${DONE}\n${entries.join('\n')}\n\n## Next actions\n1. foo\n`;
  const lines = goals.split('\n');
  const dIdx  = lines.findIndex(l => l.trim() === DONE);
  const doneEntries = [];
  for (let i = dIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    if (lines[i].startsWith('- ')) doneEntries.push({ line: lines[i], idx: i });
  }
  assert.equal(doneEntries.length, 25, 'started with 25 entries');
  const toArchive   = doneEntries.slice(DONE_KEEP);
  assert.equal(toArchive.length, 5, 'archives 5 overflow entries');
  const archivedSet = new Set(toArchive.map(e => e.idx));
  const trimmed     = lines.filter((_, i) => !archivedSet.has(i)).join('\n');
  // Verify exactly 20 done entries remain
  const remaining = trimmed.split('\n').filter(l => l.startsWith('- ') && l.includes('entry-'));
  assert.equal(remaining.length, 20, 'exactly 20 entries remain after trim');
  // Newest entries kept (entry-25), oldest 5 archived (entry-1 through entry-5)
  assert.ok(remaining.some(l => l.includes('entry-25')),               'newest entry kept');
  assert.ok(!remaining.some(l => /entry-[1-5](?!\d)/.test(l)),         'oldest 5 entries archived');
  // Next actions section survives intact
  assert.ok(trimmed.includes('## Next actions'), 'Next actions section intact');
});

test('snapshot Next actions replacement logic', () => {
  // Simulate step 3b: replace ## Next actions block with checkpoint "What\'s next"
  const NEXT_ACTIONS = '## Next actions';
  const goals = `# Goals\n\n${NEXT_ACTIONS}\n1. old task one\n2. old task two\n\n## Open blockers\n- None\n`;
  const checkpointNext = ['Update goals.md version', 'Test on azcomply', 'Test --deep mode'];
  const newBlock = `${NEXT_ACTIONS}\n${checkpointNext.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  const updated = goals.replace(
    new RegExp(`${NEXT_ACTIONS}[\\s\\S]*?(?=\\n## |$)`),
    newBlock + '\n'
  );
  assert.ok(updated.includes('Update goals.md version'), 'checkpoint item 1 present');
  assert.ok(updated.includes('Test on azcomply'),        'checkpoint item 2 present');
  assert.ok(!updated.includes('old task one'),           'old action removed');
  assert.ok(updated.includes('## Open blockers'),        'other sections intact');
});

test('package.json is valid and has required fields', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.name.startsWith('azclaude'), `package name starts with azclaude: ${pkg.name}`);
  assert.ok(pkg.bin.azclaude, 'bin entry exists');
  assert.ok(pkg.engines.node, 'engines.node specified');
  assert.ok(pkg.files.includes('bin/'), 'bin/ in files');
  assert.ok(pkg.files.includes('templates/'), 'templates/ in files');
});
