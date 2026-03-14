---
name: 5-layer-agent
description: >
  5-layer agent structure. Use when creating or improving a custom agent.
  Triggers on: create agent, improve agent, add agent, agent definition.
tokens: ~150
---

## 5-Layer Agent Structure

Every agent definition must have all five layers. Missing layers = incomplete agent.

| Layer | Name | What it contains |
|-------|------|-----------------|
| 1 | PERSONA | Who this agent is. Role, not personality. |
| 2 | SCOPE | What it does and what it explicitly does NOT do. |
| 3 | TOOLS & RESOURCES | Which tools it may use. Which files it reads. |
| 4 | CONSTRAINTS | Hard limits. What it must never do. |
| 5 | DOMAIN CONTEXT | Domain knowledge that shapes every decision. |

## Rules for Writing Agent Layers

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

## Subagent Passing Rule
When spawning this agent as a subagent, pass ONLY the capability files it needs
for this specific task — not its entire definition. A subagent doing detection
gets detect.md (~100 lines), not the full evolution module (~563 lines).
