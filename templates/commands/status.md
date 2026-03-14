---
name: status
description: >
  Quick project overview. Health check, recent changes, current level, next steps.
  Triggers on: /status, "what's the status", "project overview", "how's it going".
tokens: ~80
---

# /status — Project Overview

Keep it short and visual. No walls of text.

---

## 1. Project Health
Detect the start command and try running it:
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

## 4. Next Steps
Based on what you see — suggest 2-3 things to work on next.
Be specific. Not "improve the code" — "fix the failing test in auth.test.js:47".

Read `.claude/memory/goals.md` if it exists — surface the current thread and next action.
