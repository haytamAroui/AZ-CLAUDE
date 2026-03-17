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
---

# Security Model

AZCLAUDE runs code and modifies files. These rules prevent common attack vectors.

## Hook Integrity
- SHA-256 hash in `~/.claude/.azclaude-integrity` verifies hooks weren't tampered
- `_azclaude: true` marker confirms hooks were installed by AZCLAUDE
- If integrity check fails: show the diff, let user decide. Never silently overwrite.

## Context Injection Protection
Files injected into context (goals.md, checkpoints) are scanned for:
- `ignore.*previous.*instructions`
- `curl.*|.*bash` or `wget.*|.*sh`
- `system prompt` or `you are now`
Suspicious lines are filtered by the UserPromptSubmit hook.

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

For full details, read `references/security-details.md`.
