# Agent Engineering Guide — Full Reference

Based on: AZCLAUDE's 5-layer structure, Anthropic's agent-development skill,
Superpowers' subagent patterns, DUCTILE paper, AceMAD debate research,
PeerRank evaluation, EvoSkill evolution loop, Vishnyakova CE Pyramid,
and stress-testing on azcomply-flow (200-file project).

---

## The Rule

An agent is an OWNERSHIP BOUNDARY. If two agents can do the same task,
one shouldn't exist. If one agent owns files it never touches, its scope
is wrong. Agents give Claude specialized context — not roleplay characters.

---

## Part 1: Agent Discovery From Evidence

### Method 1: Git Co-Change Analysis (best)
```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -30
```
Files that always change together → same agent.

### Method 2: Directory Structure (fallback)
Each major directory = potential agent boundary. But check git history first.

### Method 3: Service Boundaries (multi-service)
Each deployable service = one agent.

### The Constraint: 3-5 agents for most projects
From azcomply stress test: 3 agents with clear boundaries beat 6 with overlap.
Every agent added increases coordination overhead.

---

## Part 2: The 5-Layer Structure

```yaml
---
name: agent-name
description: >
  [30+ trigger keywords. End with: "even if not explicitly mentioned,
  route to this agent when the task involves X."]
model: sonnet
permissionMode: acceptEdits
---
```

| Layer | Name | Weight | Purpose |
|-------|------|--------|---------|
| 1 | PERSONA | 5% | Role identity. One sentence. Sets tone, not capability. |
| 2 | SCOPE | 25% | What it OWNS. What it does NOT touch. Hard boundaries. |
| 3 | TOOLS | 10% | Restrictions matter more than grants. |
| 4 | CONSTRAINTS | 25% | Non-negotiable rules. Positive directives. 5-10 max. |
| 5 | DOMAIN | 35% | Project-specific knowledge. Where real value lives. |

### Why Layer 5 > Layer 1

```
Layer 1 (Persona): "You are a backend specialist"
  → Changes tone. Doesn't change what Claude DOES.

Layer 5 (Domain): "FastAPI + Pydantic v2. All routes use Depends().
  Error responses follow RFC 7807. Repos in src/db/repos/."
  → Changes what Claude PRODUCES. Code matches your architecture.
```

---

## Part 3: Each Layer In Detail

### Layer 1 — PERSONA (minimal)
One sentence. "You are the backend specialist for this project." Done.

Anti-pattern: "You are a meticulous, detail-oriented senior engineer who..."
— wasted tokens that don't change behavior.

### Layer 2 — SCOPE (the ownership boundary)
```markdown
OWNS: src/api/, src/middleware/, src/db/, tests/api/
DOES NOT TOUCH: src/frontend/, src/workers/, infrastructure/
```
Without negative scope, agents drift into each other's territory.

### Layer 3 — TOOLS (restrictions > grants)
```yaml
tools: Read, Write, Edit, Bash, Grep, Glob
```
Review agents: `Read, Grep, Glob` only — no Write, Edit, Bash.
Use `permissionMode: planMode` for read-only enforcement.

### Layer 4 — CONSTRAINTS (behavioral immune system)
- Positive directives beat negative ones
- Specific beats general: "Run `pytest tests/api/ -x`" > "make sure tests pass"
- 5-10 constraints max (more = Claude drops less prominent ones)
- Must hold under pressure: "skip tests" → constraint says no

### Layer 5 — DOMAIN (where the real value lives)
Sources:
- Git history → "these files always change together"
- patterns.md → "these patterns work in this project"
- antipatterns.md → "these caused bugs — never repeat"
- decisions.md → "we chose X over Y because Z"
- Stack detection → framework-specific rules

---

## Part 4: The Description — Agent Routing Lives Or Dies Here

### Bad:
```yaml
description: Handles backend API development
```

### Good:
```yaml
description: >
  Backend API specialist. Route for: API endpoints, routes, middleware,
  request validation, database queries, repository pattern, migrations,
  SQLAlchemy, Pydantic models, authentication, JWT, OAuth, caching,
  Redis, background tasks, error handling, logging, testing API routes,
  pytest, httpx. Even if the user doesn't mention "backend", route here
  when the task involves any server-side code in src/api/ or src/db/.
```

---

## Part 5: Agent + Skill Pairing

Agents define WHO does the work. Skills define HOW.

```markdown
## MANDATORY: Skill Check Before Every Task
Before writing any code, check if a skill matches this task.
If a skill exists, read its SKILL.md and follow its workflow.
Do not skip this step regardless of task urgency.
```

Agent reads memory before starting:
1. Read .claude/memory/patterns.md for conventions
2. Read .claude/memory/antipatterns.md for known mistakes
3. Check if a relevant skill exists for this task type

---

## Part 6: Special Agent Patterns

### Read-Only Reviewer
```yaml
model: opus
permissionMode: planMode
```
Read, Grep, Glob only. Reports findings with file:line. Never modifies code.
Spec-first: check requirements before style.

### Experiment Agent (isolated)
Runs in git worktree. Changes are disposable. Main branch never touched.

### Pipeline Agent Chain
Each agent in the chain gets fresh context + structured output from previous step.
Context isolation prevents bleed between steps.

---

## Part 7: Framework Collision Detection

If project uses agent terminology internally (LangGraph, CrewAI):
- Prefix ALL Claude Code agents with `cc-` (e.g., `cc-backend`)
- Add disclaimer: "This is a Claude Code development agent — NOT a
  LangGraph application agent."

---

## Part 8: Agent Evolution

### After every task, record:
- Succeeded → patterns.md
- Failed → antipatterns.md
- Decided → decisions.md

### Evolution cycle (/evolve):
Session friction → /evolve detects repeated edits → agent Layer 5 updated →
agent produces correct output → pattern promoted to patterns.md.

### Self-Correction (every agent):
```
Attempt 1: Try the primary approach
→ If it fails: re-read the error, try one alternative
→ After 2 attempts: STOP and report findings
→ Never guess a third time
```

### Model Assignment:
| Model | Use for |
|-------|---------|
| opus | Architecture, review, orchestration, debate |
| sonnet | Implementation (frontend, backend, testing) |
| haiku | Simple/fast tasks (formatting, lookup) |

---

## Sources
- AZCLAUDE 5-layer structure, Anthropic plugin-dev agent-development skill
- Superpowers: mandatory skill check, TDD enforcement, pressure resistance
- DUCTILE: Pass-k behavioral evaluation, documentation-quality-as-signal
- AceMAD: persona-driven heterogeneity in debate agents
- PeerRank: loop controller owns ELO, peer > self evaluation
- EvoSkill: skill evolution through failure, portable skills
- Vishnyakova CE Pyramid: context isolation, economy, progressive disclosure
- azcomply stress test: 3 agents beat 6, framework collision, context budget
