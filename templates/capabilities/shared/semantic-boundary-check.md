---
name: semantic-boundary-check
description: >
  Load during /evolve Cycle 3 (topology) or when boundary validator finds lexical
  overlaps. Detects deeper behavioral duplication that grep cannot catch: same
  behavior in different wording, hidden role overlap between commands/skills/agents,
  conceptual redundancy across extension types. Load when validate-boundaries.sh
  reports warnings, when adding a new skill/command/agent, or when /evolve
  detects friction from competing extensions.
tokens: ~300
---

# Semantic Boundary Check

The lexical validator (`validate-boundaries.sh`) catches obvious overlaps by
comparing trigger keywords. This capability catches what grep misses:
**same behavior, different words.**

## When to Run

1. After `validate-boundaries.sh` reports any warnings
2. During `/evolve` Cycle 3 (topology optimization)
3. When creating a new command, skill, or agent (via skill-creator or agent-creator)
4. When a user reports "two things seem to do the same job"

## Protocol

### Step 1: Read All Extension Descriptions

Read the **full body** (not just frontmatter) of every extension:
```bash
ls .claude/commands/*.md .claude/skills/*/SKILL.md .claude/agents/*.md .claude/capabilities/shared/*.md 2>/dev/null
```

For each file, extract:
- **What it does** (from workflow/steps section)
- **When it fires** (from description/triggers)
- **What it produces** (output format, files written)
- **What it reads** (input files, state files)

### Step 2: Build Overlap Matrix

For each pair of extensions across different types, answer:

| Question | If YES → overlap risk |
|----------|----------------------|
| Do they read the same input files? | Medium — shared data source |
| Do they write to the same output files? | High — competing writers |
| Do they trigger on the same user intent? | High — user confusion |
| Do they produce the same type of output? | High — redundant work |
| Would removing one change nothing for the user? | Critical — one is redundant |

### Step 3: Classify Each Overlap

| Classification | Definition | Action |
|---------------|------------|--------|
| **REDUNDANT** | Same behavior, different name. Removing one changes nothing. | Merge into one, delete the other |
| **OVERLAPPING** | Partial behavior overlap. Each does something unique + something shared. | Extract shared part into a capability, keep unique parts |
| **COMPLEMENTARY** | Different behavior, same trigger domain. Both needed but confusing. | Clarify descriptions to distinguish when each fires |
| **CLEAN** | No behavioral overlap. Different purpose, different triggers. | No action needed |

### Step 4: Output Report

```markdown
## Semantic Boundary Report

### REDUNDANT (merge these)
- {extension A} ↔ {extension B}: {what they both do}
  Action: merge into {recommended name}

### OVERLAPPING (extract shared)
- {extension A} ↔ {extension B}: shared behavior = {what}
  Action: extract {shared part} into capabilities/shared/{name}.md

### COMPLEMENTARY (clarify triggers)
- {extension A} ↔ {extension B}: same domain, different purpose
  Action: update descriptions to distinguish

### CLEAN
- {N} extension pairs checked, no overlap
```

### Step 5: Apply Fixes

For REDUNDANT pairs:
1. Keep the extension with more usage evidence (check patterns.md, reflexes)
2. Merge unique content from the other into the keeper
3. Delete the redundant one
4. Update manifest.md

For OVERLAPPING pairs:
1. Extract shared behavior into `capabilities/shared/{name}.md`
2. Have both extensions reference the shared capability
3. Remove duplicated content from each

For COMPLEMENTARY pairs:
1. Add "Do NOT use when..." section to each
2. Add cross-references: "For {other task}, use {other extension} instead"
3. Make descriptions more specific (narrower triggers)

## Examples of What Grep Misses

### Same behavior, different words
```
Command /fix: "Reproduce → Investigate → Fix → Verify"
Agent code-reviewer: "Check for bugs, logic errors, edge cases"
```
These don't share trigger keywords but both deal with "finding and fixing problems."
The difference: /fix actually fixes, code-reviewer only reports. → COMPLEMENTARY, not redundant.

### Hidden output conflict
```
Skill test-first: "Write failing test before implementation"
Command /test: "Run tests, classify failures"
```
Both touch testing but at different phases. → CLEAN (different lifecycle stages).

### Real redundancy
```
Capability completion-rule.md: "Never say 'should work' — show test output"
Agent code-reviewer constraint: "Never approve code without checking tests pass"
```
Both enforce "prove it works." → OVERLAPPING. Extract shared enforcement rule.

## Integration with /evolve

During Cycle 3 (topology):
1. Run `validate-boundaries.sh` (lexical check)
2. If warnings > 0: load this capability, run semantic check on flagged pairs
3. If warnings = 0: run semantic check on any extensions modified in last 3 sessions
4. Apply fixes for REDUNDANT and OVERLAPPING findings
5. Log findings to `ops/evolution-log.md`

## Rules

- Always read full file bodies, not just frontmatter
- Classify before acting — don't merge without confirming REDUNDANT
- When in doubt, classify as COMPLEMENTARY (add clarification, don't merge)
- Never delete an extension without checking if it's referenced in copilot.md or CLAUDE.md
- Record every merge/split decision in `.claude/memory/decisions.md`
