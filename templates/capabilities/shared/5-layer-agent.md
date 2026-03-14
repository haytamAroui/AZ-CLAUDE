---
name: 5-layer-agent
description: >
  5-layer agent structure. Use when creating or improving a custom agent.
  Triggers on: create agent, improve agent, add agent, agent definition.
tokens: ~300
---

## Agent Frontmatter — Full Template

Every agent file starts with this. Omitting fields = missing capability.

```yaml
---
name: {agent-name}
description: >
  What this agent does. When to spawn it.
  What input it receives. What output it produces.

# Model routing — choose based on task type, not preference
model: claude-sonnet-4-6

# Hard stop — prevents runaway loops
maxTurns: 20

# Tools this agent may use — whitelist only what it needs
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob

# Tools explicitly blocked — deny what it must never touch
disallowedTools: []

# default = asks for permission | acceptEdits = auto-accepts edits | bypassPermissions = full trust
permissionMode: default

# true = runs in background (for parallel agents)
background: false

# none = normal | worktree = isolated git branch (for experiments — no risk to main)
isolation: none

# MCP servers this agent can access — empty = inherits parent
mcpServers: []

# Memory files to read at start — only what this agent actually needs
memory:
  - .claude/memory/goals.md
---
```

## Model Routing Table

| Task type | Model | Reason |
|-----------|-------|--------|
| Architecture decisions, review, debate | `claude-opus-4-6` | Complex reasoning, nuanced judgment |
| Implementation, code generation, most tasks | `claude-sonnet-4-6` | Fast, capable, default choice |
| Simple tasks, summarization, quick lookups | `claude-haiku-4-5` | Low cost, high speed |

Never use `claude-opus-4-6` by default — use it only when the task explicitly requires it.

---

## 5-Layer Body Structure

Every agent definition must have all five layers. Missing layers = incomplete agent.

| Layer | Name | What it contains |
|-------|------|-----------------|
| 1 | PERSONA | Who this agent is. Role, not personality. |
| 2 | SCOPE | What it does and what it explicitly does NOT do. |
| 3 | TOOLS & RESOURCES | Which tools it may use. Which files it reads. |
| 4 | CONSTRAINTS | Hard limits. What it must never do. |
| 5 | DOMAIN CONTEXT | Domain knowledge that shapes every decision. |

**Layer 5 (Domain Context) matters more than Layer 1 (Persona).**
Domain knowledge drives correct decisions. Role labels drive tone only.

**Use POSITIVE DIRECTIVES, not negative instructions.**
❌ "Don't generate vague output"
✅ "Every output includes file:line reference and actual test result"

Negative instructions activate the behavior in the model's mind before suppressing it.
Positive directives describe the correct behavior directly.

**Counterexample format** — always show what bad looks like:
```
Bad: "The tests should pass now"
Good: "Tests: 47 passed, 0 failed (output pasted below)"
```

**Real codebase examples required** — use actual code snippets from this project,
not hypothetical examples. Domain context must be grounded in reality.

---

## Layer 6: After Completing — Learning Protocol

Every agent appends what it learned before it exits. This turns single-use workers into accumulating specialists.

**If the task succeeded:**
```bash
echo "\n## {task-name} — $(date +%Y-%m-%d)\n{what worked and why}" >> .claude/memory/patterns.md
```

**If an approach failed:**
```bash
echo "\n## {task-name} — $(date +%Y-%m-%d)\n{what failed and why}" >> .claude/memory/antipatterns.md
```

**If a non-obvious decision was made:**
Append to `.claude/memory/decisions.md`:
```
## {Decision} — {date}
**Why**: {the reasoning, not just the choice}
**Trade-off**: {what was given up}
```

**If files were added or changed significantly:**
Update `.claude/memory/codebase-map.md` — one line per file: path + purpose.

Rules:
- Append only — never overwrite existing entries
- One entry per completed task — not per tool call
- Skip if task was trivial (< 5 min, no decisions made)

---

## Subagent Passing Rule
When spawning this agent, pass ONLY the capability files it needs for this specific task.
A detection agent gets `detect.md` (~100 lines). Not the full evolution module.
