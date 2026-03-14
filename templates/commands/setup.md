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

## Step 5: Quality Gate

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
