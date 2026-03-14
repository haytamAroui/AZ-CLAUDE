#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
const COMMANDS     = ['dream', 'setup', 'fix', 'evolve', 'debate', 'persist', 'level-up', 'ship', 'status', 'explain', 'loop'];

function ok(msg)   { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function info(msg) { console.log(`  · ${msg}`); }

// ─── Global Hooks ────────────────────────────────────────────────────────────

function installGlobalHooks() {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const settingsDir  = path.dirname(settingsPath);

  if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch {}
  }

  if (settings._azclaude) {
    ok('Global hooks already installed — skipping');
    return;
  }

  const hasExistingHooks = settings.hooks && Object.keys(settings.hooks).length > 0;
  if (hasExistingHooks) {
    warn('Existing hooks detected in ~/.claude/settings.json');
    warn('Manually merge the AZCLAUDE hooks or back up and re-run.');
    return;
  }

  const userPromptCmd = [
    "mkdir -p .claude/memory ops/observations shared-skills",
    "SESSION_MARKER=\"/tmp/.azclaude-session-${PPID}\"",
    "if [ ! -f \"$SESSION_MARKER\" ]; then",
    "  touch \"$SESSION_MARKER\"",
    "  if [ -f .claude/memory/goals.md ]; then",
    "    echo '--- ACTIVE GOALS ---'",
    "    cat .claude/memory/goals.md",
    "    echo '--- END GOALS ---'",
    "  fi",
    "fi"
  ].join('\n');

  const stopCmd = [
    "if [ ! -f .claude/memory/goals.md ]; then exit 0; fi",
    "STUB=\"ops/observations/$(date +%Y%m%d-%H%M%S)-friction.md\"",
    "if [ ! -f \"$STUB\" ]; then",
    "  printf -- '---\\ndate: %s\\ntype: friction\\n---\\n\\n# Friction\\n\\n(session ended without /persist)\\n' \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" > \"$STUB\"",
    "  echo '⚠ session state not persisted — run /persist before closing'",
    "fi"
  ].join('\n');

  settings._azclaude = true;
  settings.hooks = {
    UserPromptSubmit: [{ matcher: '', hooks: [{ type: 'command', command: userPromptCmd }] }],
    Stop:             [{ matcher: '', hooks: [{ type: 'command', command: stopCmd      }] }]
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  ok('Global hooks installed (~/.claude/settings.json)');
  info('Why global: runs in every project — install once, covered everywhere');

  // Windows compatibility warning
  if (process.platform === 'win32') {
    warn('Windows detected: hooks use bash syntax (mkdir -p, date -r, etc.)');
    warn('Hooks require Git Bash or WSL — they will fail silently in PowerShell.');
    warn('Claude Code on Windows typically uses Git Bash — if so, you are covered.');
  }
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

function installCapabilities(projectDir) {
  const src = path.join(TEMPLATE_DIR, 'capabilities');
  const dst = path.join(projectDir, '.claude', 'capabilities');

  if (fs.existsSync(dst)) {
    ok('Capabilities already installed — skipping');
    return;
  }

  copyDir(src, dst);
  ok('Capabilities installed (.claude/capabilities/)');
  info('manifest.md is your capability index — read it to find what to load');
}

// ─── Commands (Skills) ────────────────────────────────────────────────────────

function installCommands(projectDir) {
  const commandsDir = path.join(projectDir, '.claude', 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });

  for (const cmd of COMMANDS) {
    const src = path.join(TEMPLATE_DIR, 'commands', `${cmd}.md`);
    const dst = path.join(commandsDir, `${cmd}.md`);
    if (!fs.existsSync(dst) && fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      ok(`/${cmd} installed`);
    } else if (fs.existsSync(dst)) {
      info(`/${cmd} already exists — skipping`);
    }
  }
}

// ─── Scripts ──────────────────────────────────────────────────────────────────

function installScripts(projectDir) {
  const src = path.join(TEMPLATE_DIR, 'scripts');
  const dst = path.join(projectDir, '.claude', 'scripts');
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const d = path.join(dst, entry.name);
    if (!fs.existsSync(d)) {
      fs.copyFileSync(path.join(src, entry.name), d);
      // Make shell scripts executable on Unix
      try { fs.chmodSync(d, '755'); } catch {}
    }
  }
  ok('Scripts installed (.claude/scripts/) — env-scan.sh outputs JSON, not 15 tool calls');
}

// ─── Agents ───────────────────────────────────────────────────────────────────

function installAgents(projectDir) {
  const agentsDir = path.join(projectDir, '.claude', 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });

  const src = path.join(TEMPLATE_DIR, 'agents', 'orchestrator-init.md');
  const dst = path.join(agentsDir, 'orchestrator-init.md');
  if (!fs.existsSync(dst) && fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    ok('orchestrator-init agent installed');
    info('Fires once during /setup, then exits — not a persistent routing agent');
  }
}

// ─── CLAUDE.md ────────────────────────────────────────────────────────────────

function installClaudeMd(projectDir) {
  const dst = path.join(projectDir, 'CLAUDE.md');
  if (fs.existsSync(dst)) {
    info('CLAUDE.md already exists — run /setup to fill in project details');
    return;
  }
  const src = path.join(TEMPLATE_DIR, 'CLAUDE.md');
  fs.copyFileSync(src, dst);
  ok('CLAUDE.md created — run /setup to configure for this project');
}

// ─── Directories ──────────────────────────────────────────────────────────────

function createDirectories(projectDir) {
  const dirs = [
    '.claude/memory/sessions',
    '.claude/memory/learnings',
    'ops/observations',
    'shared-skills'
  ];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
  }
  ok('Memory directories created');

  // Create knowledge-index stub if knowledge/ directory already exists
  const knowledgeDir   = path.join(projectDir, 'knowledge');
  const knowledgeIndex = path.join(projectDir, 'knowledge-index.md');
  if (fs.existsSync(knowledgeDir) && !fs.existsSync(knowledgeIndex)) {
    fs.writeFileSync(knowledgeIndex,
      '| file | summary | key_questions | tags |\n' +
      '|------|---------|--------------|------|\n' +
      '| (run /setup to populate this index) | | | |\n'
    );
    ok('knowledge-index.md stub created (run /setup to populate)');
  }
}

// ─── Shared Skills ────────────────────────────────────────────────────────────

function ensureSharedSkillsDir() {
  const dir = path.join(os.homedir(), 'shared-skills');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    ok('~/shared-skills created (global portable skills directory)');
  } else {
    info('~/shared-skills exists — checking for portable skills');
    const skills = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    if (skills.length > 0) {
      info(`  ${skills.length} portable skill(s) available: ${skills.join(', ')}`);
      info('  Run /setup to import skills that match this project\'s stack');
    }
  }
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const projectDir = process.cwd();

console.log('\n════════════════════════════════════════════════');
console.log('  AZCLAUDE — Claude Code Native Environment');
console.log('════════════════════════════════════════════════\n');

installGlobalHooks();
installCapabilities(projectDir);
installCommands(projectDir);
installScripts(projectDir);
installAgents(projectDir);
installClaudeMd(projectDir);
createDirectories(projectDir);
ensureSharedSkillsDir();

console.log('\n════════════════════════════════════════════════');
console.log('  Architecture: lazy-loaded, manifest-driven');
console.log('  Token cost per task: ~200-600 (vs ~21,000 monolith)');
console.log('  Next step: run /setup to configure this project');
console.log('════════════════════════════════════════════════\n');
