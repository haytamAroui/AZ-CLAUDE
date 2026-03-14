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
description: >
  [Pushy description — 3+ trigger variants, specific scenarios]
tokens: ~{estimate}
---

## /{skill-name} — Title

[body — ≤ 500 lines]
[reference pointers if needed: "For endpoint template, read references/endpoint-template.ts"]
```

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
| Command | What it encodes |
|---------|----------------|
| `add.md` | How to add a feature (test-first if TDD active) |
| `review.md` | Spec compliance check → code quality check (in that order) |
| `test.md` | How to run tests, interpret output, fix failures |

**Stack-specific commands to generate when stack detected:**
| Stack | Generate |
|-------|---------|
| Next.js / React | `new-page.md`, `new-component.md` |
| Express / FastAPI | `new-endpoint.md` |
| Any DB | `migrate.md` |
| Any deploy config | `deploy.md` |

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
