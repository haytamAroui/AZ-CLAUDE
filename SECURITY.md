# Security Policy — AZCLAUDE

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.4.x   | Yes       |
| < 0.4   | No        |

## Reporting a Vulnerability

**Do NOT open a public issue for security vulnerabilities.**

Email: haytam.aroui@gmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

Response time: within 48 hours. Fix timeline: within 7 days for critical issues.

---

## Security Architecture

### Zero Dependencies

`package.json` has zero `dependencies` and zero `devDependencies`. The only external binary is the `claude` CLI (installed separately by the user). This eliminates supply-chain risk for the AZCLAUDE package itself.

---

### 4-Hook Runtime Security Pipeline

AZCLAUDE uses Claude Code's native hook infrastructure as a layered runtime security pipeline. All hooks are pure synchronous Node.js — no external processes, no network calls, cross-platform.

```
User types prompt
       ↓
[user-prompt.js]   — scans EVERY prompt for injection attempts (before session gate)
       ↓
Claude plans & calls tools
       ↓
[pre-tool-use.js]  — intercepts 3 tool types before execution:
  Bash  → blocks curl|bash RCE, destructive rm; warns npm install, env var echo
  Read  → warns on credential file access (.env, secrets.json, id_rsa, .pem)
  Write → 14 code vulnerability pattern rules (see Write Gate below)
       ↓                          ↓
[post-tool-use.js]        /tmp/.azclaude-seclog-{PID}
  behavioral sequences:          ↑ shared session JSONL event log
  Read(.env) → Bash = warn ──────┘ (all 4 hooks write here)
       ↓
[stop.js]          — reads seclog, prints session summary, cleans up
  "🔒 Security: 0 blocks, 2 warnings this session"
```

**Session security log** — each hook appends JSON lines:
```json
{"ts":"...","hook":"pre-tool-use","rule":"hardcoded-secret","level":"block","target":"config.js"}
{"ts":"...","hook":"post-tool-use","rule":"credential-read-then-exec","level":"warn","target":".env → Bash"}
{"ts":"...","hook":"user-prompt","rule":"prompt-injection-attempt","level":"warn","target":"ignore previous..."}
```

---

### Pre-Tool-Use: Bash Gate

Intercepts all Bash tool calls before execution.

| Rule ID | Pattern | Action |
|---------|---------|--------|
| `rce-curl-pipe` | `curl ... \| bash/sh` | **Block** (exit 2) |
| `rce-wget-pipe` | `wget ... \| bash/sh` | **Block** (exit 2) |
| `destructive-rm` | `rm -rf /` or `rm -rf ~` | **Block** (exit 2) |
| `shadow-npm-install` | `npm install` without `--ignore-scripts` | Warn |
| `env-var-echo` | `echo $SECRET` / `echo $TOKEN` | Warn |

### Pre-Tool-Use: Read Gate

Warns when Claude reads files matching credential patterns:
`.env`, `.env.*`, `secrets.json`, `secrets.yaml`, `credentials.json`, `id_rsa`, `.pem`, `.p12`, `.pfx`, `.keystore`

Deduplicated per session — one warning per file, not per read.

### Pre-Tool-Use: Write Gate (14 rules)

Scans all Edit/Write/MultiEdit content before writing.

| Rule ID | Pattern | Action |
|---------|---------|--------|
| `gh-actions-injection` | `${{ github.event.` | Warn |
| `child-process-exec` | `child_process.exec(` | Warn |
| `new-function` | `new Function(` | Warn |
| `eval` | `eval(` | Warn |
| `dangerously-set-inner-html` | `dangerouslySetInnerHTML` | Warn |
| `dom-xss` | `document.write(` / `.innerHTML =` | Warn |
| `pickle-deserialization` | `pickle.load(` / `pickle.loads(` | Warn |
| `os-system` | `os.system(` | Warn |
| `weak-crypto` | `MD5`, `SHA1`, `DES`, `Math.random()` | Warn |
| `prototype-pollution` | `__proto__` / `constructor.prototype` | Warn |
| `yaml-unsafe-load` | `yaml.load(` | Warn |
| `path-traversal` | `../` in file paths | Warn |
| `prompt-injection-write` | `ignore previous instructions` / `{"role":"user","content":` | Warn |
| `hardcoded-secret` | AWS/GH/GL/Slack/npm/GCP/Stripe/SendGrid/PEM key tokens | **Block** (exit 2) |

Patterns derived from: Anthropic security-guidance plugin, OWASP Top 10, CVE-2025-54794/54795.

### Post-Tool-Use: Behavioral Sequence Detection

Detects dangerous cross-tool patterns by tracking the last 5 tool calls:

| Sequence | Trigger condition | Action |
|----------|------------------|--------|
| `Read(.env) → Bash` | Credential file read then shell execution | Warn |
| `Read(.env) → WebFetch` | Credential file read then external HTTP call | Warn |

### User-Prompt: Injection Scanning

Fires on **every** user prompt (including subsequent prompts in a session). Patterns detected:
- `ignore [all] previous instructions`
- `disregard [all] previous instructions`
- `override your [rules/instructions/safety]`
- `you are now [a new/different/unrestricted]`

---

### Static Environment Scan (`/sentinel`)

On-demand scanner — 111 rules across 6 categories, scored 0–100 (grade A–F).

| Category | Rules | Weight | What it checks |
|----------|-------|--------|----------------|
| Secrets | 14 | 20 pts | Hardcoded tokens/keys in tracked files |
| Permissions | 10 | 20 pts | Over-permissioned settings.json |
| Hook Integrity | 34 | 25 pts | Hook scripts for RCE, exfiltration, persistence |
| MCP Servers | 23 | 20 pts | Hardcoded secrets, unpinned packages, network exposure |
| Agent Configs | 25 | 15 pts | Prompt injection in `.clinerules`, `CLAUDE.md`, agents, commands |
| Supply Chain | 5 | advisory | Lockfile presence, loose pins, npm audit |

Run: `/sentinel` or `/sentinel --supply-chain` for dependency-only scan.
Verdict: `BLOCKED` (must fix before `/ship`) · `CLEAR` (grade A/B) · `PROCEED WITH CAUTION` (grade C/D)

---

### Additional Layers

**Hook integrity** — SHA-256 hash of hook config written at install, verified on every run (`bin/cli.js:generateIntegrityHash`)

**Prompt injection defense** — `user-prompt.js` strips known injection patterns from `goals.md` content before injecting into Claude's context

**Skill checksums** — portable skills in `~/shared-skills/` are SHA-256 hashed; imports fail loudly if tampered

**Agent scoping** — review agents run in `EnterPlanMode` (read-only); experiment agents in isolated git worktrees (`EnterWorktree`)

**Constitution gate** — `/constitute` writes non-negotiable rules that all agents must read before any implementation; `constitution-guard` agent validates milestones against it

---

### The `--dangerously-skip-permissions` Flag

`bin/copilot.js` uses `--dangerously-skip-permissions` to enable autonomous execution. This is documented and intentional — the copilot cannot function with approval gates on every action.

**Mitigations:**
- Copilot only runs in the specified `projectDir` (passed as argument)
- All file operations are scoped to the project directory via `cwd: projectDir`
- `/ship` runs a secrets scan before any `git push`
- PostToolUse hook rejects paths outside the project root (`rel.startsWith('..')`)
- Hook profiles (`AZCLAUDE_HOOK_PROFILE=strict`) enable extra validation
- 4-hook pipeline runs throughout the entire copilot session

**Recommended precautions when running copilot:**
- Run in a fresh git branch or worktree
- Review `copilot-report.md` after completion
- Run `/sentinel` before `/ship`
- Set `AZCLAUDE_HOOK_PROFILE=strict` for maximum hook coverage

---

### Anthropic API Key

AZCLAUDE does **not** manage or store API keys. The `claude` CLI handles authentication independently:

```bash
# User authenticates once (stored by claude CLI, not by AZCLAUDE)
claude auth login

# Or via environment variable
export ANTHROPIC_API_KEY=sk-ant-...
```

AZCLAUDE never reads, logs, or transmits the API key.

---

### State File Security

All state files live in `.claude/` (gitignored via `settings.local.json`):

| File | Contains | Risk |
|------|----------|------|
| `goals.md` | File paths, timestamps, change summaries | Low — no secrets |
| `checkpoints/` | Reasoning snapshots, decisions | Low — no secrets |
| `copilot-intent.md` | Product description | Low |
| `plan.md` | Milestone tracker | Low |
| `metrics/costs.jsonl` | Tool call timestamps | Low |
| `reflexes/observations.jsonl` | Tool sequences, file names (redacted) | Low — `.env`/`.key`/`.pem` paths are replaced with `[REDACTED]` |
| `settings.local.json` | Hook paths (absolute, machine-specific) | Medium — gitignored |
| `memory/security-events.md` | Security event log (append-only) | Low |

---

### Hook Profile System

```bash
# Minimal — goals.md tracking only (fastest, least overhead)
AZCLAUDE_HOOK_PROFILE=minimal claude

# Standard — all features including security pipeline (default)
AZCLAUDE_HOOK_PROFILE=standard claude

# Strict — all features + reflex guidance + extra validation
AZCLAUDE_HOOK_PROFILE=strict claude
```

---

## Known Limitations

1. **No sandboxing** — copilot.js runs Claude with full filesystem access in the project directory
2. **No cost limits** — no spending cap on Claude API usage during autonomous runs
3. **No network isolation** — Claude can access the internet (for deploy, npm install, etc.)
4. **Regex-only write scanning** — the 14 write-gate rules use pattern matching, not AST analysis; obfuscated code may bypass them
5. **Bash gate is tool-scoped** — detects dangerous commands Claude runs via the Bash tool; does not scan scripts Claude writes that a human later executes manually
6. **Template-based enforcement** — markdown templates are instructions for Claude, not hard runtime enforcement at the OS level

---

## Verification

```bash
# Run all 1449 tests
bash tests/test-features.sh

# Run environment security scan (scored 0-100)
# (inside a project with AZCLAUDE installed)
/sentinel

# Supply-chain scan only
/sentinel --supply-chain
```
