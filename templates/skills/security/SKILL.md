---
name: security
description: >
  Security hardening for AZCLAUDE environments. Use when handling credentials,
  API keys, secrets, .env files, modifying hooks, reviewing untrusted code,
  importing shared skills, deploying, shipping, pushing to production, or
  when the user says "is this safe", "security check", "review for
  vulnerabilities", "check for secrets", "credential", "token", "password",
  or any work involving sensitive data. Also use before any /ship operation,
  when editing ~/.claude/settings.json, or when importing skills from
  external sources.
tags: [security, credentials, secrets, hooks, deploy, audit]
---

# Security Model

<instructions>
AZCLAUDE runs code and modifies files. A 4-hook pipeline provides layered runtime protection.

## 4-Hook Runtime Pipeline

```
User prompt → [user-prompt.js]   — injection scan (every prompt)
                    ↓
Claude calls tools → [pre-tool-use.js] — Bash gate + Read gate + Write gate (14 rules)
                    ↓
Tool completes  → [post-tool-use.js] — behavioral sequence detection
                    ↓
Session ends    → [stop.js]          — security summary + cleanup
```

All hooks share `/tmp/.azclaude-seclog-{PID}` (JSONL). Session summary printed at stop.

## Hook Integrity
- SHA-256 hash in `~/.claude/.azclaude-integrity` verifies hooks weren't tampered
- `_azclaude: true` marker confirms hooks were installed by AZCLAUDE
- If integrity check fails: show the diff, let user decide. Never silently overwrite.

## Bash Gate (pre-tool-use.js)
| Rule | Pattern | Action |
|------|---------|--------|
| `rce-curl-pipe` | `curl ... \| bash` | **Block** |
| `rce-wget-pipe` | `wget ... \| bash` | **Block** |
| `destructive-rm` | `rm -rf /` or `rm -rf ~` | **Block** |
| `shadow-npm-install` | `npm install` without `--ignore-scripts` | Warn |
| `env-var-echo` | `echo $SECRET` / `echo $TOKEN` | Warn |

## Read Gate (pre-tool-use.js)
Warns (once per session) when Claude reads credential files:
`.env`, `.env.*`, `secrets.json`, `secrets.yaml`, `credentials.json`, `id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, `.pem`, `.p12`, `.pfx`, `.keystore`

## Write Gate — 19 Rules (pre-tool-use.js)
Scans all Edit/Write content before writing. Secrets → **Block** (exit 2). Others → Warn.

Key patterns: `eval(`, `child_process.exec(`, `dangerouslySetInnerHTML`, `pickle.load(`,
`os.system(`, `subprocess(..., shell=True)`, `gets(`, `shell_exec(`,
`Runtime.getRuntime().exec(`, `render_template_string(`,
`MD5`/`SHA1`/`Math.random()`, `__proto__`, `yaml.load(`, `../` traversal,
`ignore previous instructions`, AWS/GH/GL/Slack/npm/GCP/Stripe/SendGrid/PEM tokens.

For fix guidance per pattern: `references/security-details.md`

## Behavioral Sequence Detection (post-tool-use.js)
Tracks last 5 tool calls. Detects exfiltration patterns:
- `Read(.env) → Bash` — credential read then shell execution → Warn
- `Read(.env) → WebFetch` — credential read then external HTTP → Warn

## Context Injection Protection (user-prompt.js)
Fires on **every** prompt (before session gate). Filters from goals.md + checkpoints:
- `ignore [all] previous instructions`
- `disregard [all] previous instructions`
- `override your [rules/instructions/safety]`
- `you are now [a new/different/unrestricted]`

## Credential Handling
- Credentials go in env vars — never in committed files
- `.env` files: always in `.gitignore`, never staged by `/ship`
- `.mcp.json`: use `${ENV_VAR}` syntax, never plaintext
- Before deploy/ship: scan for exposed secrets (AKIA, sk-, ghp_, glpat-, xoxb-)

## Agent Permission Scoping
| Agent type | Recommended permissions |
|-----------|------------------------|
| Reviewer | Read, Glob, Grep, Bash — NO Write/Edit |
| Implementer | Read, Write, Edit, Bash, Glob, Grep |
| Orchestrator | Read, Agent — NO Write/Edit |
| Experiment | isolation: worktree (cannot touch main) |

## Supply Chain Awareness
- Always check lockfile exists before `npm install` in new projects
- `npm audit` CRITICAL findings → block; HIGH → warn
- Loose pins (`^`, `~`, `*`) in package.json → flag for review
- Run `/sentinel --supply-chain` for full dependency scan

For full details: `references/security-details.md`
</instructions>
