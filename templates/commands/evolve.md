---
name: evolve
description: >
  Evolution cycle. Scans environment for gaps, generates improvements, evaluates
  quality, consolidates knowledge. Run after significant work or end of week.
  Triggers on: /evolve, "improve environment", "evolve", "update agents".
tokens: ~80
---

# /evolve — Environment Evolution

Thin router. Loads only what each phase needs.

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
