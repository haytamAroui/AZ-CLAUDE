---
name: evolution-cycle2-knowledge
description: >
  Cycle 2: Knowledge Consolidation. Harvests session memory, consolidates
  patterns, prunes stale knowledge, enriches knowledge-index.md.
  Run as part of /evolve after detect+generate+evaluate.
tokens: ~200
---

## Cycle 2: Knowledge Consolidation

---

### HARVEST — 3-layer retrieval (same as detect.md Layer 1-3)
Read only what's recent and relevant:
- Session summaries from last 5 sessions
- Friction logs from last 3 sessions
- Any learnings files modified in last 10 commits

---

### CONSOLIDATE
Group harvested content by pattern:
- Same friction appearing in 3+ sessions → candidate for re-derivation
- Same workflow appearing in 3+ sessions → candidate for skill
- Same fact referenced in 3+ files → candidate for knowledge-index entry

Rules:
- Do not consolidate single-occurrence items — they are noise
- Consolidation writes ONE new file or updates ONE existing file
- Never write to a file that is > 7 days old without reading it first

---

### PRUNE — Importance Scoring

Before archiving, score each memory file:

```
importance = (frequency × 3) + (recency × 2) + (impact × 5)
```

| Factor | How to measure | Scale |
|--------|---------------|-------|
| frequency | How many session logs reference this file | 0-10 |
| recency | Days since last reference (0=today, 10=never) | 0-10 (inverted) |
| impact | Did this file change a decision? (grep decisions.md) | 0-10 |

**Thresholds:**
- importance ≥ 30 → promote to core memory (load every session)
- importance 15-29 → keep, load on demand
- importance < 15 → archive candidate

Check git history:
```bash
git log --oneline -20 -- .claude/memory/
```

If importance < 15 AND not referenced in last 10 sessions → archive:
```bash
mkdir -p .claude/memory/archive
mv .claude/memory/{file}.md .claude/memory/archive/{file}.md
```

Do NOT delete — archive. Deleted knowledge cannot be recovered.

---

### ENRICH knowledge-index.md
If a `knowledge/` directory exists:
```
| file | summary | key_questions | tags |
```

- `key_questions`: 2-3 actual questions this file answers (not tags — real questions the model would ask)
- Purpose: grep-based retrieval. The model searches key_questions to find which file to read.
- DO NOT load these files into memory. Use the index to find which file to read on demand.

---

### LOG
Append to `.claude/memory/sessions/{date}-cycle2.md`:
- What was harvested
- What was consolidated
- What was pruned (archived)
- What was added to knowledge-index
