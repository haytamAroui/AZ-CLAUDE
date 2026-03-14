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
  {Pushy description — list 10+ trigger scenarios. Claude under-triggers.}
tools: Read, Write, Edit, Bash, Glob, Grep
disallowedTools: Agent          # for non-orchestrating agents
model: sonnet                   # see Model Routing below
memory: project
permissionMode: acceptEdits     # see Permission Modes below
maxTurns: 50
skills:
  - project-conventions
  - {relevant-skill}
mcpServers: []                  # scope MCP access per agent
---
```

## Model Routing

| Model | Use for |
|-------|---------|
| `opus` | Architecture, review, orchestration, debate |
| `sonnet` | Implementation (frontend, backend, testing) |
| `haiku` | Simple/fast tasks (formatting, lookup) |

## Permission Modes

| Mode | Use for |
|------|---------|
| `acceptEdits` | Implementation agents — can write code |
| `plan` | Reviewer agents — read-only, cannot edit |

## Agent Design Patterns
- Review agents: `tools: Read, Glob, Grep, Bash` + `disallowedTools: Write, Edit`
- Use `background: true` for concurrent agents (linting, formatting)
- Use `isolation: worktree` for risky/experimental work

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

## After Completing — MANDATORY for Every Agent

An agent that works brilliantly and forgets everything is a waste.

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

## For Reviewer Agents — Spec-First Rule

Reviewer agents must follow this order. **Skipping Step 1 = broken review.**

**Step 1: Spec Compliance Check**
- Does the output satisfy the requirements?
- Does it match the acceptance criteria?
- Are all edge cases covered?
- Output: `{ spec_compliance: pass|fail, violations: [...] }`

**Step 2: CODE QUALITY** — only proceed if Step 1 passes
- Reference patterns.md and antipatterns.md
- Does it follow project conventions (from CLAUDE.md)?
- Are there performance or security concerns?

**RULE: Do NOT begin Step 2 if Step 1 has ❌ issues.**
Reviewing code quality before spec compliance wastes time.

```
Bad: "The code looks good overall but could be improved."
Good: "Spec: ✓ pass (all 4 requirements met). Quality: 2 issues (lines 45, 78) — non-blocking."
```

---

## Subagent Passing Rule
When spawning this agent, pass ONLY the capability files it needs for this specific task.
A detection agent gets `detect.md` (~100 lines). Not the full evolution module.
