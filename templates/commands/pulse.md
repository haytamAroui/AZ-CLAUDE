---
name: pulse
description: Quick project overview — health check, recent changes, current level, next steps from goals.md.
allowed-tools: Read, Bash, Grep
---

# /pulse — Project Overview

Recent git activity:
!`git log --oneline -5 2>/dev/null || echo 'no git history'`

Uncommitted changes:
!`git status --short 2>/dev/null || echo 'not a git repo'`

Keep it short and visual. No walls of text.

---

## 1. Project Health

**IDE diagnostics** — use `mcp__ide__getDiagnostics` if available.
If available, report count and severity:
```
✓ IDE: 0 errors, 0 warnings   or   ✗ IDE: 3 errors, 7 warnings — run /fix
```
If unavailable: skip this line.

Then detect the start command and try running it:
- `package.json` → check `scripts.start` or `scripts.dev`
- `pyproject.toml` / `Makefile` → detect equivalent
- Check for missing dependencies, missing env vars, broken config

Report:
```
✓ App starts cleanly   or   ✗ App fails: {error in one line}
✓ Dependencies installed   or   ✗ Missing: {what}
✓ Config complete   or   ✗ Missing: {what}
```

---

## 2. What Changed
```bash
git status --short
git diff --stat HEAD~1 2>/dev/null || git diff --stat
```

Show files changed — not the full diff.

---

## 3. Current Level
Check environment level (same detection as /level-up Step 1).
One line: "Environment: Level N / 7"

---

## 4. Intelligence Health

Quick check on the learning and boundary systems:

```bash
# Copilot status
[ -f .claude/plan.md ] && echo "Copilot: plan.md exists" && grep -c "Status:" .claude/plan.md 2>/dev/null | xargs -I{} echo "  {} milestones" || echo "Copilot: no plan"

# Reflex health
OBS=".claude/memory/reflexes/observations.jsonl"
[ -f "$OBS" ] && echo "Reflexes: $(wc -l < "$OBS" | tr -d ' ') observations" || echo "Reflexes: no observations"
ls .claude/memory/reflexes/project/*.md 2>/dev/null | wc -l | xargs -I{} echo "  {} project reflexes"

# Boundary health
[ -f .claude/memory/metrics/boundaries.json ] && echo "Boundaries: $(cat .claude/memory/metrics/boundaries.json 2>/dev/null | grep -o '"warn":[0-9]*' | head -1)" || echo "Boundaries: not scanned"

# Blocker count
[ -f .claude/memory/blockers.md ] && echo "Blockers: $(grep -c "^###" .claude/memory/blockers.md 2>/dev/null || echo 0)" || echo "Blockers: none"

# Evolution history
[ -f ops/evolution-log.md ] && echo "Evolve: $(tail -1 ops/evolution-log.md 2>/dev/null | cut -d'|' -f2 | tr -d ' ')" || echo "Evolve: never run"
```

---

## 5. Next Steps
Based on what you see — suggest 2-3 things to work on next.
Be specific. Not "improve the code" — "fix the failing test in auth.test.js:47".

Read `.claude/memory/goals.md` if it exists — surface the current thread and next action.
