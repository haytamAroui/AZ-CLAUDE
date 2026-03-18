# How To Craft The Best Agent — AZCLAUDE Agent Engineering Guide

Based on: AZCLAUDE's 5-layer structure, Anthropic's plugin-dev agent-development skill, Superpowers' subagent patterns, DUCTILE aerospace paper, AceMAD debate research, PeerRank evaluation study, EvoSkill evolution loop, Vishnyakova Context Engineering Pyramid, and stress-testing on azcomply-flow (200-file project).

---

## The Rule

An agent is not a persona. An agent is an OWNERSHIP BOUNDARY. If two agents can do the same task, one of them shouldn't exist. If one agent owns files it never touches, its scope is wrong. Agents exist to give Claude specialized context for specific work — not to roleplay different characters.

---

## Part 1: Before You Write — Agent Discovery From Evidence

Don't guess how many agents you need. Let the project tell you.

### Method 1: Git Co-Change Analysis (best, requires history)

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -30
```

Files that always change together → same agent. `auth.js` and `auth.test.js` commit together in 80% of commits → one agent owns both.

```bash
# Find co-changing clusters
git log --name-only --format="" | awk '/^$/{if(f)print f; f=""; next}{f=f?f" "$0:$0}' | \
  tr ' ' '\n' | sort | uniq -c | sort -rn
```

### Method 2: Directory Structure (fallback, no git history)

```
src/
├── auth/          → auth-agent
├── api/           → api-agent  
├── frontend/      → frontend-agent
└── tests/         → owned by respective agents, not a separate test-agent
```

### Method 3: Service Boundaries (multi-service projects)

```
Each deployable service = one agent
  frontend/        → frontend-agent
  backend/         → backend-agent
  workers/         → workers-agent
```

### The Constraint: 3-5 agents for most projects

From the azcomply stress test: 3 agents with clear boundaries beat 6 agents with overlap. Every agent added increases coordination overhead. The loop controller has to reason about more delegation targets. Context cost grows linearly.

```
Project size        Recommended agents
< 20 files          1-2 (or none — CLAUDE.md is enough)
20-100 files        2-3
100-500 files       3-5
500+ files          4-6 with SKIM mode
```

---

## Part 2: The 5-Layer Structure — Every Agent, Every Time

Missing a layer = incomplete agent. Each layer serves a different function.

```yaml
---
name: agent-name
description: >
  [PUSHY trigger description — same formula as skills.
  List every action, file type, directory, concept, and keyword 
  that should route work to this agent. End with: "even if not 
  explicitly asked, route to this agent when the task involves X."]
model: sonnet
permissionMode: acceptEdits
---

# Layer 1 — PERSONA (5%)
[Role identity. One sentence. Sets tone, not capability.]

# Layer 2 — SCOPE (25%)  
[What this agent OWNS. Directories, files, modules. 
What it does NOT touch. Hard boundaries.]

# Layer 3 — TOOLS (10%)
[Which tools this agent can use. Restrictions matter more than grants.]

# Layer 4 — CONSTRAINTS (25%)
[Non-negotiable rules. What must always happen. What must never happen.
Written as positive directives.]

# Layer 5 — DOMAIN (35%)
[Technical knowledge specific to THIS project. Frameworks, patterns,
conventions, architecture decisions. This is where the real value lives.]
```

### Why Layer 5 Matters More Than Layer 1

From AZCLAUDE's production experience:

```
Layer 1 (Persona): "You are a backend specialist"
  → Changes tone. Claude says "As a backend specialist..."
  → Doesn't change what Claude actually DOES

Layer 5 (Domain): "This project uses FastAPI with Pydantic v2. 
  All routes use dependency injection via Depends(). 
  Error responses follow RFC 7807 format. 
  Database access goes through repositories in src/db/repos/."
  → Changes what Claude PRODUCES
  → Code matches your actual architecture
```

Persona drives tone. Domain drives correctness. When in doubt, cut persona and expand domain.

---

## Part 3: Each Layer In Detail

### Layer 1 — PERSONA (keep it minimal)

```markdown
You are the backend specialist for this project. You write production-quality 
API code with tests.
```

That's enough. Don't write a paragraph about the agent's personality, communication style, or philosophical approach. One sentence. Move on.

**Anti-pattern:** "You are a meticulous, detail-oriented senior engineer who takes pride in clean, elegant code and always considers edge cases with a thoughtful, systematic approach..." — this is wasted tokens that don't change behavior.

### Layer 2 — SCOPE (the ownership boundary)

```markdown
## Scope
OWNS: src/api/, src/middleware/, src/db/, tests/api/
DOES NOT TOUCH: src/frontend/, src/workers/, infrastructure/

Files in scope:
- Route definitions: src/api/routes/*.py
- Middleware stack: src/middleware/*.py  
- Database repos: src/db/repos/*.py
- API tests: tests/api/*.py

When to invoke this agent:
- Any task involving API endpoints, middleware, or database queries
- Bug fixes in src/api/ or src/middleware/
- New feature requiring backend changes
```

**The critical rule:** SCOPE must list what the agent does NOT touch. Without negative scope, agents drift into each other's territory. Two agents editing the same file = merge conflicts and contradictory changes.

### Layer 3 — TOOLS (restrictions matter more)

```yaml
# In frontmatter:
tools: Read, Write, Edit, Bash, Grep, Glob
```

```markdown
## Tools
- Read, Write, Edit: for all files in scope
- Bash: for running tests and scripts only
- Grep, Glob: for searching codebase

RESTRICTIONS:
- Do NOT use Bash for installing packages (ask the user)
- Do NOT use Write on files outside scope directories
```

**Special permission modes for review agents:**

```yaml
# Review agent — read only
permissionMode: planMode  # or use EnterPlanMode
```

```markdown
## Tools
- Read, Grep, Glob: for analysis
- NO Write, Edit, Bash: this agent observes and reports only
```

From AZCLAUDE's code-reviewer: read-only enforcement is a hard constraint, not a suggestion. The agent literally cannot modify code.

### Layer 4 — CONSTRAINTS (the behavioral immune system)

```markdown
## Constraints

### Always
- Write the failing test BEFORE implementation code
- Run existing tests after every change: `pytest tests/api/ -x`
- Include error handling for every external call
- Log structured JSON, never print() or console.log()
- Reference the specific requirement being implemented

### Never
- Never commit with failing tests
- Never hardcode credentials, tokens, or connection strings  
- Never modify files outside scope directories
- Never skip input validation on user-facing endpoints
- Never say "should work" — show the passing test
```

**Writing rules from research:**

1. **Positive directives beat negative ones.** "Always validate inputs" works better than "Don't skip validation." (From Superpowers: negative instructions activate the behavior they're trying to prevent.)

2. **Specific beats general.** "Run `pytest tests/api/ -x` after every change" is better than "make sure tests pass." Claude follows specific instructions more reliably.

3. **5-10 constraints max.** More than 10 and Claude starts dropping the less prominent ones. Prioritize the constraints that prevent the most damage.

4. **Pressure resistance.** From AZCLAUDE's behavioral defenses: constraints must hold under pressure. "Deadline's today — skip the tests" → the constraint says "Never commit with failing tests." If the constraint can be argued away, it's not a constraint — it's a suggestion.

### Layer 5 — DOMAIN (where the real value lives)

```markdown
## Domain Knowledge

### Architecture
This is a FastAPI application with:
- Pydantic v2 for all request/response models (not v1 — no .dict(), use .model_dump())
- SQLAlchemy 2.0 async (not sync — always use async session)
- Alembic for migrations (never modify tables directly)
- Redis for caching (connection pool in src/core/redis.py)

### Conventions
- Route files: one router per domain (auth_router, users_router, billing_router)
- All routes use Depends() for authentication and database session
- Error responses: RFC 7807 format via src/core/errors.py
- Pagination: cursor-based, not offset-based (see src/core/pagination.py)

### Patterns (from patterns.md)
- Repository pattern for all database access (never raw SQL in routes)
- Service layer between routes and repos for business logic
- Background tasks via FastAPI BackgroundTasks, not Celery

### Antipatterns (from antipatterns.md)
- DO NOT use synchronous database calls (caused 3x latency regression in Sprint 4)
- DO NOT return full ORM objects from routes (caused circular serialization bug)
- DO NOT cache user-specific data in Redis without TTL (caused stale data in production)

### Key Files
- src/core/deps.py: All dependency injection definitions
- src/core/errors.py: Error handling middleware  
- src/db/base.py: SQLAlchemy base and session factory
- alembic/env.py: Migration configuration
```

**Where domain knowledge comes from:**

```
Source                      → Layer 5 content
Git history                 → "these files always change together"
patterns.md                 → "these patterns work in this project"
antipatterns.md             → "these caused bugs — never repeat"
decisions.md                → "we chose X over Y because Z"
CLAUDE.md                   → project-wide conventions
Stack detection (package.json, requirements.txt) → framework-specific rules
```

**The EvoSkill insight:** Domain knowledge evolves. After /evolve reads session friction, new patterns get added to the agent's Layer 5. The agent that starts with generic FastAPI knowledge accumulates project-specific knowledge over sessions.

---

## Part 4: The Description — Agent Routing Lives Or Dies Here

Same formula as skills. The description determines when Claude delegates to this agent.

### Bad description:
```yaml
description: Handles backend API development
```

### Good description:
```yaml
description: >
  Backend API specialist. Route to this agent for: API endpoints, 
  routes, middleware, request validation, response formatting, 
  database queries, repository pattern, migrations, Alembic, 
  SQLAlchemy, Pydantic models, authentication, authorization, 
  JWT, OAuth, session management, rate limiting, caching, Redis, 
  background tasks, error handling, logging, health checks, 
  OpenAPI schema, FastAPI dependencies, Depends(), testing API 
  routes, pytest, httpx, integration tests. Also handles: 
  performance issues in API layer, N+1 queries, slow endpoints, 
  connection pooling. Even if the user doesn't mention "backend" 
  or "API", route here when the task involves any server-side 
  code in src/api/, src/middleware/, or src/db/.
```

---

## Part 5: Agent + Skill Pairing — How They Work Together

Agents define WHO does the work. Skills define HOW the work is done. The best setup pairs agents with relevant skills.

```
Agent: backend-api
  ├── Reads: patterns.md, antipatterns.md, decisions.md  (memory)
  ├── Uses: security-review skill  (when touching auth/payments)
  ├── Uses: test-first skill       (when writing new features)
  └── Uses: debug skill            (when fixing bugs)

Agent: frontend-ui  
  ├── Reads: patterns.md, antipatterns.md, decisions.md  (memory)
  ├── Uses: frontend-design skill  (when building UI components)
  ├── Uses: test-first skill       (when writing component tests)
  └── Uses: accessibility skill    (when touching user-facing pages)
```

### How to reference skills from agent body:

```markdown
## Before Starting Any Task
1. Read .claude/memory/patterns.md for project conventions
2. Read .claude/memory/antipatterns.md to avoid known mistakes
3. Check if a relevant skill exists for this task type
4. If touching authentication or payments → load security-review skill
5. If writing new feature → load test-first skill
```

### The Superpowers pattern — mandatory skill check:

From Superpowers (42K stars): skills should be mandatory, not optional. The agent doesn't choose whether to check for a relevant skill — it always checks.

```markdown
## MANDATORY: Skill Check Before Every Task
Before writing any code, check if a skill matches this task.
If a skill exists, read its SKILL.md and follow its workflow.
Do not skip this step regardless of task urgency.
```

---

## Part 6: Special Agent Patterns

### The Read-Only Reviewer

```yaml
---
name: code-reviewer
description: >
  Code quality and security review. Route for: review, audit, check, 
  inspect, analyze code quality, find bugs, security review, 
  performance review, compliance check. Reviews against project 
  patterns and conventions. Read-only — never modifies code.
model: opus
permissionMode: planMode
---

# Code Reviewer

## Persona
Senior code reviewer. Identifies issues, never fixes them directly.

## Scope
READS: entire codebase
WRITES: nothing — output is review report only

## Tools
Read, Grep, Glob only. No Write, Edit, or Bash.

## Constraints
- Report findings with file:line references
- Classify: critical / high / medium / low
- Check against patterns.md and antipatterns.md
- Spec-first: check requirements before style
- Never suggest "should work" — cite specific evidence

## Review Checklist
1. Does it match the spec/requirement?
2. Does it follow patterns.md conventions?
3. Does it avoid antipatterns.md mistakes?
4. Are there tests? Do they cover edge cases?
5. Security: credentials, injection, validation?
6. Performance: N+1, unnecessary loops, missing indexes?
```

### The Experiment Agent (isolated)

From AZCLAUDE's security layers: experiment agents run in git worktrees to prevent contaminating the main branch.

```yaml
---
name: experiment-agent
description: >
  Experimental changes in isolation. Route for: experiment, try, 
  prototype, spike, proof of concept, test approach, compare 
  implementations, A/B test, benchmark. Runs in git worktree — 
  never modifies main branch.
model: sonnet
permissionMode: acceptEdits
---

## Scope
Runs in isolated git worktree. Changes are disposable.
Main branch is never touched.

## Workflow
1. Create worktree: git worktree add .worktrees/experiment-{name} -b experiment/{name}
2. Work in the worktree directory
3. Report results
4. User decides: merge or discard
```

### The Pipeline Agent Chain

From AZCLAUDE's intelligence layer: agents in a chain, each with fresh context.

```
/add "implement user authentication"
  │
  ├─ Step 1: planner-agent (fresh context)
  │   → reads requirements, outputs implementation plan
  │   → result: plan.md
  │
  ├─ Step 2: backend-agent (fresh context + plan.md)
  │   → implements API following plan
  │   → result: code + tests
  │
  ├─ Step 3: reviewer-agent (fresh context + code)
  │   → reviews implementation
  │   → result: review report
  │
  └─ Step 4: only proceed if reviewer approves
```

Each agent runs in its own subagent context. Agent 3 never sees Agent 1's 50,000-token conversation. Only the structured output passes between steps. This is the "context isolation" criterion from the Vishnyakova pyramid.

---

## Part 7: Framework Collision Detection

From the azcomply stress test: if your project uses agent terminology internally (LangGraph agents, CrewAI agents), AZCLAUDE's generated agents must not collide.

```
Project has:     lead_agent.py, compliance_agent.py (LangGraph)
AZCLAUDE creates: cc-backend, cc-frontend, cc-reviewer

The cc- prefix = "Claude Code agent"
Never use: backend-agent (confusable with project's own agents)
```

Add a disclaimer in every generated agent when framework collision is detected:

```markdown
## Important
This is a Claude Code development agent — NOT a LangGraph application agent.
This agent helps you WRITE code for the LangGraph agents in src/agents/.
It does not run as part of the application.
```

---

## Part 8: Agent Evolution — Agents Learn From Their History

### After every task, the system records:

```
Succeeded → patterns.md    ("this approach worked")
Failed    → antipatterns.md ("this caused a bug")  
Decided   → decisions.md    ("chose X over Y because Z")
```

### Next run, the agent reads all three:

```markdown
## Before Starting Any Task
1. Read .claude/memory/MEMORY.md for project context
2. Read .claude/memory/patterns.md for what works
3. Read .claude/memory/antipatterns.md for what broke before
```

### Evolution cycle (/evolve):

```
Session 1:  Agent writes code → user edits error handling
Session 2:  /evolve detects: "error handling edited in 4/5 outputs"
Session 3:  Agent's Layer 5 updated: "Always use try/catch with 
            specific error types, not generic catch(e)"
Session 4:  Agent writes correct error handling → user accepts
Session 5:  /evolve detects: "error handling accepted 5/5"
            → pattern promoted to patterns.md
```

From OpenClaw-RL's insight: the user's next action after seeing agent output is the most honest feedback. Accepted = positive signal. Edited = partial signal. Reverted = negative signal. /evolve reads git diffs to detect these signals.

### ELO for agents:

```
Loop controller owns authoritative ELO (PeerRank: peer > self)
Binary comparative framing (Elo-Evolve: 4.5x less noise)
Self-updates during tasks are provisional only

Agents with declining ELO → prompt optimization triggered
Agents with consistently high ELO → patterns promoted to memory
```

---

## Part 9: Quality Checklist — Before Shipping Any Agent

```
□ Description has 30+ trigger keywords (pushy routing)
□ Description ends with "even if not explicitly mentioned"
□ All 5 layers present (persona, scope, tools, constraints, domain)
□ Layer 5 (domain) is the largest section
□ Scope has explicit DOES NOT TOUCH boundaries
□ Constraints are positive directives, not negative
□ Constraints hold under pressure ("skip tests" → refuses)
□ Tools section lists restrictions, not just grants
□ Agent reads memory (patterns, antipatterns, decisions) before starting
□ Agent references relevant skills for task-specific workflows
□ No naming collision with project's internal agents
□ Model assignment matches complexity (Opus for review, Sonnet for implementation)
□ Permission mode matches role (planMode for reviewers, acceptEdits for builders)
```

---

## Part 10: Agent + Skill Combined — The Complete Setup

For a FastAPI + Next.js project:

```
.claude/
├── agents/
│   ├── cc-backend.md        ← owns src/api/, src/db/, tests/api/
│   ├── cc-frontend.md       ← owns src/frontend/, tests/frontend/
│   ├── cc-reviewer.md       ← read-only, reviews everything
│   └── cc-test-writer.md    ← writes tests, Sonnet for speed
│
├── skills/
│   ├── security-review/
│   │   ├── SKILL.md          ← triggers on auth, payments, credentials
│   │   └── scripts/scan-secrets.sh
│   ├── test-first/
│   │   ├── SKILL.md          ← triggers on new feature, implementation
│   │   └── scripts/detect-framework.sh
│   ├── debug/
│   │   ├── SKILL.md          ← triggers on bug, error, fix, broken
│   │   └── references/four-phase-protocol.md
│   ├── setup/
│   │   ├── SKILL.md          ← triggers on /setup, new project, init
│   │   └── scripts/env-scan.sh
│   └── debate/
│       ├── SKILL.md          ← triggers on decide, compare, trade-off
│       ├── references/acemad-protocol.md
│       └── scripts/record-decision.sh
│
├── memory/
│   ├── goals.md              ← auto-tracked by PostToolUse hook
│   ├── checkpoints/          ← manual snapshots of reasoning
│   ├── sessions/             ← end-of-session narratives
│   ├── patterns.md           ← what works (evolved over time)
│   ├── antipatterns.md       ← what broke (never repeat)
│   └── decisions.md          ← architectural choices with rationale
│
└── hooks/
    ├── user-prompt.js        ← injects goals + checkpoint before every session
    ├── post-tool-use.js      ← tracks every edit to goals.md
    └── stop.js               ← migrates In progress → Done
```

**The flow:**
1. User types a task
2. UserPromptSubmit injects memory (goals + checkpoint)
3. Claude reads CLAUDE.md routing table → delegates to the right agent
4. Agent reads patterns.md, antipatterns.md before starting
5. Agent checks for relevant skills → loads if matched
6. Agent works following constraints and domain knowledge
7. PostToolUse tracks every edit to goals.md
8. Results feed back into memory for future sessions
9. /evolve reads sessions, detects gaps, improves agents and skills

**Memory feeds agents. Agents use skills. Skills produce work. Work feeds memory. The system improves itself.**

---

## Sources

- AZCLAUDE 5-layer structure: persona, scope, tools, constraints, domain
- Anthropic plugin-dev agent-development skill: description triggers, AI-assisted generation
- Superpowers: mandatory skill check, TDD enforcement, pressure resistance
- DUCTILE paper: Pass-k behavioral evaluation, documentation-quality-as-signal
- AceMAD paper: persona-driven heterogeneity in debate agents
- PeerRank paper: loop controller owns ELO, peer > self evaluation
- EvoSkill paper: skill evolution through failure, portable skills
- Elo-Evolve paper: binary comparative ELO, 4.5x noise reduction
- Vishnyakova CE Pyramid: context isolation, economy, progressive disclosure
- azcomply stress test: 3 agents beat 6, framework collision, context budget
- OpenClaw-RL: next-state feedback as learning signal
- ui-ux-pro-max: pushy descriptions with 50+ trigger keywords
