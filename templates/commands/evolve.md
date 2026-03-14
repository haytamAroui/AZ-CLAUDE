---
name: evolve
description: Scan environment for gaps, generate improvements, consolidate knowledge. Run after significant work or end of week.
disable-model-invocation: true
context: fork
---

# /evolve — Environment Evolution

## Step 0: Check for Loop Controller (Level 10)

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

## Cycle 1: Detect → Generate → Evaluate

**Step 1**: Read `capabilities/evolution/detect.md` and run DETECT.
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

---

## Re-Derivation Check (run before any cycle if friction is high)

```bash
ls ops/observations/ | wc -l
```
If ≥ 10 friction logs AND grep shows same pattern in ≥ 5:
Read `capabilities/evolution/re-derivation.md` and run BEFORE any generate.

---

## Completion Rule
Print the PLAN that was detected.
Print the list of files created or updated.
Print the updated goals.md.
Show the files — do not say "evolution complete" without showing output.
