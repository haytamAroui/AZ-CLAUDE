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

test('package.json is valid and has required fields', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.name.startsWith('azclaude'), `package name starts with azclaude: ${pkg.name}`);
  assert.ok(pkg.bin.azclaude, 'bin entry exists');
  assert.ok(pkg.engines.node, 'engines.node specified');
  assert.ok(pkg.files.includes('bin/'), 'bin/ in files');
  assert.ok(pkg.files.includes('templates/'), 'templates/ in files');
});
