# Security Policy — AZCLAUDE

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

**Do NOT open a public issue for security vulnerabilities.**

Email: haytam.aroui@gmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

Response time: within 48 hours. Fix timeline: within 7 days for critical issues.

## Security Architecture

### Zero Dependencies
`package.json` has zero `dependencies` and zero `devDependencies`. The only external binary is the `claude` CLI (installed separately by the user). This eliminates supply-chain risk entirely.

### 6 Security Layers

1. **Hook integrity** — SHA-256 hash of hook config written at install, verified on every run (`bin/cli.js:generateIntegrityHash`)
2. **Command injection protection** — `post-tool-use.js` sanitizes `$CLAUDE_FILE_PATH`, rejects paths outside project root (`rel.startsWith('..')`)
3. **Prompt injection defense** — `user-prompt.js` strips `curl|bash`, `ignore previous instructions`, base64 blocks > 500 chars from goals.md before context injection
4. **Skill checksums** — portable skills in `~/shared-skills/` are SHA-256 hashed, imports fail loudly if tampered
5. **Credential auditing** — `/ship` command blocks on `.env`, plaintext keys, `AKIA`, `sk-`, `ghp_` patterns before any git push
6. **Agent scoping** — review agents run in `EnterPlanMode` (read-only), experiment agents in isolated git worktrees (`EnterWorktree`)

### The `--dangerously-skip-permissions` Flag

`bin/copilot.js` uses `--dangerously-skip-permissions` to enable autonomous execution. This is documented and intentional — the copilot cannot function with approval gates.

**Mitigations:**
- Copilot only runs in the specified `projectDir` (passed as argument)
- All file operations are scoped to the project directory via `cwd: projectDir`
- `/ship` runs a secrets scan before any `git push`
- PostToolUse hook rejects paths outside the project root
- Hook profiles (`AZCLAUDE_HOOK_PROFILE=strict`) enable extra validation

**Recommended precautions when running copilot:**
- Run in a fresh git branch or worktree
- Review `copilot-report.md` after completion
- Use `npx azclaude doctor --audit` to verify environment security score
- Set `AZCLAUDE_HOOK_PROFILE=strict` for maximum protection

### Anthropic API Key

AZCLAUDE does **not** manage or store API keys. The `claude` CLI handles authentication independently:

```bash
# User authenticates once (stored by claude CLI, not by AZCLAUDE)
claude auth login

# Or via environment variable
export ANTHROPIC_API_KEY=sk-ant-...
```

AZCLAUDE never reads, logs, or transmits the API key. The key is accessed only by the `claude` CLI process.

### State File Security

All state files live in `.claude/` (gitignored via `settings.local.json`):

| File | Contains | Risk |
|------|----------|------|
| `goals.md` | File paths, timestamps, change summaries | Low — no secrets |
| `checkpoints/` | Reasoning snapshots, decisions | Low — no secrets |
| `copilot-intent.md` | Product description | Low |
| `plan.md` | Milestone tracker | Low |
| `metrics/costs.jsonl` | Tool call timestamps | Low |
| `settings.local.json` | Hook paths (absolute, machine-specific) | Medium — gitignored |

### Hook Profile System

Control hook behavior via environment variable:

```bash
# Minimal — goals.md tracking only (fastest, least overhead)
AZCLAUDE_HOOK_PROFILE=minimal claude

# Standard — all features (default)
AZCLAUDE_HOOK_PROFILE=standard claude

# Strict — all features + extra validation
AZCLAUDE_HOOK_PROFILE=strict claude
```

## Known Limitations

1. **No sandboxing** — copilot.js runs Claude with full permissions in the project directory
2. **No cost limits** — no spending cap on Claude API usage during autonomous runs
3. **No network isolation** — Claude can access the internet (for deploy, npm install, etc.)
4. **Template-based enforcement** — security checks are in markdown templates, not hard runtime enforcement

## Verification

```bash
# Check environment health
npx azclaude doctor

# Check efficiency + security score
npx azclaude doctor --audit

# Run all 989 tests
bash tests/test-features.sh
```
