---
name: ship
description: >
  Stage changes, commit, and push to GitHub. Pre-ship gate: IDE diagnostics + tests must pass.
  Triggers on: "ship", "push", "commit and push", "deploy", "send to GitHub", "save and push".
  Skips .env and secrets automatically. Never ships with failing tests or IDE errors.
argument-hint: "[optional: commit message hint]"
disable-model-invocation: true
allowed-tools: Bash, Read
---

# /ship — Save and Push to GitHub

$ARGUMENTS

---

## Step 0: Risk Scan (intelligent-dispatch)

Load `shared/intelligent-dispatch.md`.

If problem-architect available — spawn it for a pre-ship risk scan:
```
Task: ship — pre-ship risk assessment
Current state: {output of: git diff --stat HEAD}
Available agents: {list}
Available skills: {list}
```
Use returned Team Spec:
- Risks → must address before shipping (not suggestions)
- Structural Decision: YES → a decision was made without /debate → log it to decisions.md now
- Pre-Conditions → any unmet condition blocks ship (e.g., migration not run, env var not set)

If problem-architect not installed OR git diff is only docs/config: skip and proceed to Pre-Ship Gate.

---

## Pre-Ship Gate (runs before any commit)

**1. IDE diagnostics** — use `mcp__ide__getDiagnostics` if available.
If unavailable or empty: skip this check.
If errors exist: STOP.
```
✗ Pre-ship blocked: {N} IDE errors. Fix with /fix before shipping.
```

**2. Tests**
```bash
{test command}; EXIT=$?
echo "Exit: $EXIT"
```
If EXIT ≠ 0: STOP.
```
✗ Pre-ship blocked: tests failing. Run /test to fix.
```

If both pass: `✓ Pre-ship gate passed`

---

## Step 0.5: Docs Sync (runs before commit)

Check for stale documentation — 3 quick greps, no file reads required:

```bash
# 1. Version in README matches package.json?
README_VER=$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+' README.md 2>/dev/null | head -1)
PKG_VER=$(node -p "require('./package.json').version" 2>/dev/null)
[ "$README_VER" != "$PKG_VER" ] && echo "⚠ README version ($README_VER) ≠ package.json ($PKG_VER) — update README"

# 2. Command count in README matches installed commands?
README_CMDS=$(grep -oE '[0-9]+ commands?' README.md 2>/dev/null | grep -oE '[0-9]+' | head -1)
ACTUAL_CMDS=$(ls .claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')
[ -n "$README_CMDS" ] && [ "$README_CMDS" != "$ACTUAL_CMDS" ] && echo "⚠ README says $README_CMDS commands, found $ACTUAL_CMDS"

# 3. Known stale risk section?
grep -q "bash.*Windows\|Git Bash.*fail" README.md 2>/dev/null && echo "⚠ README still has stale bash/Windows risk — update to Node.js hooks"
```

If any warnings fire: update README before committing.
If README does not exist or all checks pass: skip.

---

## Step 1: Show What Will Ship

```bash
git status --short
git diff --stat HEAD
```

---

## Step 2: Secret Scan

```bash
git status --short | grep -iE "\.env|secret|credential|\.key|token|password"
```

If found: warn and skip those files. Never stage secrets.

---

## Step 3: Stage and Commit

Stage changed files — never `.env`, secrets, `node_modules`.

Generate commit message:
- Format: `{type}: {what changed} — {why}`
- Types: `feat` / `fix` / `refactor` / `docs` / `chore`
- Lead with impact ("add user auth" not "update auth.ts")
- Use $ARGUMENTS hint if provided

If not a git repo: run `git init` first.

---

## Step 4: Push

If remote exists: `git push`

If no remote:
```
git remote add origin https://github.com/{username}/{repo}.git
git push -u origin main
```

---

## Step 5: Deploy (Copilot Mode Only)

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE` and the intent mentions deploy targets (Vercel, Railway, Netlify, etc.):
1. Check if deploy config exists (vercel.json, railway.json, netlify.toml, Dockerfile)
2. If config exists → run the deploy command (`vercel --prod`, `railway up`, etc.)
3. If deploy succeeds → record URL in `.claude/copilot-report.md`
4. If deploy fails → log to `.claude/memory/blockers.md`, continue (product is still built)
5. If no deploy target mentioned → skip deployment, push is sufficient

If `INTERACTIVE_MODE`: skip Step 5.

---

## Completion Rule

Show: files changed, commit hash, branch, push status.
If no changes: "Nothing to ship — working tree is clean."
Do not say "shipped" without showing the push output.
