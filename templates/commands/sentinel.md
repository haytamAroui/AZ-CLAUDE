---
name: sentinel
description: >
  Static security scan of the Claude Code environment.
  Audits hooks, permissions, MCP servers, agent configs, and secrets.
  Produces a scored report (0–100) with grade A–F and blocking findings.
  Triggers on: "security scan", "audit environment", "check my hooks",
  "is my setup safe", "scan for secrets", "check permissions",
  "audit agents", "check mcp", "security check", "sentinel".
argument-hint: "[--hooks | --mcp | --agents | --secrets | --supply-chain | --all (default)]"
disable-model-invocation: true
allowed-tools: Read, Grep, Bash, Glob
---

# /sentinel — Environment Security Scan

$ARGUMENTS

---

**EnterPlanMode** — this command is read-only. No file modifications.

---

## Agent Dispatch

Check if `security-auditor` agent is installed:
```bash
ls .claude/agents/security-auditor.md 2>/dev/null && echo "agent=found" || echo "agent=missing"
```

If `agent=found`:
Read `.claude/agents/security-auditor.md` and execute the full scan inline using the agent's instructions and rule set. This gives the full 102-rule scan without requiring a subprocess.
Display the Security Report and **ExitPlanMode**. Done — do not run layers below.

If `agent=missing`: continue with manual layers below.

---

## Overview (fallback — no agent installed)

Scans five layers of the Claude Code environment for security issues.
Each layer is scored independently. Final score = weighted average (0–100).
Grade: A ≥ 90 · B ≥ 75 · C ≥ 60 · D ≥ 45 · F < 45

Parse $ARGUMENTS:
- `--hooks`        → run Layer 1 + 2 only
- `--mcp`          → run Layer 3 only
- `--agents`       → run Layer 4 only
- `--secrets`      → run Layer 5 only
- `--supply-chain` → run Layer 6 only
- blank / `--all`  → run all six layers

---

## Layer 1 — Hook Integrity (weight: 25)

Check if hooks were modified outside of AZCLAUDE.

```bash
# Project-level (preferred) — hooks are registered in .claude/settings.local.json
PROJECT_INTEGRITY=".claude/.azclaude-integrity"
PROJECT_SETTINGS=".claude/settings.local.json"
# Global fallback
GLOBAL_INTEGRITY="$HOME/.claude/.azclaude-integrity"
if [ -n "$APPDATA" ]; then
  GLOBAL_SETTINGS="$APPDATA/Claude/settings.json"
else
  GLOBAL_SETTINGS="$HOME/.claude/settings.json"
fi
# Use project-level if both project files exist; otherwise fall back to global
if [ -f "$PROJECT_INTEGRITY" ] && [ -f "$PROJECT_SETTINGS" ]; then
  INTEGRITY="$PROJECT_INTEGRITY"; SETTINGS="$PROJECT_SETTINGS"
  echo "integrity_scope=project"
else
  INTEGRITY="$GLOBAL_INTEGRITY"; SETTINGS="$GLOBAL_SETTINGS"
  echo "integrity_scope=global"
fi
[ -f "$INTEGRITY" ] && echo "integrity_file=found" || echo "integrity_file=missing"
[ -f "$SETTINGS"  ] && echo "settings_file=found"  || echo "settings_file=missing"
```

If both exist:
```bash
cat "$INTEGRITY"
```
Compute SHA-256 of the `hooks` key in `$SETTINGS` and compare.
- Match → +25 pts — "Hook integrity verified"
- Mismatch → +0 pts — **BLOCK** "Hook integrity mismatch — hooks modified outside AZCLAUDE"
- Missing integrity file → +15 pts — "No integrity baseline (run `npx azclaude install` to establish one)"

Check each hook script for dangerous patterns:
```bash
ls .claude/hooks/ 2>/dev/null || ls "$HOME/.claude/hooks/" 2>/dev/null
```

For each `.js` / `.sh` hook found, flag:
- `curl.*\| sh` or `wget.*\| bash` → **HIGH** — data exfiltration or remote code execution
- `process\.exit\(0\)` as only exit path in a blocking hook → MEDIUM — hook may be neutered
- `rm -rf` / `del /f` → **HIGH** — destructive operation in hook
- External URLs (`https://` in a hook that isn't the AZCLAUDE template) → MEDIUM — review intent

---

## Layer 2 — Permission Audit (weight: 20)

Check Claude Code settings for over-permissioned configurations.

```bash
# Windows: %APPDATA%\Claude\settings.json — Unix/Mac: ~/.claude/settings.json
SETTINGS="${APPDATA:+$APPDATA/Claude/settings.json}"
SETTINGS="${SETTINGS:-$HOME/.claude/settings.json}"
cat "$SETTINGS" 2>/dev/null | head -80
cat .claude/settings.local.json 2>/dev/null
```

Flag these patterns:
| Pattern | Severity | Finding |
|---|---|---|
| `"allowedTools": ["*"]` or wildcard | HIGH | Unrestricted tool access |
| `"dangerouslyAllowedTools"` present | HIGH | Review each entry |
| `"bypassPermissionsModeAccepted": true` | HIGH | Permission bypass enabled |
| No `hooks` key present | MEDIUM | No hook protection installed |
| `_azclaude: true` absent from hooks | LOW | Hook origin unverified |

Score: start at 20, subtract per finding: HIGH −8, MEDIUM −3, LOW −1 (floor: 0)

---

## Layer 3 — MCP Server Scan (weight: 20)

```bash
cat .mcp.json 2>/dev/null
# Windows: %APPDATA%\Claude\mcp.json — Unix/Mac: ~/.claude/mcp.json
MCP_GLOBAL="${APPDATA:+$APPDATA/Claude/mcp.json}"
MCP_GLOBAL="${MCP_GLOBAL:-$HOME/.claude/mcp.json}"
cat "$MCP_GLOBAL" 2>/dev/null
```

For each MCP server entry, check:
- **Hardcoded secrets** — any value matching `AKIA|sk-|ghp_|glpat-|xoxb-|npm_|AIza|sk_live_|SG\.|-----BEGIN` → **HIGH BLOCK**
- **Missing env var syntax** — secrets should use `${ENV_VAR}` not raw strings
- **`npx` + unknown package** — flag packages not in npm registry for manual review
- **`uvx` / `python -m`** — Python MCP servers: flag if no checksum verification
- **External URLs in `args`** — remote server connections without allowlist

Score: start at 20, subtract HIGH −10, MEDIUM −4, LOW −1 (floor: 0)

---

## Layer 4 — Agent Config Review (weight: 15)

```bash
ls .claude/agents/*.md 2>/dev/null
ls templates/agents/*.md 2>/dev/null
```

For each agent file found, check the system prompt / instructions for:
- **`ignore.*previous.*instructions`** → HIGH — prompt injection planted
- **`curl.*\|.*bash`** or `wget.*\|.*sh` → HIGH — RCE instruction
- **`you are now`** / `pretend you are` → MEDIUM — persona hijack
- **`<script>`** / HTML injection → MEDIUM — XSS via context
- **Base64 blocks > 200 chars** → MEDIUM — encoded payload
- Write-permitted reviewer agents → MEDIUM — violates least-privilege

Also scan **all AI context surfaces** for the same injection patterns (CVE-2025-54794/54795):
```bash
# Scan agents
grep -rl "ignore.*previous\|you are now\|curl.*|.*bash" .claude/agents/ 2>/dev/null
grep -rl "ignore.*previous\|you are now\|curl.*|.*bash" templates/agents/ 2>/dev/null
# Scan context-injection surfaces
grep -in "ignore.*previous.*instructions\|disregard.*rules\|DAN mode\|override.*safety" \
  .clinerules CLAUDE.md .claude/commands/*.md 2>/dev/null
```

Any injection pattern found in `.clinerules`, `CLAUDE.md`, or `.claude/commands/*.md` → **BLOCK**

Score: start at 15, subtract HIGH −10, MEDIUM −4, LOW −1 (floor: 0)

---

## Layer 5 — Secrets Scan (weight: 20)

Scan committed and staged files for exposed credentials.

```bash
git diff --cached --name-only 2>/dev/null
git ls-files --cached 2>/dev/null | grep -v node_modules | grep -v .git | head -200
```

Run pattern scan across tracked files:
```bash
grep -rn \
  "AKIA[A-Z0-9]\{16\}\|glpat-[A-Za-z0-9_-]\{20\}\|ghp_[A-Za-z0-9]\{36\}" \
  --include='*.js' --include='*.ts' --include='*.py' --include='*.json' \
  --include='*.yaml' --include='*.yml' --include='*.env' --include='*.sh' \
  . 2>/dev/null | grep -v node_modules | grep -v ".git/"
```

Also scan for:
- `xoxb-` (Slack bot), `xoxp-` (Slack user), `npm_` (npm token)
- `AIza[0-9A-Za-z-_]{35}` (Google API key)
- `sk_live_` (Stripe secret), `SG\.` (SendGrid)
- `-----BEGIN.*PRIVATE KEY` (private keys)

**IMPORTANT — Secret redaction in output:** Never print full secret values in the report.
Always truncate: show first 8 chars + `...` + last 3 chars. Example: `AIzaSyCM...VNM`.
The report may be logged, shared, or appear in conversation transcripts.

If `.env` exists: check it is in `.gitignore`:
```bash
grep -q "\.env" .gitignore 2>/dev/null && echo ".env gitignored: yes" || echo ".env gitignored: NO"
```

Score: start at 20, subtract per finding: HIGH −15, MEDIUM −5 (floor: 0)
Any hardcoded secret → **BLOCK** — do not allow ship/deploy until resolved.

---

## Layer 6 — Supply Chain Integrity (advisory — no score deduction)

Findings here appear in WARNINGS but do not reduce the total score.

```bash
# Lockfile check
ls package-lock.json yarn.lock poetry.lock Pipfile.lock 2>/dev/null || echo "no_lockfile=WARN"

# Loose version pins (Node.js)
[ -f package.json ] && node -e "
  const p=require('./package.json');
  const d={...p.dependencies,...p.devDependencies};
  const loose=Object.entries(d||{}).filter(([,v])=>/[\^\~]/.test(v));
  console.log('loose_pins='+loose.length);
" 2>/dev/null

# npm audit (zero external deps — bundled with npm)
command -v npm >/dev/null 2>&1 && npm audit --json 2>/dev/null \
  | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      try {
        const v=(JSON.parse(d).metadata||{}).vulnerabilities||{};
        console.log('audit_critical='+(v.critical||0)+' audit_high='+(v.high||0));
      } catch(_){ console.log('audit=unavailable'); }
    });
  " || echo "npm_audit=unavailable"
```

Flag:
- No lockfile + `package.json` present → MEDIUM — supply chain attack surface
- >5 loose pins (`^`/`~`) → LOW — dependency version drift risk
- `npm audit` CRITICAL > 0 → HIGH — known exploitable vulnerability in deps
- `npm audit` HIGH > 0 → MEDIUM — known high-severity vulnerability in deps

---

## Scoring & Report

Calculate total score:
```
total = layer1_score + layer2_score + layer3_score + layer4_score + layer5_score
grade = A if total >= 90, B if >= 75, C if >= 60, D if >= 45, else F
```

Output format:
```
╔══════════════════════════════════════════════════╗
║          SENTINEL — Environment Security         ║
╚══════════════════════════════════════════════════╝

Layer 1 — Hook Integrity         ··/25   [status]
Layer 2 — Permission Audit       ··/20   [status]
Layer 3 — MCP Server Scan        ··/20   [status]
Layer 4 — Agent Config Review    ··/15   [status]
Layer 5 — Secrets Scan           ··/20   [status]
Layer 6 — Supply Chain           advisory [status]
─────────────────────────────────────────────────
Total Score:  ··/100   Grade: [A/B/C/D/F]

BLOCKING FINDINGS:
  [file:line — description — MUST FIX BEFORE SHIP]

WARNINGS:
  [file:line — description — review recommended]

PASSED:
  [N checks passed with no issues]
```

**Rules:**
- Any BLOCK finding → output `VERDICT: BLOCKED` — `/ship` must not proceed
- Grade A or B, no blocks → output `VERDICT: CLEAR`
- Grade C/D, no blocks → output `VERDICT: PROCEED WITH CAUTION`

**ExitPlanMode**

Do not suggest fixes inline. List findings only. User resolves — then re-run `/sentinel`.
