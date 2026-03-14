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

## Completion Rule

Show: files changed, commit hash, branch, push status.
If no changes: "Nothing to ship — working tree is clean."
Do not say "shipped" without showing the push output.
