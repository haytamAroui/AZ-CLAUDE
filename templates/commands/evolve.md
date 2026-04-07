---
name: evolve
description: >
  Scan environment for gaps, generate improvements, consolidate knowledge.
  /evolve quick — detect only (~500 tokens, no fixes). Use after small sessions.
  /evolve — full cycle with fixes. Run after significant work or end of week.
disable-model-invocation: true
context: fork
---

# /evolve — Environment Evolution

$ARGUMENTS

## Step 0: Scope Gate

If $ARGUMENTS == "quick":
- Run DETECT only (read detect.md, output PLAN)
- Skip GENERATE, EVALUATE, Cycle 2, Cycle 3
- Skip EnterWorktree
- Output: gap list with file:line references — no fixes applied
- Cost: ~500 tokens. Use after small sessions or quick checks.
- Print: `PLAN (quick mode — gaps listed, not fixed):`

If $ARGUMENTS is blank or "full": run all cycles below.

---

## Step 0b: Check for Loop Controller (Level 10)

```bash
ls .claude/agents/loop-controller.md 2>/dev/null
```

**If loop-controller.md exists**: delegate evolution work to it via Agent tool:
```
Run a full evolution cycle: re-derivation check, then Cycle 1 (detect/generate/evaluate),
Cycle 2 (knowledge consolidation if 2+ sessions), Cycle 3 (topology if friction detected).
Show the full cycle report when done.
```
**After loop-controller finishes**: continue to Step 7 (Generate Project-Specific Skills and Agents).
The loop-controller handles gap detection and code fixes, but skill/agent generation requires
reading level-builders which the loop-controller does not do.

---

**If loop-controller.md does not exist** (Levels 3–9): run manually below.

---

## Step 1: Isolate (Worktree)

Use **EnterWorktree** — create branch `azclaude/evolve-{date}`.
All cycle work happens here. Environment changes do not touch main until evaluated.

---

## Cycle 0.5: Structural Analysis (before detection)

Run both analysis scripts for structural insight:
```bash
bash .claude/scripts/import-graph.sh
bash .claude/scripts/validate-boundaries.sh
```

**import-graph.sh** outputs: most-imported files, circular dependency warnings, co-change clusters.
**validate-boundaries.sh** outputs: manifest completeness, description overlap between extensions, orphaned agents, Claude Code collision check.

Feed these signals into Cycle 1 detection:
- Circular deps → architectural gaps
- Co-change clusters → agent candidates
- Description overlap → merge or split extensions
- Orphaned agents → remove or wire into commands

---

## Cycle 1: Detect → Generate → Evaluate

**Step 1**: Read `capabilities/evolution/detect.md` and run DETECT.
Include import-graph output as input. Circular deps = high-priority gaps.
Outputs: PLAN (list of gaps, rot types, sequence candidates)

**Step 2**: If PLAN has items → read `capabilities/evolution/generate.md` and run GENERATE.
Outputs: new or updated capability files

**Step 3**: Read `capabilities/evolution/evaluate.md` and run EVALUATE.
Outputs: quality-gated files, tagged as GENERAL or NARROW

If PLAN is empty: skip to Cycle 2.

---

## Cycle 2: Knowledge Consolidation (if sessions ≥ 2 since last consolidation)

Read `capabilities/evolution/cycle2-knowledge.md` and run.
Outputs: consolidated patterns, pruned stale memory, enriched knowledge-index

---

## Cycle 3: Topology (if /level-up or topology friction detected)

Read `capabilities/evolution/cycle3-topology.md` and run.
Outputs: optimized pipeline map, pruned obsolete agents, updated manifest token estimates

After topology optimization, run semantic boundary check:
1. If `validate-boundaries.sh` reported warnings → load `capabilities/shared/semantic-boundary-check.md`
2. Classify all flagged pairs as REDUNDANT / OVERLAPPING / COMPLEMENTARY / CLEAN
3. Apply fixes: merge redundant, extract shared, clarify complementary
4. Record decisions in `.claude/memory/decisions.md`

---

## Re-Derivation Check (run before any cycle if friction is high)

```bash
ls ops/observations/ | wc -l
```
If ≥ 10 friction logs AND grep shows same pattern in ≥ 5:
Read `capabilities/evolution/re-derivation.md` and run BEFORE any generate.

---

## Completion: Merge or Discard

After Evaluate passes all quality gates:
- **ExitWorktree** and merge to main
- If evaluate failed: ExitWorktree (discard) — no partial improvements on main

Then offer scheduling:
```
Schedule /evolve to run automatically?
Use CronCreate — weekly (Sunday 9am) recommended.
```
Use **CronList** to check if a schedule already exists before creating a new one.

---

## Cycle 4: Knowledge Health (if knowledge layer exists)

```bash
ls .claude/knowledge/index.md 2>/dev/null && echo "KNOWLEDGE_EXISTS" || echo "NO_KNOWLEDGE"
```

If `KNOWLEDGE_EXISTS`:

### 4a. Staleness — code_refs drift
For each knowledge page with `code_refs:` in frontmatter:
```bash
grep -rl "code_refs:" .claude/knowledge/{entities,concepts,decisions}/ 2>/dev/null
```
Check if referenced code files changed since page's `updated:` date:
```bash
git log --since="{page_updated_date}" --oneline -- {code_ref_path} 2>/dev/null | head -3
```
If code changed → flag page as stale. If change is straightforward (rename, moved) → auto-update.

### 4b. Orphan detection
Find knowledge pages with zero inbound [[wikilinks]]:
```bash
for f in $(find .claude/knowledge/{entities,concepts,decisions} -name "*.md" 2>/dev/null); do
  PAGE=$(basename "$f" .md)
  REFS=$(grep -rl "\[\[$PAGE\]\]" .claude/knowledge/ 2>/dev/null | wc -l)
  [ "$REFS" -eq 0 ] && echo "ORPHAN: $f"
done
```
Orphan pages with `confidence: low` and > 30 days old → archive candidate.

### 4c. Gap detection
Find code areas with no knowledge coverage:
```bash
# Directories with 10+ files but zero knowledge pages mentioning them
for d in $(find src/ app/ lib/ -mindepth 1 -maxdepth 1 -type d 2>/dev/null); do
  FILE_COUNT=$(find "$d" -type f | wc -l)
  DIR_NAME=$(basename "$d")
  KNOWLEDGE_REFS=$(grep -rl "$DIR_NAME" .claude/knowledge/ 2>/dev/null | wc -l)
  [ "$FILE_COUNT" -ge 10 ] && [ "$KNOWLEDGE_REFS" -eq 0 ] && echo "GAP: $d ($FILE_COUNT files, 0 knowledge pages)"
done
```
For each gap → suggest creating a knowledge page via knowledge-compiler.

### 4d. Confidence decay
Recalculate confidence scores using formula from `shared/knowledge-layer.md`:
- `high` → `medium` if no updates in 30 days AND code_refs changed
- `medium` → `low` if single source AND > 60 days old
- `low` + never referenced + > 90 days → archive candidate

### 4e. Contradiction scan
For each entity/concept, check if 2+ pages make conflicting claims about the same topic.
Flag contradictions — do NOT auto-resolve. Record in knowledge/log.md.

Print Cycle 4 summary:
```
Cycle 4 — Knowledge Health:
  Stale pages:      {N} ({N} auto-updated, {N} flagged)
  Orphan pages:     {N} ({N} archived, {N} kept)
  Coverage gaps:    {N} directories with no knowledge
  Confidence decay: {N} pages downgraded
  Contradictions:   {N} flagged for review
```

If `NO_KNOWLEDGE`: skip Cycle 4 silently.

---

## Step 6: Log Evolution History

Append to `ops/evolution-log.md` (create if missing):
```
| {date} | {before score}/100 | {after score}/100 | {+delta} | {1-line summary of what changed} |
```

If the file doesn't exist, create it with this header:
```
# Evolution History

| Date | Before | After | Delta | Summary |
|------|--------|-------|-------|---------|
```

---

## Step 7: Generate or Update Project-Specific Skills and Agents

**Principle**: Never let Claude work without project-specific skills. Generate minimum viable skills early, then improve them as evidence accumulates.

### 7a: Ensure minimum skills exist
```bash
ls .claude/commands/*.md 2>/dev/null | wc -l
ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l
```
If project has ZERO project-specific skills (only the 26 standard commands):
1. Read `.claude/capabilities/level-builders/level3-skills.md`
2. Analyze the project's stack, domain, and file structure
3. Generate at least 2 skills immediately — even with zero git history
4. Focus on: what file types exist → what workflow creates more of them

### 7b: Generate new skills from git evidence
```bash
git log --name-only --format="" --diff-filter=AM | sort | uniq -c | sort -rn | head -20
```
**Threshold: 2+ occurrences** (not 5 — skills should appear early, not late):
1. Read `.claude/capabilities/level-builders/level3-skills.md`
2. Create a skill that encodes the workflow for that pattern
3. Save to `.claude/commands/{skill-name}.md`
4. Only create if no existing skill covers this workflow

### 7c: Update existing skills from session learnings
```bash
ls .claude/memory/sessions/*.md 2>/dev/null | tail -3
```
If session files exist, scan for patterns that existing skills missed:
- Repeated manual steps that should be in a skill → add them
- Skill triggered but missing a step → update the skill
- New conventions emerged → update skill's Rules section

### 7d: Generate agents from co-change clusters
```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -30
```
If 3+ files in the same directory change together across 2+ commits:
1. Read `.claude/capabilities/level-builders/level5-agents.md`
2. Create an agent with all 5 layers in `.claude/agents/cc-{name}.md`
3. Use co-change data for scope boundaries
4. Only create if no existing agent covers this cluster

### Check existing before creating
```bash
ls .claude/commands/*.md .claude/agents/*.md .claude/skills/*/SKILL.md 2>/dev/null
```
Skip creation if a skill/agent already covers the same workflow.
Update existing ones if they're missing steps discovered in recent sessions.

### 7e: Orchestrator re-evaluation (if intelligent copilot installed)

After generating new agents/skills, check:
```bash
ls .claude/agents/orchestrator.md .claude/plan.md 2>/dev/null
```

If BOTH exist — spawn orchestrator with:
```
Re-evaluate plan.md after /evolve created new agents and skills.
Focus on: which blocked milestones can now be unblocked?
New agents available: {list of newly created agents}
New skills available: {list of newly created skills}
Check blockers.md for each blocked milestone — does a new agent cover the missing capability?
Update plan.md status for any milestone that is now unblockable (blocked → pending).
Report: milestones unblocked + reason.
```

This closes the loop: /evolve creates capability → orchestrator immediately re-routes blocked work.

---

## Step 7f: Spec and Plan Drift Analysis

After generating/updating skills and agents, check for documentation drift:

```bash
ls .claude/plan.md .claude/specs/*.md 2>/dev/null
```

If plan.md exists → run `/analyze plan`:
- Identifies GHOST milestones (marked done but files missing)
- Surfaces dependency violations

Append drift findings to `ops/evolution-log.md`:
```
| {date} | DRIFT | {N ghost milestones} | {N unplanned capabilities} | {1-line summary} |
```

If GHOST milestones found → set their status back to `pending` in plan.md.
This closes a common drift loop: code gets deleted or renamed, plan.md still says done.

---

## Step 8: Promote GENERAL Skills

For any fix tagged GENERAL in EVALUATE:
1. Copy to `~/shared-skills/{name}.md`
2. Add `discovered_in: {project}` to frontmatter
3. Update `~/shared-skills/.checksums` with sha256 hash
4. Print: `Promoted to ~/shared-skills/{name}.md`

Skip this step if all fixes were tagged NARROW.

---

## Completion Rule
Print the PLAN that was detected.
Print the list of files created or updated.
Print the updated goals.md.
Print the evolution-log.md entry.
Show the files — do not say "evolution complete" without showing output.
