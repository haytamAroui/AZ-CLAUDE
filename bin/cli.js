#!/usr/bin/env node

const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const crypto        = require('crypto');
const { execSync }  = require('child_process');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
const CORE_COMMANDS     = ['setup', 'fix', 'add', 'review', 'test', 'plan', 'ship', 'status', 'explain', 'checkpoint', 'persist'];
const EXTENDED_COMMANDS = ['dream', 'refactor', 'doc', 'loop', 'migrate', 'deps', 'find', 'create', 'reflect', 'hookify'];
const ADVANCED_COMMANDS = ['evolve', 'debate', 'level-up', 'copilot'];
const COMMANDS          = [...CORE_COMMANDS, ...EXTENDED_COMMANDS, ...ADVANCED_COMMANDS];

function ok(msg)   { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function info(msg) { console.log(`  · ${msg}`); }

// ─── Security ─────────────────────────────────────────────────────────────────

// Path sanitization is handled in hooks: post-tool-use.js rejects paths
// outside the project root (rel.startsWith('..')) and skips node_modules/.git.

function generateIntegrityHash(hooksObj) {
  const content = JSON.stringify(hooksObj, null, 2);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Atomic write: write to .tmp then rename — prevents corruption on crash/power loss
function atomicWriteFileSync(filePath, data) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

function verifyIntegrity(projectDir, cfg, cli) {
  // Check project-scoped first, then global
  const candidates = [
    { settingsPath: path.join(projectDir, cfg, 'settings.local.json'), integrityPath: path.join(projectDir, cfg, '.azclaude-integrity'), label: 'project' },
  ];
  if (cli.hooksDir) {
    candidates.push({ settingsPath: path.join(cli.hooksDir, 'settings.json'), integrityPath: path.join(cli.hooksDir, '.azclaude-integrity'), label: 'global' });
  }

  for (const { settingsPath, integrityPath, label } of candidates) {
    if (!fs.existsSync(integrityPath) || !fs.existsSync(settingsPath)) continue;
    try {
      const settings    = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const savedHash   = fs.readFileSync(integrityPath, 'utf8').trim();
      const currentHash = generateIntegrityHash(settings.hooks || {});
      if (savedHash !== currentHash) {
        warn(`Hook integrity mismatch (${label}) — hooks were modified since last AZCLAUDE install`);
        warn('Verify your hooks manually before continuing.');
        return false;
      }
      ok(`Hook integrity verified (${label})`);
      return true;
    } catch {
      warn(`Could not verify hook integrity (${label})`);
    }
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

// ─── Hook Scripts ─────────────────────────────────────────────────────────────

const HOOK_SCRIPTS = ['user-prompt.js', 'stop.js', 'post-tool-use.js'];

function copyHookScripts(dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  const srcDir = path.join(TEMPLATE_DIR, 'hooks');
  for (const name of HOOK_SCRIPTS) {
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      try { fs.chmodSync(dst, '755'); } catch (_) {}
    }
  }
  return dstDir;
}

function buildHookEntries(scriptsDir) {
  const nodeExe           = process.execPath;
  const userPromptScript  = path.join(scriptsDir, 'user-prompt.js');
  const stopScript        = path.join(scriptsDir, 'stop.js');
  const postToolUseScript = path.join(scriptsDir, 'post-tool-use.js');
  return {
    UserPromptSubmit: [{ matcher: '',           hooks: [{ type: 'command', command: `"${nodeExe}" "${userPromptScript}"` }] }],
    Stop:             [{ matcher: '',           hooks: [{ type: 'command', command: `"${nodeExe}" "${stopScript}"` }]       }],
    PostToolUse:      [{ matcher: 'Write|Edit', hooks: [{ type: 'command', command: `"${nodeExe}" "${postToolUseScript}"` }] }],
  };
}

// ─── Project-Scoped Hooks (default) ──────────────────────────────────────────
// Installs hooks into <project>/.claude/settings.local.json + <project>/.claude/hooks/
// settings.local.json is gitignored (machine-specific absolute paths).

function installProjectHooks(projectDir, cfg) {
  const hooksDir     = path.join(projectDir, cfg, 'hooks');
  const settingsPath = path.join(projectDir, cfg, 'settings.local.json');

  // Copy hook scripts into project
  const scriptsDir = copyHookScripts(hooksDir);

  // Read existing settings.local.json (may have permissions, env vars, etc.)
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch {}
  }

  if (settings._azclaude) {
    // Already installed — just refresh scripts to latest templates
    ok('Project hooks already installed — scripts refreshed');
    return;
  }

  // Check for existing hooks from other sources
  const hasExistingHooks = settings.hooks && Object.keys(settings.hooks).length > 0;
  if (hasExistingHooks) {
    warn(`Existing hooks in ${settingsPath} — merging AZCLAUDE hooks`);
  }

  // Write hook config
  settings._azclaude = true;
  if (!settings.hooks) settings.hooks = {};
  Object.assign(settings.hooks, buildHookEntries(scriptsDir));

  atomicWriteFileSync(settingsPath, JSON.stringify(settings, null, 2));

  // Write integrity hash
  const integrityPath = path.join(projectDir, cfg, '.azclaude-integrity');
  fs.writeFileSync(integrityPath, generateIntegrityHash(settings.hooks));

  // Ensure settings.local.json is gitignored (contains machine-specific absolute paths)
  const gitignorePath = path.join(projectDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('settings.local.json')) {
      fs.appendFileSync(gitignorePath, `\n# AZCLAUDE — machine-specific hook paths\n${cfg}/settings.local.json\n`);
      ok('Added settings.local.json to .gitignore');
    }
  }

  ok(`Project hooks installed (${cfg}/settings.local.json)`);
  ok(`Hook scripts installed (${cfg}/hooks/)`);
  info('Project-scoped — no global pollution, no cross-project side effects');
  info('Node.js hooks — works on Windows PowerShell, CMD, Git Bash, macOS, Linux');
}

// ─── Migration: clean global hooks if project hooks now active ───────────────

function migrateFromGlobalHooks(cli, projectDir, cfg) {
  if (!cli.hooksDir) return;
  const globalSettings = path.join(cli.hooksDir, 'settings.json');
  if (!fs.existsSync(globalSettings)) return;

  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(globalSettings, 'utf8')); } catch { return; }
  if (!settings._azclaude) return;

  // Global AZCLAUDE hooks exist — remove only AZCLAUDE's entries, preserve other plugins'
  delete settings._azclaude;
  if (settings.hooks) {
    for (const event of ['UserPromptSubmit', 'Stop', 'PostToolUse']) {
      if (Array.isArray(settings.hooks[event])) {
        // Keep entries that don't reference AZCLAUDE hook scripts
        settings.hooks[event] = settings.hooks[event].filter(group => {
          const cmds = (group.hooks || []).map(h => h.command || '');
          return !cmds.some(c => c.includes('user-prompt.js') || c.includes('stop.js') || c.includes('post-tool-use.js'));
        });
        if (settings.hooks[event].length === 0) delete settings.hooks[event];
      }
    }
    if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
  }

  // Clean up: if settings is now empty (only had AZCLAUDE), remove the file
  const remaining = Object.keys(settings).length;
  if (remaining === 0) {
    try { fs.unlinkSync(globalSettings); } catch (_) {}
  } else {
    atomicWriteFileSync(globalSettings, JSON.stringify(settings, null, 2));
  }

  // Remove global hook scripts
  const globalHooksDir = path.join(cli.hooksDir, 'hooks');
  for (const name of HOOK_SCRIPTS) {
    const f = path.join(globalHooksDir, name);
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
  }

  // Remove integrity hash
  const integrityPath = path.join(cli.hooksDir, '.azclaude-integrity');
  try { if (fs.existsSync(integrityPath)) fs.unlinkSync(integrityPath); } catch (_) {}

  ok('Migrated: global hooks removed — project-scoped hooks take over');
}

// ─── Global Hooks (fallback for CLIs without project-scoped support) ─────────

function installGlobalHooks(cli) {
  if (!cli.hooksDir) {
    warn(`Hooks not supported for ${cli.name}`);
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
    copyHookScripts(path.join(cli.hooksDir, 'hooks'));
    ok('Global hooks already installed — scripts refreshed');
    return;
  }

  const hasExistingHooks = settings.hooks && Object.keys(settings.hooks).length > 0;
  if (hasExistingHooks) {
    warn(`Existing hooks detected in ${settingsPath}`);
    warn('Manually merge the AZCLAUDE hooks or back up and re-run.');
    return;
  }

  const scriptsDir = copyHookScripts(path.join(cli.hooksDir, 'hooks'));

  settings._azclaude = true;
  if (!settings.hooks) settings.hooks = {};
  Object.assign(settings.hooks, buildHookEntries(scriptsDir));

  atomicWriteFileSync(settingsPath, JSON.stringify(settings, null, 2));

  const integrityPath = path.join(cli.hooksDir, '.azclaude-integrity');
  fs.writeFileSync(integrityPath, generateIntegrityHash(settings.hooks));

  ok(`Global hooks installed (${settingsPath})`);
  ok(`Hook scripts installed (${scriptsDir})`);
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

// Core capability dirs installed by default; advanced dirs only with --full
const CORE_CAP_DIRS  = ['shared', 'level-builders'];
const FULL_CAP_DIRS  = ['shared', 'level-builders', 'evolution', 'intelligence'];

function installCapabilities(projectDir, cfg, full) {
  const src = path.join(TEMPLATE_DIR, 'capabilities');
  const dst = path.join(projectDir, cfg, 'capabilities');

  if (fs.existsSync(dst)) {
    // If upgrading to --full, install missing dirs
    if (full) {
      for (const dir of FULL_CAP_DIRS) {
        const dstSub = path.join(dst, dir);
        if (!fs.existsSync(dstSub)) {
          copyDir(path.join(src, dir), dstSub);
          ok(`${dir}/ capabilities added (--full)`);
        }
      }
    }
    ok('Capabilities already installed — checked');
    return;
  }

  const dirs = full ? FULL_CAP_DIRS : CORE_CAP_DIRS;
  fs.mkdirSync(dst, { recursive: true });
  // Always install manifest.md
  fs.copyFileSync(path.join(src, 'manifest.md'), path.join(dst, 'manifest.md'));
  for (const dir of dirs) {
    copyDir(path.join(src, dir), path.join(dst, dir));
  }
  ok(`Capabilities installed (${cfg}/capabilities/) — ${full ? 'full' : 'core'}`);
  if (!full) info('Run npx azclaude --full to add evolution + intelligence capabilities');
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

// ─── Skills (SKILL.md — model-auto-invoked) ──────────────────────────────────

const SKILLS = ['session-guard', 'test-first', 'env-scanner', 'debate', 'security', 'skill-creator', 'agent-creator'];

function installSkills(projectDir, cfg) {
  const skillsDir = path.join(projectDir, cfg, 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  for (const skill of SKILLS) {
    const srcDir = path.join(TEMPLATE_DIR, 'skills', skill);
    const src    = path.join(srcDir, 'SKILL.md');
    const dstDir = path.join(skillsDir, skill);
    const dst    = path.join(dstDir, 'SKILL.md');
    if (!fs.existsSync(dst) && fs.existsSync(src)) {
      // Copy SKILL.md + references/ + examples/ (progressive disclosure)
      fs.mkdirSync(dstDir, { recursive: true });
      const content = substitutePaths(fs.readFileSync(src, 'utf8'), cfg);
      fs.writeFileSync(dst, content);
      // Copy subdirectories (references/, examples/, scripts/)
      for (const sub of ['references', 'examples', 'scripts']) {
        const subSrc = path.join(srcDir, sub);
        if (fs.existsSync(subSrc)) copyDir(subSrc, path.join(dstDir, sub));
      }
      ok(`${skill} skill installed (auto-invoked by model)`);
    } else if (fs.existsSync(dst)) {
      info(`${skill} skill already exists — skipping`);
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

const AGENTS = ['orchestrator-init', 'code-reviewer', 'test-writer'];

function installAgents(projectDir, cfg) {
  const agentsDir = path.join(projectDir, cfg, 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });

  for (const agent of AGENTS) {
    const src = path.join(TEMPLATE_DIR, 'agents', `${agent}.md`);
    const dst = path.join(agentsDir, `${agent}.md`);
    if (!fs.existsSync(dst) && fs.existsSync(src)) {
      const content = substitutePaths(fs.readFileSync(src, 'utf8'), cfg);
      fs.writeFileSync(dst, content);
      ok(`${agent} agent installed`);
    }
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

// ─── Demo ─────────────────────────────────────────────────────────────────────

function runDemo() {
  const { spawnSync } = require('child_process');
  const tmpBase = path.join(os.tmpdir(), `azclaude-demo-${Date.now()}`);

  function step(n, label) { console.log(`\nStep ${n}: ${label}`); }
  function show(label, val) { console.log(`  ${label}`); if (val) console.log(`    ${val.split('\n').join('\n    ')}`); }

  console.log('\n════════════════════════════════════════════════');
  console.log('  AZCLAUDE demo — 30-second proof');
  console.log('  Showing: memory survives context compaction');
  console.log('════════════════════════════════════════════════');

  // ── Step 1: scaffold a minimal project ───────────────────────────────────
  step(1, 'Create a project with goals.md');
  fs.mkdirSync(path.join(tmpBase, '.claude', 'memory'), { recursive: true });
  fs.mkdirSync(path.join(tmpBase, 'ops', 'observations'), { recursive: true });
  fs.mkdirSync(path.join(tmpBase, 'src'), { recursive: true });

  const goalsInitial = [
    '# Goals — demo-project',
    'Updated: ' + new Date().toISOString().slice(0, 10),
    '',
    '## Current threads',
    '- Build user auth feature',
    '',
    '## Done this session',
    '- Project scaffolded',
    '',
    '## Next actions',
    '1. Implement login endpoint',
    ''
  ].join('\n');

  const goalsPath  = path.join(tmpBase, '.claude', 'memory', 'goals.md');
  const fakeFile   = path.join(tmpBase, 'src', 'auth.js');
  fs.writeFileSync(goalsPath, goalsInitial);
  fs.writeFileSync(fakeFile, '// auth logic here\n');

  show('✓ Project created at', tmpBase);
  show('✓ goals.md initialized with current thread:', '"Build user auth feature"');

  // ── Step 2: simulate PostToolUse (file edit) ──────────────────────────────
  step(2, 'You edit src/auth.js — PostToolUse hook fires automatically');

  const postToolScript = path.join(TEMPLATE_DIR, 'hooks', 'post-tool-use.js');
  if (fs.existsSync(postToolScript)) {
    const toolInput = JSON.stringify({ tool_input: { file_path: fakeFile } });
    spawnSync(process.execPath, [postToolScript], {
      input: toolInput,
      cwd:   tmpBase,
      env:   { ...process.env, AZCLAUDE_CFG: '.claude' }
    });
    const after = fs.readFileSync(goalsPath, 'utf8');
    const ipLine = after.split('\n').find(l => l.includes('src'));
    show('✓ PostToolUse fired — goals.md updated:', ipLine || '(entry added)');
  }

  // ── Step 3: compaction ────────────────────────────────────────────────────
  step(3, 'Claude Code compacts conversation at turn 80 — all earlier context gone');
  show('→ Turns 1-79 summarized, detail lost');
  show('→ But goals.md still has the In progress entry');
  const mid = fs.readFileSync(goalsPath, 'utf8');
  const ipSection = mid.split('\n').filter(l => l.includes('## In progress') || l.startsWith('- ')).join('\n');
  show('✓ goals.md In progress section:', ipSection);

  // ── Step 4: next session — UserPromptSubmit injects goals ─────────────────
  step(4, 'New session starts — UserPromptSubmit hook fires automatically');

  const upScript = path.join(TEMPLATE_DIR, 'hooks', 'user-prompt.js');
  if (fs.existsSync(upScript)) {
    // Neutralise the session-marker so it fires even in this process tree
    const marker = path.join(os.tmpdir(), `.azclaude-session-${process.ppid || process.pid}`);
    const markerExisted = fs.existsSync(marker);
    if (markerExisted) fs.unlinkSync(marker);

    const result = spawnSync(process.execPath, [upScript], {
      cwd: tmpBase,
      env: { ...process.env, AZCLAUDE_CFG: '.claude' }
    });

    if (markerExisted) fs.writeFileSync(marker, ''); // restore
    show('✓ Claude receives this at session start:');
    console.log('  ┌─────────────────────────────────────────');
    (result.stdout || '').toString().split('\n').forEach(l => console.log(`  │ ${l}`));
    console.log('  └─────────────────────────────────────────');
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  try { fs.rmSync(tmpBase, { recursive: true, force: true }); } catch (_) {}

  console.log('\n════════════════════════════════════════════════');
  console.log('  Memory works. Context survives compaction.');
  console.log('  The hook fires on every file edit — no user action needed.');
  console.log('\n  Install on your project:  npx azclaude');
  console.log('  Check health:             npx azclaude doctor');
  console.log('════════════════════════════════════════════════\n');
}

// ─── Doctor ───────────────────────────────────────────────────────────────────

function runDoctor() {
  const cli        = detectCLI();
  const projectDir = process.cwd();
  const cfg        = cli.cfg;
  let   pass = 0, fail = 0;
  const failures = [];

  function chk(label, ok) {
    if (ok) { console.log(`  ✓ ${label}`); pass++; }
    else     { console.log(`  ✗ ${label}`); fail++; failures.push(label); }
  }

  console.log('\n════════════════════════════════════════════════');
  console.log('  AZCLAUDE doctor — environment health check');
  console.log('════════════════════════════════════════════════\n');

  // ── Node.js version ──────────────────────────────────────────────────────
  console.log('[ Runtime ]');
  const [major] = process.versions.node.split('.').map(Number);
  chk(`Node.js ${process.versions.node} (need ≥ 16)`, major >= 16);
  chk(`node binary: ${process.execPath}`, fs.existsSync(process.execPath));

  // ── Hooks (project-scoped or global) ─────────────────────────────────────
  const projectSettingsPath = path.join(projectDir, cfg, 'settings.local.json');
  const projectHooksDir    = path.join(projectDir, cfg, 'hooks');
  const hasProjectHooks    = fs.existsSync(projectSettingsPath);

  if (hasProjectHooks) {
    console.log(`\n[ Project hooks — ${cfg}/settings.local.json ]`);
    let settings = {};
    try { settings = JSON.parse(fs.readFileSync(projectSettingsPath, 'utf8')); } catch {}

    chk('_azclaude marker present (hooks installed)',        !!settings._azclaude);
    chk('UserPromptSubmit hook present',                     !!settings.hooks?.UserPromptSubmit);
    chk('Stop hook present',                                 !!settings.hooks?.Stop);
    chk('PostToolUse hook present (edit tracking)',           !!settings.hooks?.PostToolUse);

    const upCmd = settings.hooks?.UserPromptSubmit?.[0]?.hooks?.[0]?.command || '';
    chk('UserPromptSubmit uses Node.js (not bash)',          upCmd.includes('node') && !upCmd.includes('SESSION_MARKER'));

    for (const script of HOOK_SCRIPTS) {
      chk(`hook script exists: ${script}`,                   fs.existsSync(path.join(projectHooksDir, script)));
    }

    const integrityPath = path.join(projectDir, cfg, '.azclaude-integrity');
    if (fs.existsSync(integrityPath) && settings.hooks) {
      const saved   = fs.readFileSync(integrityPath, 'utf8').trim();
      const current = generateIntegrityHash(settings.hooks);
      chk('hook integrity hash matches',                     saved === current);
    }

    // Warn if global hooks still present (should have been migrated)
    if (cli.hooksDir) {
      const globalSettings = path.join(cli.hooksDir, 'settings.json');
      if (fs.existsSync(globalSettings)) {
        try {
          const gs = JSON.parse(fs.readFileSync(globalSettings, 'utf8'));
          if (gs._azclaude) {
            console.log('  ⚠ Global hooks still present — re-run npx azclaude to migrate');
          }
        } catch {}
      }
    }
  } else if (cli.hooksDir) {
    console.log('\n[ Global hooks — ~/.claude/ ]');
    const settingsPath  = path.join(cli.hooksDir, 'settings.json');
    const integrityPath = path.join(cli.hooksDir, '.azclaude-integrity');
    const hooksDir      = path.join(cli.hooksDir, 'hooks');

    chk(`settings.json exists (${settingsPath})`, fs.existsSync(settingsPath));

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch {}
    }

    chk('_azclaude marker present (hooks installed)',        !!settings._azclaude);
    chk('UserPromptSubmit hook present',                     !!settings.hooks?.UserPromptSubmit);
    chk('Stop hook present',                                 !!settings.hooks?.Stop);
    chk('PostToolUse hook present (edit tracking)',           !!settings.hooks?.PostToolUse);

    const upCmd = settings.hooks?.UserPromptSubmit?.[0]?.hooks?.[0]?.command || '';
    chk('UserPromptSubmit uses Node.js (not bash)',          upCmd.includes('node') && !upCmd.includes('SESSION_MARKER'));

    for (const script of HOOK_SCRIPTS) {
      chk(`hook script exists: ${script}`,                   fs.existsSync(path.join(hooksDir, script)));
    }

    if (fs.existsSync(integrityPath) && settings.hooks) {
      const saved   = fs.readFileSync(integrityPath, 'utf8').trim();
      const current = generateIntegrityHash(settings.hooks);
      chk('hook integrity hash matches',                     saved === current);
    }

    info('Tip: re-run npx azclaude to upgrade to project-scoped hooks');
  } else {
    console.log(`\n[ Hooks ]`);
    console.log(`  · hooks not supported for ${cli.name} — skipping`);
  }

  // ── Project structure ────────────────────────────────────────────────────
  console.log('\n[ Project structure ]');
  chk(`${cfg}/ config directory`,                            fs.existsSync(path.join(projectDir, cfg)));
  chk(`${cfg}/capabilities/manifest.md`,                    fs.existsSync(path.join(projectDir, cfg, 'capabilities', 'manifest.md')));
  chk(`${cfg}/commands/ (skills)`,                          fs.existsSync(path.join(projectDir, cfg, 'commands')));
  chk(`${cfg}/memory/ directory`,                           fs.existsSync(path.join(projectDir, cfg, 'memory')));
  chk(`${cfg}/agents/ directory`,                           fs.existsSync(path.join(projectDir, cfg, 'agents')));
  chk(`ops/observations/ directory`,                        fs.existsSync(path.join(projectDir, 'ops', 'observations')));

  const goalsPath = path.join(projectDir, cfg, 'memory', 'goals.md');
  chk(`goals.md exists`,                                    fs.existsSync(goalsPath));
  if (fs.existsSync(goalsPath)) {
    const g = fs.readFileSync(goalsPath, 'utf8');
    chk('goals.md has an Updated date',                     /^Updated: \d{4}-\d{2}-\d{2}/m.test(g));
    chk('goals.md has no unfilled placeholders',            !g.includes('{{'));
  }

  const rulesPath = path.join(projectDir, cli.rulesFile);
  chk(`${cli.rulesFile} exists`,                            fs.existsSync(rulesPath));
  if (fs.existsSync(rulesPath)) {
    const r = fs.readFileSync(rulesPath, 'utf8');
    chk(`${cli.rulesFile} filled (no {{placeholders}})`,    !r.includes('{{'));
  }

  // ── Commands ─────────────────────────────────────────────────────────────
  console.log('\n[ Commands ]');
  const cmdDir    = path.join(projectDir, cfg, 'commands');
  const installed = fs.existsSync(cmdDir) ? fs.readdirSync(cmdDir).filter(f => f.endsWith('.md')) : [];
  chk(`${installed.length}/${COMMANDS.length} commands installed`, installed.length === COMMANDS.length);
  const missing = COMMANDS.filter(c => !installed.includes(`${c}.md`));
  if (missing.length) console.log(`  · missing: ${missing.join(', ')}`);

  // ── Skills ──────────────────────────────────────────────────────────────
  console.log('\n[ Skills ]');
  const skillsDir      = path.join(projectDir, cfg, 'skills');
  const installedSkills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter(s => {
    return fs.existsSync(path.join(skillsDir, s, 'SKILL.md'));
  }) : [];
  chk(`${installedSkills.length}/${SKILLS.length} skills installed`, installedSkills.length === SKILLS.length);
  const missingSkills = SKILLS.filter(s => !installedSkills.includes(s));
  if (missingSkills.length) console.log(`  · missing: ${missingSkills.join(', ')}`);

  // ── Memory health ──────────────────────────────────────────────────────
  console.log('\n[ Memory ]');
  const memDir = path.join(projectDir, cfg, 'memory');
  chk('checkpoints/ directory exists',                fs.existsSync(path.join(memDir, 'checkpoints')));
  chk('sessions/ directory exists',                   fs.existsSync(path.join(memDir, 'sessions')));
  chk('codebase-map.md exists',                       fs.existsSync(path.join(memDir, 'codebase-map.md')));

  // Stale goals warning (> 7 days)
  if (fs.existsSync(goalsPath)) {
    const goalsContent = fs.readFileSync(goalsPath, 'utf8');
    const dateMatch = goalsContent.match(/^Updated: (\d{4}-\d{2}-\d{2})/m);
    if (dateMatch) {
      const updatedDate = new Date(dateMatch[1]);
      const daysSince = Math.floor((Date.now() - updatedDate.getTime()) / 86400000);
      chk(`goals.md is current (updated ${daysSince}d ago)`, daysSince <= 7);
    }
  }

  // ── Git status ─────────────────────────────────────────────────────────
  console.log('\n[ Git ]');
  try {
    const { spawnSync } = require('child_process');
    const gitStatus = spawnSync('git', ['status', '--porcelain'], { cwd: projectDir, encoding: 'utf8', timeout: 5000 });
    if (gitStatus.status === 0) {
      // Exclude goals.md from count — PostToolUse hook auto-modifies it during sessions
      const changes = gitStatus.stdout.trim().split('\n').filter(l => l.length > 0 && !l.includes('goals.md'));
      chk(`working tree clean (${changes.length} uncommitted, goals.md excluded)`, changes.length === 0);
    }
  } catch (_) {}

  // ── Hook freshness ────────────────────────────────────────────────────
  console.log('\n[ Hook freshness ]');
  const installedHooksDir = hasProjectHooks ? projectHooksDir : (cli.hooksDir ? path.join(cli.hooksDir, 'hooks') : null);
  const templateHooksDir  = path.join(__dirname, '..', 'templates', 'hooks');
  if (installedHooksDir) {
    for (const script of HOOK_SCRIPTS) {
      const installedPath = path.join(installedHooksDir, script);
      const templatePath  = path.join(templateHooksDir, script);
      if (fs.existsSync(installedPath) && fs.existsSync(templatePath)) {
        const installedContent = fs.readFileSync(installedPath, 'utf8');
        const templateContent  = fs.readFileSync(templatePath, 'utf8');
        chk(`${script} is up to date`, installedContent === templateContent);
      }
    }
  } else {
    console.log('  · hooks not supported — skipping');
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const total = pass + fail;
  console.log('\n════════════════════════════════════════════════');
  console.log(`  ${pass}/${total} checks passed`);
  if (fail > 0) {
    const hasCommandFail = failures.some(f => /commands installed/.test(f));
    const hasHookFail    = failures.some(f => /hook|Hook|integrity/.test(f));
    const hasGitFail     = failures.some(f => /uncommitted/.test(f));
    const hasMemoryFail  = failures.some(f => /checkpoints|sessions|codebase-map|goals/.test(f));
    console.log('');
    if (hasCommandFail || hasHookFail) console.log('  Fix: re-run  npx azclaude  to install missing files');
    if (hasHookFail)                   console.log('  If hooks still fail: check that Node.js ≥ 16 is in PATH');
    if (hasGitFail)                    console.log('  Git: commit or stash uncommitted changes');
    if (hasMemoryFail)                 console.log('  Memory: run /setup or /persist to create missing files');
  } else {
    console.log('  Environment is healthy.');
  }
  console.log('════════════════════════════════════════════════\n');

  process.exit(fail > 0 ? 1 : 0);
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

if (process.argv[2] === 'doctor') { runDoctor(); process.exit(0); }
if (process.argv[2] === 'demo')   { runDemo();   process.exit(0); }
if (process.argv[2] === 'copilot') {
  // Delegate to copilot runner
  const copilotScript = path.join(__dirname, 'copilot.js');
  const copilotArgs = process.argv.slice(3);
  const { spawnSync } = require('child_process');
  const result = spawnSync(process.execPath, [copilotScript, ...copilotArgs], { stdio: 'inherit' });
  process.exit(result.status || 0);
}

const fullInstall = process.argv.includes('--full');
const projectDir  = process.cwd();
const cli         = detectCLI();

console.log('\n════════════════════════════════════════════════');
console.log('  AZCLAUDE — AI Coding Environment');
console.log(`  CLI: ${cli.name} → installing to ${cli.cfg}/`);
console.log('════════════════════════════════════════════════\n');

verifyIntegrity(projectDir, cli.cfg, cli);

// Hooks: project-scoped by default (settings.local.json), global as fallback
if (cli.cfg === '.claude') {
  installProjectHooks(projectDir, cli.cfg);
  migrateFromGlobalHooks(cli, projectDir, cli.cfg);
} else {
  installGlobalHooks(cli);
}
installCapabilities(projectDir, cli.cfg, fullInstall);
installCommands(projectDir, cli.cfg);
installSkills(projectDir, cli.cfg);
installScripts(projectDir, cli.cfg);
installAgents(projectDir, cli.cfg);
installRulesFile(projectDir, cli.cfg, cli.rulesFile);
createDirectories(projectDir, cli.cfg);
ensureSharedSkillsDir();

// ── Evolution log directory ───────────────────────────────────────────────────
const evolLogPath = path.join(projectDir, 'ops', 'evolution-log.md');
if (!fs.existsSync(evolLogPath)) {
  const header = '# Evolution History\n\n| Date | Before | After | Delta | Summary |\n|------|--------|-------|-------|---------|\n';
  try { fs.writeFileSync(evolLogPath, header); } catch (_) {}
}

console.log('\n════════════════════════════════════════════════');
console.log(`  Install mode: ${fullInstall ? 'full (all capabilities)' : 'core (shared + level-builders)'}`);
console.log('  Architecture: lazy-loaded, manifest-driven');
console.log('  Token cost per task: ~200-600 (vs ~21,000 monolith)');
console.log(`  Next step: run /setup to configure this project`);
if (!fullInstall) {
  console.log('');
  console.log('  When ready for Level 5+: npx azclaude --full');
}
console.log('════════════════════════════════════════════════\n');
