---
name: evolution-cycle3-topology
description: >
  Cycle 3: Topology Optimization. Reviews agent structure, pipeline efficiency,
  manifest accuracy. Run during /level-up or when pipeline friction is high.
tokens: ~250
---

## Cycle 3: Topology Optimization

---

### INVENTORY
Map the current environment:
```bash
ls .claude/capabilities/
ls .claude/capabilities/evolution/ .claude/capabilities/intelligence/ .claude/capabilities/shared/
ls .claude/commands/
ls .claude/agents/ 2>/dev/null
wc -l .claude/capabilities/**/*.md
```

For each capability file:
- Record line count
- Record token estimate (lines × 12 approx)
- Record last modified date

---

### MEASURE
Score each file on two axes:

**Usage score (1-10)**: How often is this file loaded per session?
- Check friction logs for references
- Check session summaries for mentions
- Score 1 = never referenced, Score 10 = every session

**Quality score (1-10)**: Does it pass Five Quality Criteria?
- Run Five Quality Criteria from evaluate.md on each file
- Score = number of criteria passed × 2

**ELO rank**: Sort files by (usage × quality) descending.
High score → keep and improve. Low score → candidate for pruning.

---

### OPTIMIZE
For each file scoring below threshold (usage < 3 AND quality < 6):

1. Is it referenced in manifest.md? If not → it's dead weight. Archive it.
2. Is it too long (> 150 lines)? Split it into two focused files.
3. Is its description in manifest.md accurate? If not → update manifest row.
4. Does it overlap with another file? Merge or clarify boundary.

**Pipeline check** (if agents chain):
- Does each agent receive only what it needs?
- Is any agent passing its full context window to the next? That's a violation.
- Fix: pass only the output, not the context that produced it.

---

### RECORD
Update manifest.md token estimates based on actual line counts.
Append topology report to `.claude/memory/sessions/{date}-cycle3.md`.

---

### PRUNE AGENTS
For any custom agent in `.claude/agents/`:
- Does it have all 5 layers? (see shared/5-layer-agent.md)
- Is it still needed, or has a skill replaced it?
- If obsolete: archive to `.claude/agents/archive/`

---

### UPDATE PIPELINES
If 3+ agents chain (A → B → C):
- Verify B receives only A's output, not A's full context
- Verify C receives only B's output
- Document the chain in `.claude/memory/pipeline-map.md`
