---
name: level6-hooks
description: >
  Build Level 6: lifecycle hooks for automatic context injection.
  Triggers on: "build level 6", "add hooks", "automate session start".
tokens: ~200
requires: level5-agents
---

## Level 6: Lifecycle Hooks

Hooks are PUSH-based, not PULL-based. They fire automatically on events.
Claude does not need to remember to read goals.md — the hook injects it.

---

### Global vs Project-Level

| Type | What | Where | When |
|------|------|-------|------|
| Global | UserPromptSubmit + Stop | `~/.claude/settings.json` | Every project, installed once |
| Project | Formatter, linter, project-specific | `.claude/settings.json` | This project only |

Global hooks are installed by the `npx azclaude` command.
Project hooks are added here if needed beyond the global defaults.

---

### Defense in Depth

| Layer | What fires | Failure mode |
|-------|-----------|--------------|
| 1 | CLAUDE.md — always loaded | Never fails — always in context |
| 2 | UserPromptSubmit hook — injects goals.md | Hook command fails silently |
| 3 | Session State in CLAUDE.md — fallback | Always readable |

CLAUDE.md creates goals.md if it doesn't exist yet.
The hook injects it if it does exist and is stale.
Both layers cover the same need — defense in depth.

---

### Global Hook Behavior

**UserPromptSubmit** — fires before every user message is processed:
```bash
mkdir -p .claude/memory ops/observations shared-skills
if [ -f .claude/memory/goals.md ]; then
  AGE=$(($(date +%s) - $(date -r .claude/memory/goals.md +%s 2>/dev/null || echo 0)))
  if [ "$AGE" -gt 1800 ]; then
    echo "--- ACTIVE GOALS ---"
    cat .claude/memory/goals.md
    echo "--- END GOALS ---"
  fi
fi
```

AGE threshold 1800s (30 minutes) — inject only if goals haven't been read recently.

**Stop** — fires when session ends without /persist:
- Creates friction stub in `ops/observations/`
- Warns: "session state not persisted — run /persist before closing"

---

### Level 6 Complete When
- Global hooks confirmed in `~/.claude/settings.json` (`_azclaude: true`)
- goals.md is auto-injected at session start
- Stop hook creates friction stubs on unclean exits
