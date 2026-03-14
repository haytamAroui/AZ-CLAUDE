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

### Defense in Depth — 3-Layer Session Safety

Three independent layers ensure session state is never lost. Any single layer can fail
and the other two catch it. This is not redundancy — each layer covers a different failure mode.

```
Layer 1: CLAUDE.md instruction
  ↓ "Read .claude/memory/goals.md at session start"
  Failure mode: Claude ignores it (instruction drift)
  Coverage: always in context — lowest reliability

Layer 2: UserPromptSubmit hook
  ↓ Injects goals.md content into every prompt automatically
  Failure mode: hook command fails silently on Windows/misconfigured shell
  Coverage: PUSH-based, doesn't depend on Claude following instructions

Layer 3: Stop hook
  ↓ Creates friction stub when session ends without /persist
  Failure mode: hook not installed, session crashes
  Coverage: catches unclean exits that Layer 1+2 cannot
```

**Why all 3 are required**: Layer 1 alone = broken when Claude is busy. Layer 2 alone = broken on Windows without Git Bash. Layer 3 alone = reactive not proactive. Together = session state survives all common failure modes.

**Installing Layer 2+3**: `npx azclaude` installs global hooks to `~/.claude/settings.json`.
**Installing Layer 1**: `/setup` writes the instruction into CLAUDE.md.

CLAUDE.md creates goals.md if it doesn't exist yet.
The hook injects it if it does exist and is stale.
Both layers cover the same need — defense in depth.

---

### PostToolUse Auto-Format Hooks (Project-Level)

After detecting the project stack, generate a `.claude/settings.json` with auto-format:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "{format-command}" }]
      }
    ]
  }
}
```

**Format command by stack:**

| Stack detected | Format command |
|---------------|----------------|
| TypeScript / JavaScript | `npx prettier --write "$CLAUDE_TOOL_RESULT_FILE" 2>/dev/null \|\| true` |
| Python | `ruff format "$CLAUDE_TOOL_RESULT_FILE" 2>/dev/null \|\| true` |
| Go | `gofmt -w "$CLAUDE_TOOL_RESULT_FILE" 2>/dev/null \|\| true` |
| Rust | `rustfmt "$CLAUDE_TOOL_RESULT_FILE" 2>/dev/null \|\| true` |
| Ruby | `rubocop --autocorrect "$CLAUDE_TOOL_RESULT_FILE" 2>/dev/null \|\| true` |

All commands end with `|| true` — format errors must never fail the tool call.
Only add if the formatter is confirmed installed (`which prettier` etc.).

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
