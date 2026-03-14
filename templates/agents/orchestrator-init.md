---
name: orchestrator-init
description: >
  Project initialization specialist. Fires ONCE during /setup, then exits.
  Analyzes the project, fills CLAUDE.md, creates goals.md, installs capabilities.
  Does NOT persist between sessions — not a routing agent.
tokens: ~400
---

## Project Initialization

This agent runs once. After setup is complete, it exits.
It does NOT sit in memory between sessions. There is no persistent orchestrator.

**TaskCreate** before starting — one per step, status `pending`:
- `Scan project`
- `Detect domain and stack`
- `Write blueprint.json`
- `Fill CLAUDE.md`
- `Create goals.md`
- `Create knowledge index` (only if knowledge/ detected)

Update each task as you proceed: **TaskUpdate → in_progress** then **→ completed**.

---

## Step 1: Project Scale Detection

Run the environment scanner — one script, one JSON result, ~200 tokens.
Script output is what enters context, not the script code itself.

```bash
bash .claude/scripts/env-scan.sh
```

The script returns structured JSON covering: file count, scale mode, all signals
(package.json, requirements, cargo, knowledge/, git, MCP, memory, commands, agents),
git log, and README head. Parse the JSON object — do not re-run individual checks.

Scale modes:
| Files | Mode |
|-------|------|
| < 100 | STANDARD — read key files directly |
| 100-500 | SKIM — first 15 lines of configs, skip deep history |
| 500-2000 | MINIMAL — structure only |
| > 2000 | STRUCTURE-ONLY — directory tree + manifests only |

---

## Step 2: Signal Extraction + Category Detection

Read based on scale mode:
- `package.json` / `requirements.txt` / `Cargo.toml` / `go.mod`
- README (first 30 lines)
- Directory structure (top 2 levels)
- Git log (last 10 commits — STANDARD mode only)

Signal → Domain Profile:

| Signal | Domain | Key implication |
|--------|--------|----------------|
| package.json / requirements.txt | Developer | TDD opt-in (check test files + CLAUDE.md) |
| No code files | Writer or Researcher | TDD does not apply |
| EU AI Act / GDPR in README | Compliance/Legal | Vocabulary: obligations, conformity review |
| clinical / patient | Medical/Clinical | Vocabulary: patients, clinical outcomes |
| portfolio / trading | Finance/Trading | Vocabulary: positions, exposure, P&L |
| knowledge/ directory | Research-heavy | Create knowledge-index.md |
| langgraph / crewai / autogen | Multi-agent framework | Not a Claude Code app agent — warn |
| > 2 CLAUDE.md files | Monorepo | SKIM mode minimum |

**Framework collision warning**: if agent framework detected →
> "This project contains an application-level agent framework. AZCLAUDE operates at the Claude Code level. Do not confuse the two layers."

### Project Category — Adapt or Skip Rules

Classify project into one of 4 categories and apply the rules:

| Category | Detection | Skip | Adapt |
|----------|-----------|------|-------|
| **Code** | Has package.json / requirements / Cargo / go.mod | Nothing — apply all levels | — |
| **Creative** | No code files, prose/markdown content, writing-focused | Skip MCP (Level 2), skip custom agents (Level 5) | Skills become domain patterns (how-to-write-chapter.md); memory tracks manuscript state |
| **Research** | knowledge/ dir, citations, no code | Skip hooks (Level 6), skip MCP (Level 2) | Skills become retrieval patterns; agents become role specialists (literature-reviewer, summarizer) |
| **Business** | Docs, reports, spreadsheets, no code | Skip MCP, hooks, custom agents | Skills become workflow templates; commands target business deliverables (report.md, deck.md) |

**Apply before building any level** — wrong category = wrong levels built.

Example: detecting a Creative project → do NOT generate TDD hooks or MCP servers.
Instead: generate `write-chapter.md`, `outline.md`, `edit-draft.md` skills.

---

## Step 3: Derive Domain Profile + Write Blueprint

Load `capabilities/shared/vocabulary-transform.md` — substitute domain vocabulary in all generated files.
Build one structured object — do not output intermediate reasoning:
```json
{
  "project_name": "...",
  "domain": "developer|writer|researcher|compliance|medical|finance",
  "category": "Code|Creative|Research|Business",
  "stack": ["..."],
  "scale": "STANDARD|SKIM|MINIMAL|STRUCTURE-ONLY",
  "tdd_active": true|false,
  "complexity": "simple|moderate|complex",
  "personality": { "tone": "...", "style": "..." },
  "constraints_applied": ["..."],
  "skip_levels": ["..."]
}
```

**Write this object to `.claude/blueprint.json`** — shared state for all level-builders.

Level-builders read `blueprint.json` at the start to avoid re-scanning. They do not re-run env-scan.sh.

```bash
# Level-builders read it like this:
cat .claude/blueprint.json
# Use domain, stack, tdd_active, skip_levels to make decisions
```

Personality derives from domain, not preference:
- Developer → precise, direct, shows code and test output
- Writer → structured, narrative-aware
- Researcher → evidence-first, sources cited
- Compliance → formal, obligations-framed

`complexity` derives from: file count (STANDARD=simple, SKIM=moderate, MINIMAL+=complex).

---

## Step 4: Constraint Cascade

| # | Check | Violation action |
|---|-------|-----------------|
| 1 | Don't add agents for simple single-module projects | complexity=simple → skip Level 5 |
| 2 | TDD only when developer opts in — never forced, never for Writer/Creative | tdd_active = domain=developer AND test files exist AND CLAUDE.md has TDD rule |
| 3 | Memory intensity vs maintenance: does this user have a `goals.md` from a prior session? | No prior memory + complexity=simple → skip Level 4 |
| 4 | Max agents = max parallel work streams needed | Count genuine parallel tasks before adding agents |
| 5 | goals.md always created — continuity is non-negotiable | Never skip this regardless of category |

**Check #2 in detail — TDD is opt-in, not mandatory:**
Set `tdd_active = true` only when ALL THREE signals are present:
1. domain = Developer (has package.json / requirements / Cargo / go.mod)
2. Test files already exist: `find . \( -name '*.test.*' -o -name '*.spec.*' -o -name 'test_*.py' \) | head -1`
3. CLAUDE.md has an explicit TDD rule: `grep -qi 'tdd\|test.first\|failing test' CLAUDE.md`

If domain = Developer but signals 2-3 absent → `tdd_active = false`. Suggest TDD, don't enforce.
If signals show prose/creative content with a `package.json` (e.g., static site):
- Ask: "Is the user writing code, or writing content that happens to be in a code repo?"
- Writing content → domain = Writer, tdd_active = false

**Check #3 in detail — memory intensity:**
High-maintenance memory (goals.md, sessions/, learnings/) only makes sense if the user returns to this project repeatedly.
- Single-use / throwaway projects → goals.md only, skip session memory
- Active ongoing projects → full memory structure

---

## Step 5: Fill CLAUDE.md
Replace all placeholders in the CLAUDE.md template.
Read the current file, replace `{{placeholder}}` values, write back.

---

## Step 6: Create goals.md
Write `.claude/memory/goals.md` with empty sections and today's date.

---

## Step 7: Knowledge Index (if knowledge/ detected)
Create `knowledge-index.md`:
```
| file | summary | key_questions | tags |
```
- `key_questions`: 2-3 real questions this file answers (not tags)
- DO NOT load knowledge files into memory
- Use the index for grep-based on-demand retrieval only

---

## Completion Rule
Print the filled CLAUDE.md content.
Print goals.md content.
Show both files as proof — do not say "setup complete" without showing them.
