---
name: level-up
description: >
  Scan current Claude Code environment level (0-10), show what exists and
  what's missing, then build the next level.
  Triggers on: /level-up, "what level am I", "improve environment", "next level".
tokens: ~80
---

# /level-up — Scan and Build Next Level

Scan the current environment, then build what's missing.

---

## Step 1: Detect Current Level

Check what exists:
```bash
[ -f CLAUDE.md ] && echo "L1: CLAUDE.md ✓" || echo "L1: CLAUDE.md ✗"
[ -f .mcp.json ] && echo "L2: MCP ✓" || echo "L2: MCP ✗"
[ -d .claude/commands ] && ls .claude/commands/*.md 2>/dev/null | wc -l | xargs -I{} echo "L3: {} skill(s) ✓" || echo "L3: Skills ✗"
[ -f .claude/memory/goals.md ] && echo "L4: Memory ✓" || echo "L4: Memory ✗"
[ -d .claude/agents ] && ls .claude/agents/*.md 2>/dev/null | wc -l | xargs -I{} echo "L5: {} agent(s) ✓" || echo "L5: Agents ✗"
[ -f ~/.claude/settings.json ] && grep -q "_azclaude" ~/.claude/settings.json && echo "L6: Hooks ✓" || echo "L6: Hooks ✗"
[ -f .mcp.json ] && grep -q "external\|browser\|database" .mcp.json 2>/dev/null && echo "L7: External MCP ✓" || echo "L7: External MCP ✗"
```

Show result as a visual checklist. State current level clearly:
"You are at Level N. Next: Level N+1."

---

## Step 2: Build Next Level

Read `.claude/capabilities/manifest.md`, find the matching `level-builders/level{N+1}.md`, load it, and build that level.

Load ONE level builder at a time — not all of them.

If already at Level 7: run `/evolve` instead. The environment is built — now improve what's inside it.

---

## Completion Rule
Show what was created.
Show the updated level checklist.
Do not say "level complete" without showing the new files.
