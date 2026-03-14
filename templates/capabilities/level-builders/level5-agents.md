---
name: level5-agents
description: >
  Build Level 5: project-specific custom agents.
  Triggers on: "build level 5", "create agent", "add custom agent".
tokens: ~300
requires: level4-memory
---

## Level 5: Custom Agents

Custom agents are defined in `.claude/agents/{name}.md`.
They fire when spawned via the Agent tool from a skill or CLAUDE.md routing.

Load shared/5-layer-agent.md for the full structure definition.

---

### When to Create a Custom Agent

Create an agent when:
- The task genuinely requires isolation (fresh context window)
- The task is parallelizable with other agents (multiple files to analyze simultaneously)
- The task is too long to run in the parent context without polluting it

Do NOT create an agent when:
- A skill with direct tool calls can do the same work
- The "agent" would just read one file and return its content
- You're using agents as a routing mechanism (routing belongs in CLAUDE.md)

---

### Co-Change Analysis — Determine Agent Boundaries

**Before creating agents**, run this to find which files change together:

```bash
git log --name-only --pretty=format: | grep -v '^$' | sort | uniq -d | head -30
```

Or more precisely — find files that appear in the same commits:

```bash
git log --format="%H" | while read sha; do
  git diff-tree --no-commit-id -r --name-only "$sha"
done | sort | uniq -c | sort -rn | head -20
```

**Rule**: Directories that appear in the same commits → same agent boundary.
If `src/api/` and `src/db/` always change together, they belong in ONE agent, not two.

**Good agent split** (files that change independently):
```
agent: frontend-agent  → src/components/, src/pages/  (UI changes alone)
agent: api-agent       → src/api/, src/middleware/    (backend changes alone)
```

**Bad agent split** (files that always change together):
```
agent: schema-agent    → src/db/schema/   (these always change
agent: migration-agent → src/db/migrations/  ← with schema — merge them)
```

Co-change coupling means the agents would always fire together anyway — merging saves a context switch and eliminates coordination overhead.

---

### Agent File Structure
```yaml
---
name: {agent-name}
description: >
  What this agent does. When to spawn it.
  Include: what input it receives, what output it produces.
---

## Layer 1: PERSONA
{Who this agent is — role, not personality}

## Layer 2: SCOPE
{What it does. What it explicitly does NOT do.}

## Layer 3: TOOLS & RESOURCES
{Which tools it may use. Which capability files to load for this task.}

## Layer 4: CONSTRAINTS
{Hard limits. What it must never do.}

## Layer 5: DOMAIN CONTEXT
{Domain knowledge specific to this project that shapes every decision.}
```

---

### Context Passing to Agents

When spawning this agent, pass ONLY:
- The specific capability file for its task (not the full module)
- The output from the previous step (not the full conversation)
- Shared rules if the task requires them (tdd.md, completion-rule.md)

Pass micro-sections, not monoliths. A detection agent gets detect.md (~100 lines).
Not evolution-module.md (563 lines in AZROLE — do NOT replicate this).

---

### Level 5 Complete When
- At least 1 custom agent exists for a genuine parallel/isolation use case
- Each agent has all 5 layers
- Each agent passes self-applicability check
- Agents are listed in manifest.md if they need to be discoverable
