#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — PreToolUse security hook
 * Fires BEFORE Edit, Write, MultiEdit operations.
 * Scans content for security patterns: injection, XSS, deserialization, secrets.
 * Warnings → stderr (exit 0, Claude continues).
 * Hardcoded secrets → exit 2 (Claude Code blocks the write).
 * Silent for all other tools, node_modules, .git, .md files.
 * No dependencies. Pure synchronous fs. Cross-platform (Windows/macOS/Linux).
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Parse stdin ──────────────────────────────────────────────────────────────
let toolName = '';
let filePath = '';
let content  = '';
let command  = '';
try {
  const raw  = fs.readFileSync(0, 'utf8'); // fd 0 = stdin
  const data = JSON.parse(raw);
  toolName   = data.tool_name || '';
  filePath   = data.tool_input?.file_path || data.tool_input?.path || '';
  command    = data.tool_input?.command || '';
  // Edit uses new_string; Write/MultiEdit use content
  content    = data.tool_input?.new_string || data.tool_input?.content || '';
  // MultiEdit: scan all edits
  if (!content && Array.isArray(data.tool_input?.edits)) {
    content = data.tool_input.edits.map(e => e.new_string || '').join('\n');
  }
} catch (_) {
  process.exit(0); // malformed JSON — stay out of the way
}

// ── Session security event log (shared with post-tool-use, stop) ─────────────
const _secSid     = process.ppid || process.pid;
const _seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${_secSid}`);
const _dedupPath  = path.join(os.tmpdir(), `.azclaude-sec-${_secSid}`);
function _logSec(rule, level, target) {
  try {
    fs.appendFileSync(_seclogPath, JSON.stringify({
      ts: new Date().toISOString(), hook: 'pre-tool-use', rule, level,
      target: String(target).slice(0, 100)
    }) + '\n');
  } catch (_) {}
}
function _getDedup() { try { return JSON.parse(fs.readFileSync(_dedupPath, 'utf8')); } catch(_) { return {}; } }
function _saveDedup(d) { try { fs.writeFileSync(_dedupPath, JSON.stringify(d)); } catch(_) {} }

// ── Gate: Bash tool — scan shell commands ────────────────────────────────────
if (toolName === 'Bash' && command) {
  const BASH_RULES = [
    { id: 'rce-curl-pipe',      test: /curl\s+.*\|\s*(bash|sh)\b/i,                                  message: 'curl|bash RCE pattern',                                                    block: true  },
    { id: 'rce-wget-pipe',      test: /wget\s+.*\|\s*(bash|sh)\b/i,                                  message: 'wget|bash RCE pattern',                                                    block: true  },
    { id: 'shadow-npm-install', test: /\bnpm\s+install\b(?!\s+--ignore-scripts)/,                    message: 'npm install without --ignore-scripts — slopsquatting / shadow IT risk. Add --ignore-scripts.',   block: false },
    { id: 'env-var-echo',       test: /\becho\s+['"$]?\$[A-Z_]*(SECRET|TOKEN|KEY|PASSWORD|API)[A-Z_]*/i, message: 'Sensitive env var echo — credentials may appear in logs.',            block: false },
    { id: 'destructive-rm',     test: /\brm\s+-[rf]{1,2}\s+[/~$](?!tmp[\/ $])/,                     message: 'Destructive rm on system or home path.',                                   block: true  },
  ];
  const dedup = _getDedup();
  for (const rule of BASH_RULES) {
    if (!rule.test.test(command)) continue;
    _logSec(rule.id, rule.block ? 'block' : 'warn', command.slice(0, 80));
    if (rule.block) {
      process.stderr.write(`\n✗ SECURITY BLOCK [${rule.id}]: ${rule.message}\n  Command: ${command.slice(0, 120)}\n\n`);
      process.exit(2);
    }
    const key = `bash:${rule.id}`;
    if (!dedup[key]) {
      dedup[key] = true; _saveDedup(dedup);
      process.stderr.write(`\n⚠ SECURITY [${rule.id}]: ${rule.message}\n`);
    }
  }
  process.exit(0);
}

// ── Gate: Read tool — warn on credential file access ─────────────────────────
if (toolName === 'Read' && filePath) {
  const CRED_FILE = /\.env$|\.env\.\w+$|secrets?\.(json|ya?ml)$|credentials?(\.json)?$|id_rsa$|id_ed25519$|id_ecdsa$|id_dsa$|\.pem$|\.p12$|\.pfx$|\.keystore$/i;
  if (CRED_FILE.test(filePath)) {
    const rel = path.relative(process.cwd(), path.resolve(filePath));
    if (!rel.startsWith('..')) {
      const key = `read-cred:${rel}`;
      const dedup = _getDedup();
      if (!dedup[key]) {
        dedup[key] = true; _saveDedup(dedup);
        _logSec('credential-file-read', 'warn', rel);
        process.stderr.write(`\n⚠ SECURITY: Reading credential file ${rel} — ensure contents are not echoed to logs or external calls.\n`);
      }
    }
  }
  process.exit(0);
}

// ── Gate: only act on write-type tools ──────────────────────────────────────
const WRITE_TOOLS = new Set(['Edit', 'Write', 'MultiEdit']);
if (!WRITE_TOOLS.has(toolName)) process.exit(0);

// ── Gate: skip noisy paths ───────────────────────────────────────────────────
if (filePath) {
  const rel = path.relative(process.cwd(), path.resolve(filePath));
  if (/node_modules[\\/]/.test(rel)) process.exit(0);
  if (/\.git[\\/]/.test(rel))        process.exit(0);
  if (/\.md$/i.test(filePath))        process.exit(0);
}

// ── Gate: nothing to scan ────────────────────────────────────────────────────
if (!content) process.exit(0);

// ── Security rules ───────────────────────────────────────────────────────────
// Each rule: { id, test, message, block }
// block:true → exit 2 (Claude Code refuses the write).
// block:false → exit 0 (warn on stderr, allow).
const RULES = [
  {
    id:      'gh-actions-injection',
    test:    /\$\{\{\s*github\.event\./,
    message: 'GitHub Actions expression in run: context — injection risk. Validate event data before use.',
    block:   false,
  },
  {
    id:      'child-process-exec',
    test:    /child_process\.exec\s*\(/,
    message: 'child_process.exec() detected — command injection risk. Prefer child_process.execFile() or spawnSync() with argument arrays.',
    block:   false,
  },
  {
    id:      'new-function',
    test:    /new\s+Function\s*\(/,
    message: 'new Function() detected — dynamic code execution risk. Avoid constructing functions from strings.',
    block:   false,
  },
  {
    id:      'eval',
    test:    /\beval\s*\(/,
    message: 'eval() detected — code injection risk. Use safer alternatives (JSON.parse, Function constructors avoided).',
    block:   false,
  },
  {
    id:      'dangerously-set-inner-html',
    test:    /dangerouslySetInnerHTML/,
    message: 'dangerouslySetInnerHTML detected — XSS risk. Sanitize HTML with DOMPurify or avoid entirely.',
    block:   false,
  },
  {
    id:      'dom-xss',
    test:    /document\.write\s*\(|\.innerHTML\s*=/,
    message: 'document.write() or .innerHTML = detected — DOM XSS risk. Use textContent or a sanitization library.',
    block:   false,
  },
  {
    id:      'pickle-deserialization',
    test:    /pickle\.loads?\s*\(/,
    message: 'pickle.load()/pickle.loads() detected — deserialization risk. Never unpickle untrusted data.',
    block:   false,
  },
  {
    id:      'os-system',
    test:    /\bos\.system\s*\(/,
    message: 'os.system() detected — command injection risk. Use subprocess.run() with a list of arguments instead.',
    block:   false,
  },
  {
    id:      'weak-crypto',
    test:    /\bMD5\b|\bSHA-?1\b|\bDES\b|\bMath\.random\s*\(\)/,
    message: 'Weak cryptographic primitive detected — MD5/SHA1/DES are broken; Math.random() is not cryptographically secure. Use SHA-256+, AES-GCM, or crypto.randomBytes() / secrets.token_bytes().',
    block:   false,
  },
  {
    id:      'prototype-pollution',
    test:    /__proto__|\bconstructor\.prototype\b/,
    message: 'Prototype pollution pattern detected — assigning to __proto__ or constructor.prototype can corrupt shared object state. Use Object.create(null) or Object.freeze().',
    block:   false,
  },
  {
    id:      'yaml-unsafe-load',
    test:    /\byaml\.load\s*\(/,
    message: 'yaml.load() detected — unsafe YAML deserialization allows arbitrary code execution. Use yaml.safe_load() instead.',
    block:   false,
  },
  {
    id:      'path-traversal',
    test:    /\.\.[/\\]/,
    message: 'Path traversal sequence (../) detected — user-controlled paths may escape the project root. Validate with path.resolve() and check against an allowed base directory.',
    block:   false,
  },
  {
    id:      'prompt-injection-write',
    test:    /ignore\s+(?:all\s+)?previous\s+instructions|disregard\s+(?:all\s+)?previous|{"role"\s*:\s*"(?:user|system)"\s*,\s*"content"\s*:/i,
    message: 'Prompt injection pattern detected in file being written — this content could hijack AI agent context when read. Matches known CVE-2025-54794 attack vector. Review before proceeding.',
    block:   false,
  },
  {
    id:      'c-gets',
    test:    /\bgets\s*\(/,
    message: 'gets() detected — buffer overflow vulnerability (removed from C11). Use fgets() or getline() with explicit bounds.',
    block:   false,
  },
  {
    id:      'php-shell-exec',
    test:    /\bshell_exec\s*\(/,
    message: 'shell_exec() detected — command injection risk. Use escapeshellarg() or avoid shell execution entirely.',
    block:   false,
  },
  {
    id:      'java-runtime-exec',
    test:    /Runtime\.getRuntime\(\)\.exec\s*\(/,
    message: 'Runtime.exec() detected — command injection risk. Use ProcessBuilder with a String[] argument array instead.',
    block:   false,
  },
  {
    id:      'jinja2-ssti',
    test:    /render_template_string\s*\(/,
    message: 'render_template_string() detected — server-side template injection risk. Use render_template() with a file-based template instead.',
    block:   false,
  },
  {
    id:      'subprocess-shell-true',
    test:    /subprocess\.(run|Popen|call|check_output)\s*\([^)]*shell\s*=\s*True/,
    message: 'subprocess with shell=True detected — command injection via shell metacharacters. Use list args with shell=False instead.',
    block:   false,
  },
  {
    id:      'hardcoded-secret',
    test:    /AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{36}|glpat-[A-Za-z0-9_-]{20}|xoxb-[0-9]|xoxp-[0-9]|npm_[A-Za-z0-9]{36}|AIza[0-9A-Za-z_-]{35}|sk_live_[0-9a-zA-Z]{24}|SG\.[A-Za-z0-9_-]{22}\.|-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY/,
    message: 'Hardcoded secret pattern detected',
    block:   true,
  },
];

// ── Session dedup ─────────────────────────────────────────────────────────────
// Store warned file+rule combos in a temp JSON file keyed by session PID.
// Clean up temp files older than 24 h at startup.
const SESSION_ID  = process.ppid || process.pid;
const DEDUP_PATH  = path.join(os.tmpdir(), `.azclaude-sec-${SESSION_ID}`);
const MAX_AGE_MS  = 24 * 60 * 60 * 1000;

// Cleanup stale dedup files (best-effort, never fatal)
try {
  const tmpFiles = fs.readdirSync(os.tmpdir());
  for (const f of tmpFiles) {
    if (!f.startsWith('.azclaude-sec-')) continue;
    const fp  = path.join(os.tmpdir(), f);
    const age = Date.now() - fs.statSync(fp).mtimeMs;
    if (age > MAX_AGE_MS) { try { fs.unlinkSync(fp); } catch (_) {} }
  }
} catch (_) {}

let dedup = {};
try { dedup = JSON.parse(fs.readFileSync(DEDUP_PATH, 'utf8')); } catch (_) {}

function saveDedup() {
  try { fs.writeFileSync(DEDUP_PATH, JSON.stringify(dedup)); } catch (_) {}
}

// ── Scan ─────────────────────────────────────────────────────────────────────
const displayName = filePath
  ? path.relative(process.cwd(), path.resolve(filePath)) || filePath
  : '(inline content)';

let didBlock = false;

for (const rule of RULES) {
  if (!rule.test.test(content)) continue;

  const dedupKey = `${displayName}:${rule.id}`;

  if (rule.block) {
    // Always emit the block message — secrets must never be silently swallowed
    _logSec(rule.id, 'block', displayName);
    process.stderr.write(
      `\n✗ SECURITY BLOCK: ${rule.message} in ${displayName}.\n` +
      `  Use environment variables instead: process.env.MY_SECRET\n` +
      `  Refusing to write. Fix before proceeding.\n\n`
    );
    didBlock = true;
    continue; // check remaining rules before exiting
  }

  // Warning — deduplicated per session
  if (dedup[dedupKey]) continue;
  dedup[dedupKey] = true;
  saveDedup();
  _logSec(rule.id, 'warn', displayName);

  process.stderr.write(
    `\n⚠ SECURITY: ${rule.message.split(' — ')[0]} in ${displayName} — ${rule.message.includes(' — ') ? rule.message.split(' — ')[1] : rule.message}\n`
  );
}

process.exit(didBlock ? 2 : 0);
