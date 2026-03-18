---
name: setup
description: Analyze the project, fill CLAUDE.md, create memory structure. Run once at project start or to fill unfilled placeholders.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# /setup — Project Environment Setup

Current environment:
!`bash .claude/scripts/env-scan.sh 2>/dev/null || echo '{"note": "run npx azclaude first to install scripts"}'`

---

## Step 1: Scan

Check for project signals:
```bash
ls package.json pyproject.toml Cargo.toml go.mod 2>/dev/null
find . -name "*.ts" -o -name "*.py" -o -name "*.rs" | head -5 2>/dev/null
ls knowledge/ docs/ 2>/dev/null
```

Read existing CLAUDE.md if present — note which fields are unfilled placeholders.

---

## Step 2: Clarify (if domain is ambiguous)

If the scan cannot determine domain clearly (e.g. mixed signals, no code files, empty project):
Use **AskUserQuestion** to collect:
- **Domain**: developer / writer / researcher / compliance / data-ML / other
- **Primary language / stack** (if developer)
- **Team size**: solo / small team / org
- **What's the main goal of this project?**

Skip this step if the scan already answers these clearly.

---

## Step 3: Track Setup Progress

**TaskCreate** for each step before starting:
- `Scan project` (mark completed after Step 1)
- `Fill CLAUDE.md`
- `Create memory structure`
- `Create skills`
- `Run quality check`

**TaskUpdate → in_progress** as each step begins.

---

## Step 4: Spawn Initialization Specialist

Spawn `agents/orchestrator-init.md` as a subagent with:
- Current working directory
- Domain and stack (from scan or AskUserQuestion answers)
- Project scale (file count)
- Existing CLAUDE.md content (to avoid overwriting intentional config)

The orchestrator-init agent:
- Detects scale, domain, and signals
- Fills CLAUDE.md
- Creates `.claude/memory/goals.md`
- Creates `knowledge-index.md` if `knowledge/` directory exists
- Runs environment scan as a single script (not 15 separate calls)

**TaskUpdate → completed** for Fill CLAUDE.md and Create memory structure steps.

---

## Step 5: Generate Project-Specific Skills

Read `.claude/capabilities/level-builders/level3-skills.md` for the skill design guide.

Analyze the project's domain, stack, and recurring workflows:
1. Check what file types and patterns exist (endpoints, pages, components, schemas, tests)
2. Check git log for repeated commit patterns (what work is done most often)
3. Identify 2-4 project-specific skills that would encode the most common workflows

For each skill:
- Create `.claude/commands/{skill-name}.md` with pushy description (3+ trigger variants)
- Follow RECIPE pattern (steps to do something, not documentation)
- Include completion rule
- ≤ 500 lines (references/ subdir for overflow)

**Stack-specific defaults** (generate if stack detected):
| Stack | Generate |
|-------|---------|
| Next.js / React | `new-page.md`, `new-component.md` |
| Express / FastAPI | `new-endpoint.md` |
| Any DB | `migrate.md` |
| Any deploy config | `deploy.md` |
| Markdown content | `new-content.md`, `validate-content.md` |
| Exam / quiz | `new-exam.md`, `validate-exam.md` |

**TaskUpdate → completed** for Create skills.

---

## Step 6: Generate Project-Specific Agents (if project has 10+ files)

Read `.claude/capabilities/level-builders/level5-agents.md` for agent design guide.

1. Run co-change analysis: `git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -30`
2. Identify file clusters that change independently → each cluster = potential agent
3. Create 1-3 agents in `.claude/agents/cc-{name}.md` with all 5 layers
4. Prefix all agents with `cc-` to avoid framework collisions

Skip if project has < 10 files or < 5 commits.

---

## Step 7: Quality Gate

Load `capabilities/shared/quality-check.md` and run the full environment check.

**TaskUpdate → completed** for Run quality check.

All ✓ required before printing "Setup complete."

---

## If Running Again on an Existing Project

Do not overwrite CLAUDE.md — read it first and update only the placeholders that are still unfilled.
Do not overwrite goals.md — read it and preserve existing threads.

---

## Completion Rule

Show:
1. Filled CLAUDE.md (full content)
2. Created goals.md (full content)
3. All TaskUpdate items marked completed

Do not say "setup complete" without showing these outputs.
