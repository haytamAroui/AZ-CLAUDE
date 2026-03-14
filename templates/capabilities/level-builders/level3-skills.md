---
name: level3-skills
description: >
  Build Level 3: create project-specific skills and commands.
  Triggers on: "build level 3", "add skill", "create command", "automate workflow".
tokens: ~250
requires: level2-mcp
---

## Level 3: Skills and Commands

Skills are invoked by the user (/command). Each skill is a self-contained instruction set.
Skills are Layer 2 in the progressive disclosure model — loaded only when invoked.

---

### 3-Level Progressive Disclosure

Skills load in layers. Never dump the full body into context prematurely.

| Layer | What loads | When |
|-------|-----------|------|
| 1 — Metadata | Frontmatter description only (~20 words) | Session start — always |
| 2 — Body | Full skill instructions (≤ 500 lines) | When skill is invoked |
| 3 — References | `references/` subdirectory files | Only when body explicitly links to them |

**The `references/` subdir**: complex skills can have a `references/` folder next to the skill file containing large lookup tables, code templates, or spec extracts. The skill body links to these — they never auto-load.

```
.claude/commands/
  add-endpoint.md          ← Layer 2 body
  references/
    endpoint-template.ts   ← Layer 3 (only loads if body says "read references/endpoint-template.ts")
```

---

### The Pushy Description Rule

**Claude undertriggers skills.** The description is the only thing read at Layer 1 — it must aggressively list every scenario that should activate the skill.

**Bad description (undertriggers):**
```yaml
description: >
  Add a new React component to the project.
```
This only fires when the user says "add a React component". Misses: "new page", "new screen", "build a form", "create a UI for X".

**Good description (pushes back):**
```yaml
description: >
  Add a new React component, page, screen, or UI element.
  Triggers on: "new component", "new page", "new screen", "build a form",
  "create a UI", "add a view", "make a <anything> component".
  Use this whenever a new .tsx file needs to be created with project conventions.
```

Rule: **List 10+ trigger scenarios. Overtriggering is better than undertriggering.**

---

### RECIPE vs REFERENCE — The Fundamental Distinction

**CLAUDE.md = what exists (REFERENCE)**
**Skills = how to do things (RECIPE)**

| If the sentence starts with… | It belongs in… |
|------------------------------|----------------|
| "The project has…" / "This repo uses…" | CLAUDE.md (REFERENCE) |
| "To add a…" / "When creating a…" / "Run these steps to…" | Skill file (RECIPE) |

**Test before writing**: Ask "Is this describing the state of the project, or the steps to accomplish something?" State → CLAUDE.md. Steps → Skill.

Mixing them creates skills that read like documentation and documents that read like instructions — both become useless.

---

### Anatomy of a Skill File

Every skill file requires:
```yaml
---
name: {skill-name}
description: [One clear sentence — what it does and when]
argument-hint: "[what arguments it expects]"      # shows in autocomplete
disable-model-invocation: true                    # omit for auto-triggered skills
allowed-tools: Read, Grep, Bash                   # scoped permissions for this skill
---

## /{skill-name} — Title

$ARGUMENTS

[body — ≤ 500 lines]
[reference pointers if needed: "For endpoint template, read references/endpoint-template.ts"]
```

**All frontmatter fields:**

| Field | Required | Use when |
|-------|----------|----------|
| `name` | No | Defaults to filename. Set to override. |
| `description` | Yes | One sentence — what it does. Claude uses this for auto-triggering. |
| `argument-hint` | Recommended | Skill takes arguments — shows in `/` autocomplete. |
| `disable-model-invocation: true` | For manual commands | Prevents auto-triggering. Use for destructive or session-ending commands. |
| `allowed-tools` | Recommended | Scope permissions. Read-only skills: `Read, Grep`. Build skills: `Read, Write, Edit, Bash`. |
| `context: fork` | For heavy commands | Runs in isolated subagent. Use for long autonomous tasks (/evolve, /dream). |
| `user-invocable: false` | For background knowledge | Hides from `/` menu. Use for internal reference-only skills. |

**Dynamic injection** — inject real data before Claude reads the skill:
```markdown
## Current state
!`git log --oneline -5`
!`bash .claude/scripts/env-scan.sh 2>/dev/null`
```
The `!`command`` syntax runs the shell command immediately. Claude only sees the output — not the command. Use for `/status`, `/setup`, any skill that needs live project data.

**`ultrathink`** — include this word anywhere in the skill body to enable extended thinking for that skill.

**Body must include** (for RECIPE skills):
- Step-by-step instructions with exact commands
- Code templates (inline if short, reference link if long)
- Decision trees (if X then Y else Z)
- Anti-patterns with explicit "do NOT" labels
- Completion rule: what the user sees as proof of completion

---

### What Makes a Good Skill

1. **Single responsibility** — one skill does one thing
2. **Self-contained** — reads what it needs explicitly, doesn't assume other files are loaded
3. **Thin router or direct executor**:
   - Thin router: "load capabilities/X.md and run it" (evolve.md, debate.md)
   - Direct executor: contains the full instruction (fix.md, persist.md)
4. **Pushy description** — 3+ trigger variants listed
5. **Completion Rule enforced** — every skill ends with a concrete output requirement
6. **Self-correction wired in** — see CE 2.0 Self-Correction below

---

### CE 2.0 Self-Correction — Three Layers

Written instructions alone drift. These three layers make self-correction structural:

**Layer 1 — Bash exit-code gate (automatic, no judgment required)**
```bash
{command}; EXIT=$?
if [ $EXIT -ne 0 ]; then echo "FAILED — do not proceed"; fi
```
Use in any skill that runs a command and must not proceed on failure.
The gate catches the failure mechanically — Claude cannot "feel" that it passed.

**Layer 2 — Structured checkpoint (forced self-assessment before proceeding)**
```
Root cause: [file:line]
Mechanism:  [why it breaks]
Fix:        [what will change]
Confidence: [high / medium / low]
```
Placed at Phase 3 of diagnostic skills. If confidence = low → skill loops back.
Forces Claude to commit to a hypothesis before writing code.

**Layer 3 — Structured escalation after 2 attempts (not prose)**
```
Attempt 1: [file:line — what was changed]
Result 1:  [exact error output]

Attempt 2: [file:line — what was changed]
Result 2:  [exact error output]

Stuck at:  [file:line]
Need:      [specific info or decision that would unblock this]
```
After 2 failed attempts, report this format — not "I'm sorry, I couldn't fix it."
Structured output lets the user unblock the agent in one reply.

**When to apply each layer:**
| Layer | Apply when |
|-------|-----------|
| Exit-code gate | Any skill that runs bash and must not proceed on failure |
| Structured checkpoint | Diagnostic skills (fix, debug, investigate) |
| Structured escalation | Any skill with a retry loop |

---

### Command Design — Encode Decisions, Not Delegation

**Test**: If deleting the command and telling the agent directly gives the same result → the command adds no value. Rewrite it.

**Bad command (thin delegator):**
```
## /add-feature
Tell the user to plan the feature, write tests, implement it, and open a PR.
```
This delegates work back to Claude with no constraints. Claude will ask clarifying questions instead of acting.

**Good command (encodes the decision tree):**
```
## /add-feature
1. Read CLAUDE.md → identify domain and stack
2. If domain = developer → check tdd.md Iron Law first (tests before code)
3. Identify affected modules from $ARGUMENTS
4. Check co-change history: git log --follow -p -- {module} | grep "^+++ b/"
5. Write failing test → implement → green → commit
6. Output: test count before/after, files changed, ready for /ship
```

**Standard commands to always generate for developer projects:**

These three are installed by `npx azclaude` into `.claude/commands/` automatically.

Check they exist — if not, the install is incomplete:
```bash
ls .claude/commands/add.md .claude/commands/review.md .claude/commands/test.md 2>/dev/null \
  || echo "Missing — re-run: npx azclaude"
```

If this project is a **Code** category (has package.json / Cargo.toml / etc.) — all three must be present. No exceptions.

| Command | What it encodes |
|---------|----------------|
| `add.md` | Feature addition: scope intake → understand pattern → TDD → implement → verify |
| `review.md` | Spec compliance first → code quality second — uses EnterPlanMode |
| `test.md` | IDE diagnostics → run suite → interpret failures → apply /fix |

**Stack-specific commands to generate when stack detected:**
| Stack | Generate |
|-------|---------|
| Next.js / React | `new-page.md`, `new-component.md` |
| Express / FastAPI | `new-endpoint.md` |
| Any DB | `migrate.md` |
| Any deploy config | `deploy.md` |

---

### Native Tools in Skills

Before writing any new skill: load `capabilities/shared/native-tools.md`.
Every skill that collects user input, tracks progress, or runs commands must use the appropriate native tool — not simulate it with prose.

Quick check before writing:
- Does this skill ask questions? → `AskUserQuestion`
- Does this skill have multiple steps? → `TaskCreate/TaskUpdate`
- Does this skill do analysis before action? → `EnterPlanMode/ExitPlanMode`
- Does this skill run risky changes? → `EnterWorktree`
- Does this skill run a command and check result? → exit-code gate

---

### Check shared-skills First
Before creating a new skill:
```bash
ls ~/shared-skills/ 2>/dev/null
```

If a matching skill exists and its tech stack matches this project → import it:
```bash
cp ~/shared-skills/{skill}.md .claude/commands/{skill}.md
```
Log which portable skills were imported and from which project.

---

### Skill Placement
- `.claude/commands/{skill}.md` — project-specific skills
- `~/shared-skills/{skill}.md` — general skills that work across projects (after k=10 gate)

---

### Level 3 Complete When
- At least 3 project-specific skills exist
- Each has a pushy description (3+ trigger variants)
- Each passes RECIPE vs REFERENCE test
- Body ≤ 500 lines (overflow goes to references/ subdir)
- shared-skills checked and relevant ones imported
