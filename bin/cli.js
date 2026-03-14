#!/usr/bin/env node

const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const crypto        = require('crypto');
const { execSync }  = require('child_process');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
const COMMANDS     = ['dream', 'setup', 'fix', 'evolve', 'debate', 'persist', 'level-up', 'ship', 'status', 'explain', 'loop', 'add', 'review', 'test', 'plan'];

function ok(msg)   { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function info(msg) { console.log(`  · ${msg}`); }

// ─── Security ─────────────────────────────────────────────────────────────────

const DANGEROUS_CHARS = /[;|&`$()><]/;

function sanitizePath(filePath) {
  if (DANGEROUS_CHARS.test(filePath)) {
    warn(`Rejected path with shell metacharacters: ${filePath}`);
    return false;
  }
  return true;
}

function generateIntegrityHash(hooksObj) {
  const content = JSON.stringify(hooksObj, null, 2);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyIntegrity(cli) {
  if (!cli.hooksDir) return true;
  const settingsPath  = path.join(cli.hooksDir, 'settings.json');
  const integrityPath = path.join(cli.hooksDir, '.azclaude-integrity');

  if (!fs.existsSync(integrityPath) || !fs.existsSync(settingsPath)) return true;

  try {
    const settings   = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const savedHash  = fs.readFileSync(integrityPath, 'utf8').trim();
    const currentHash = generateIntegrityHash(settings.hooks || {});
    if (savedHash !== currentHash) {
      warn('Hook integrity mismatch — hooks in settings.json were modified since last AZCLAUDE install');
      warn('Verify your hooks manually before continuing.');
      return false;
    }
    ok('Hook integrity verified');
  } catch {
    warn('Could not verify hook integrity');
  }
  return true;
}

// ─── CLI Detection ────────────────────────────────────────────────────────────

const CLI_TABLE = [
  { name: 'Claude Code', exe: 'claude',   cfg: '.claude',   rulesFile: 'CLAUDE.md',                 hooksDir: path.join(os.homedir(), '.claude')  },
  { name: 'Gemini CLI',  exe: 'gemini',   cfg: '.gemini',   rulesFile: 'GEMINI.md',                 hooksDir: null                                },
  { name: 'OpenCode',    exe: 'opencode', cfg: '.opencode', rulesFile: 'AGENTS.md',                 hooksDir: null                                },
  { name: 'Codex CLI',   exe: 'codex',    cfg: '.codex',    rulesFile: 'AGENTS.md',                 hooksDir: null                                },
  { name: 'Cursor',      exe: 'cursor',   cfg: '.cursor',   rulesFile: '.cursor/rules/project.mdc', hooksDir: null                                },
];

function detectCLI() {
  // 0. Env override (for testing / explicit selection)
  if (process.env.AZCLAUDE_CLI) {
    const forced = CLI_TABLE.find(c => c.name.toLowerCase().replace(/\s/g,'') === process.env.AZCLAUDE_CLI.toLowerCase());
    if (forced) return forced;
  }

  // 1. Check executable in PATH
  for (const cli of CLI_TABLE) {
    try {
      execSync(`${cli.exe} --version`, { stdio: 'ignore', timeout: 2000 });
      return cli;
    } catch {}
  }

  // 2. Fallback: global config dir in HOME (Claude Code only currently has this)
  for (const cli of CLI_TABLE) {
    if (cli.hooksDir && fs.existsSync(cli.hooksDir)) return cli;
  }

  // 3. Default
  return CLI_TABLE[0];
}

// ─── Path Substitution ────────────────────────────────────────────────────────

// Replace every hardcoded .claude/ reference in a template file with the
// detected cfg path. Called at install time — once — never again at runtime.
function substitutePaths(content, cfg) {
  return content.replace(/\.claude\//g, `${cfg}/`);
}

// ─── Global Hooks ─────────────────────────────────────────────────────────────

function installGlobalHooks(cli) {
  if (!cli.hooksDir) {
    warn(`Global hooks not supported for ${cli.name}`);
    info('Session state (goals.md injection, friction stubs) requires manual /persist on this CLI');
    return;
  }

  const settingsPath = path.join(cli.hooksDir, 'settings.json');
  if (!fs.existsSync(cli.hooksDir)) fs.mkdirSync(cli.hooksDir, { recursive: true });

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
    warn(`Existing hooks detected in ${settingsPath}`);
    warn('Manually merge the AZCLAUDE hooks or back up and re-run.');
    return;
  }

  const cfg = cli.cfg;
  const userPromptCmd = [
    `mkdir -p ${cfg}/memory ops/observations shared-skills`,
    `SESSION_MARKER="/tmp/.azclaude-session-\${PPID}"`,
    `if [ ! -f "$SESSION_MARKER" ]; then`,
    `  touch "$SESSION_MARKER"`,
    `  if [ -f ${cfg}/memory/goals.md ]; then`,
    `    echo '--- ACTIVE GOALS ---'`,
    `    grep -v -iE 'ignore.*previous.*instructions|curl.*\\|.*bash|wget.*\\|.*sh|you are now|system prompt' ${cfg}/memory/goals.md || cat ${cfg}/memory/goals.md`,
    `    echo '--- END GOALS ---'`,
    `  fi`,
    `fi`
  ].join('\n');

  const stopCmd = [
    `if [ ! -f ${cfg}/memory/goals.md ]; then exit 0; fi`,
    `STUB="ops/observations/$(date +%Y%m%d-%H%M%S)-friction.md"`,
    `if [ ! -f "$STUB" ]; then`,
    `  printf -- '---\\ndate: %s\\ntype: friction\\n---\\n\\n# Friction\\n\\n(session ended without /persist)\\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STUB"`,
    `  echo '⚠ session state not persisted — run /persist before closing'`,
    `fi`
  ].join('\n');

  settings._azclaude = true;
  settings.hooks = {
    UserPromptSubmit: [{ matcher: '', hooks: [{ type: 'command', command: userPromptCmd }] }],
    Stop:             [{ matcher: '', hooks: [{ type: 'command', command: stopCmd      }] }]
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  // Write integrity hash
  const integrityPath = path.join(cli.hooksDir, '.azclaude-integrity');
  const hash = generateIntegrityHash(settings.hooks);
  fs.writeFileSync(integrityPath, hash);

  ok(`Global hooks installed (${settingsPath})`);
  ok(`Integrity hash written (${integrityPath})`);
  info('Why global: runs in every project — install once, covered everywhere');

  if (process.platform === 'win32') {
    warn('Windows detected: hooks use bash syntax (mkdir -p, date, etc.)');
    warn('Hooks require Git Bash or WSL — they will fail silently in PowerShell.');
    warn(`${cli.name} on Windows typically uses Git Bash — if so, you are covered.`);
  }
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

function installCapabilities(projectDir, cfg) {
  const src = path.join(TEMPLATE_DIR, 'capabilities');
  const dst = path.join(projectDir, cfg, 'capabilities');

  if (fs.existsSync(dst)) {
    ok('Capabilities already installed — skipping');
    return;
  }

  copyDir(src, dst);
  ok(`Capabilities installed (${cfg}/capabilities/)`);
  info('manifest.md is your capability index — read it to find what to load');
}

// ─── Commands (Skills) ────────────────────────────────────────────────────────

function installCommands(projectDir, cfg) {
  const commandsDir = path.join(projectDir, cfg, 'commands');
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

function installScripts(projectDir, cfg) {
  const src = path.join(TEMPLATE_DIR, 'scripts');
  const dst = path.join(projectDir, cfg, 'scripts');
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const d = path.join(dst, entry.name);
    if (!fs.existsSync(d)) {
      fs.copyFileSync(path.join(src, entry.name), d);
      try { fs.chmodSync(d, '755'); } catch {}
    }
  }
  ok(`Scripts installed (${cfg}/scripts/) — env-scan.sh outputs JSON, not 15 tool calls`);
}

// ─── Agents ───────────────────────────────────────────────────────────────────

function installAgents(projectDir, cfg) {
  const agentsDir = path.join(projectDir, cfg, 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });

  const src = path.join(TEMPLATE_DIR, 'agents', 'orchestrator-init.md');
  const dst = path.join(agentsDir, 'orchestrator-init.md');
  if (!fs.existsSync(dst) && fs.existsSync(src)) {
    const content = substitutePaths(fs.readFileSync(src, 'utf8'), cfg);
    fs.writeFileSync(dst, content);
    ok('orchestrator-init agent installed');
    info('Fires once during /setup, then exits — not a persistent routing agent');
  }
}

// ─── Rules File (CLAUDE.md / GEMINI.md / AGENTS.md) ──────────────────────────

function installRulesFile(projectDir, cfg, rulesFile) {
  const dst = path.join(projectDir, rulesFile);

  // Ensure parent dir exists (e.g. .cursor/rules/)
  fs.mkdirSync(path.dirname(dst), { recursive: true });

  if (fs.existsSync(dst)) {
    info(`${rulesFile} already exists — run /setup to fill in project details`);
    return;
  }

  const src = path.join(TEMPLATE_DIR, 'CLAUDE.md');
  const content = substitutePaths(fs.readFileSync(src, 'utf8'), cfg);
  fs.writeFileSync(dst, content);
  ok(`${rulesFile} created — run /setup to configure for this project`);
}

// ─── Directories ──────────────────────────────────────────────────────────────

function createDirectories(projectDir, cfg) {
  const dirs = [
    `${cfg}/memory/sessions`,
    `${cfg}/memory/learnings`,
    'ops/observations',
    'shared-skills'
  ];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
  }
  ok('Memory directories created');

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

      // Verify checksums if available
      const checksumsPath = path.join(dir, '.checksums');
      if (fs.existsSync(checksumsPath)) {
        const checksums = fs.readFileSync(checksumsPath, 'utf8').split('\n').filter(Boolean);
        const checksumMap = {};
        for (const line of checksums) {
          const [hash, file] = line.split('  ');
          if (hash && file) checksumMap[file.trim()] = hash.trim();
        }
        for (const skill of skills) {
          if (checksumMap[skill]) {
            const content = fs.readFileSync(path.join(dir, skill), 'utf8');
            const actual  = crypto.createHash('sha256').update(content).digest('hex');
            if (actual !== checksumMap[skill]) {
              warn(`Checksum mismatch for ${skill} — file may have been tampered with`);
            } else {
              ok(`${skill} checksum verified`);
            }
          }
        }
      }
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
const cli        = detectCLI();

console.log('\n════════════════════════════════════════════════');
console.log('  AZCLAUDE — AI Coding Environment');
console.log(`  CLI: ${cli.name} → installing to ${cli.cfg}/`);
console.log('════════════════════════════════════════════════\n');

verifyIntegrity(cli);
installGlobalHooks(cli);
installCapabilities(projectDir, cli.cfg);
installCommands(projectDir, cli.cfg);
installScripts(projectDir, cli.cfg);
installAgents(projectDir, cli.cfg);
installRulesFile(projectDir, cli.cfg, cli.rulesFile);
createDirectories(projectDir, cli.cfg);
ensureSharedSkillsDir();

console.log('\n════════════════════════════════════════════════');
console.log('  Architecture: lazy-loaded, manifest-driven');
console.log('  Token cost per task: ~200-600 (vs ~21,000 monolith)');
console.log(`  Next step: run /setup to configure this project`);
console.log('════════════════════════════════════════════════\n');
