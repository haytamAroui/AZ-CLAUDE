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

## Step 5: Generate Project-Specific Skills (MANDATORY — minimum 2)

**Rule**: Never leave a project without project-specific skills. Claude Code works significantly better with skills that encode project conventions. Generate at least 2 skills even on first run with zero git history.

Read `.claude/capabilities/level-builders/level3-skills.md` for the skill design guide.

### How to decide which skills to generate
1. **What file types exist?** → what workflow creates more of them
2. **What domain is this?** → what domain-specific knowledge should be encoded
3. **What stack?** → which stack-specific defaults apply
4. Check git log for repeated commit patterns (if any history exists)

### Minimum: 2 project-specific skills
Every project gets at least:
1. A **creation skill** — how to add the main type of content/code in this project
2. A **validation skill** — how to check that content/code follows project conventions

### Stack-specific defaults (generate if stack detected):
| Stack | Generate |
|-------|---------|
| Next.js / React | `new-page.md`, `new-component.md` |
| Express / FastAPI | `new-endpoint.md`, `validate-api.md` |
| Any DB | `migrate.md` |
| Any deploy config | `deploy.md` |
| Markdown content | `new-content.md`, `validate-content.md` |
| Exam / quiz | `new-exam.md`, `validate-exam.md` |
| CLI tool | `new-command.md`, `validate-cli.md` |
| Library/SDK | `new-module.md`, `validate-api-surface.md` |

For each skill:
- Create `.claude/commands/{skill-name}.md` with pushy description (10+ trigger variants)
- Follow RECIPE pattern (steps to do something, not documentation)
- Include project-specific conventions (file paths, naming, patterns from existing code)
- Include completion rule
- ≤ 500 lines (references/ subdir for overflow)

**TaskUpdate → completed** for Create skills.

---

## Step 6: Generate Project-Specific Agents (if project has 10+ files)

Read `.claude/capabilities/level-builders/level5-agents.md` for agent design guide.

1. Run co-change analysis: `git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -30`
2. Identify file clusters that change independently → each cluster = potential agent
3. Create 1-3 agents in `.claude/agents/cc-{name}.md` with all 5 layers
4. Prefix all agents with `cc-` to avoid framework collisions

Skip if project has < 10 files or < 5 commits.

### Problem-Architect Supplement (new projects with zero git history)

If the project has < 5 commits (no co-change data), check:
```bash
ls .claude/agents/problem-architect.md 2>/dev/null
```

If problem-architect.md exists — spawn it to analyze the project structure directly:
```
Analyze this project to recommend agents and skills.
No git history available — use file structure and stack signals instead.
Project stack: {from env-scan.sh output}
Files found: {top-level structure}
Domain: {from CLAUDE.md}
Available agents already installed: {list .claude/agents/}
Return: recommended cc- agents (with directory claims) + skills to generate
```

Use the returned recommendations as the basis for agent/skill generation.
This fills the gap when git history is too thin for co-change analysis.

---

## Step 6b: Auto-Discover Knowledge Sources

```bash
ls docs/*.md docs/**/*.md ARCHITECTURE.md specs/*.md *.pdf 2>/dev/null | head -20
ls knowledge/ .claude/knowledge/ 2>/dev/null | head -5
```

If foundational docs exist AND no knowledge directory:
```
Foundational documents detected:
{list of files}

Run /ingest scan to process these into a structured knowledge base.
The knowledge layer lets agents reference domain expertise instead of re-reading docs every session.
```

If `.claude/knowledge/index.md` already exists: skip — knowledge layer already initialized.

---

## Step 7: Quality Gate

Load `capabilities/shared/quality-check.md` and run the full environment check.

Verify all capability file references in commands and agents resolve to existing files:
- Grep all `.claude/commands/*.md` and `.claude/agents/*.md` for `capabilities/` references
- Check each referenced path exists under `.claude/`
- Warn on any missing references — stale refs cause silent load failures

**TaskUpdate → completed** for Run quality check.

All ✓ required before printing "Setup complete."

---

## Step 8: Governance + Spec Readiness

After quality gate passes, check governance state:

```bash
# Constitution check
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "constitution=missing"

# Spec directory check
ls .claude/specs/*.md 2>/dev/null | head -3
```

Output a next-steps block:

```
─── Recommended Next Steps ──────────────────────────────
```

If constitution missing:
```
  ⚠ No project constitution found.
    Run: /constitute
    Why: defines non-negotiables, required patterns, definition of done.
    Copilot checks this before every milestone implementation.
```

If no coding rules found:
```bash
[ -f .claude/code-rules.md ] && echo "code-rules=found" || echo "code-rules=missing"
```
```
  · No coding rules contract found.
    Run: /driven
    Why: generates .claude/code-rules.md — your project's coding standards.
    Every /add, /fix, /refactor, /audit, /test, /doc, /blueprint reads this before writing code.
```

If no specs found:
```
  · No feature specs found.
    Run: /spec [feature name]
    Why: structured spec → /blueprint derives a better plan → /copilot builds the right thing.
    Spec-first workflow: /spec → /clarify → /blueprint → /copilot
```

If all three exist:
```
  ✓ Constitution, coding rules, and specs found. Ready for /copilot.
```

Always append MCP check (regardless of other states):
```bash
claude mcp list 2>/dev/null | grep -c "." || echo "0"
```

```
  · MCP servers configured: {N}
    Run: /mcp
    Why: Context7 fixes stale API docs in /add and /copilot.
         Sequential Thinking improves /blueprint and /copilot planning.
         Both are free — no API key needed.
```

If N ≥ 1, show instead:
```
  · {N} MCP server(s) active. Run /mcp to check stack-specific recommendations.
```

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
