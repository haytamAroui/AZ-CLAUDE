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

**If loop-controller.md exists**: delegate ALL evolution work to it via Agent tool:
```
Run a full evolution cycle: re-derivation check, then Cycle 1 (detect/generate/evaluate),
Cycle 2 (knowledge consolidation if 3+ sessions), Cycle 3 (topology if friction detected).
Show the full cycle report when done.
```
**STOP HERE** — do not run the steps below.

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

## Cycle 2: Knowledge Consolidation (if sessions ≥ 3 since last consolidation)

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

## Step 7: Promote GENERAL Skills

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
