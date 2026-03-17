---
name: evolution-cycle3-topology
description: >
  Load when agents overlap in scope and you're not sure which handles what. Load
  when a pipeline feels slow or agents are passing too much context to each other.
  Load when manifest.md has capabilities that never get loaded. Load during /level-up
  or when the user says "too many agents" or "agents are getting confused".
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
- Does it have all 5 layers? (see agent-creator skill or shared/5-layer-agent.md)
- Is it still needed, or has a skill replaced it?
- If obsolete: archive to `.claude/agents/archive/`

---

### UPDATE PIPELINES
If 3+ agents chain (A → B → C):
- Verify B receives only A's output, not A's full context
- Verify C receives only B's output
- Document the chain in `.claude/memory/pipeline-map.md`

---

### Topology Map Schema

Write / update `.claude/memory/topology-map.json` after every Cycle 3 run:

```json
{
  "last_updated": "YYYY-MM-DD",
  "pipelines": [
    {
      "name": "{pipeline-name}",
      "chain": ["agent-a", "agent-b", "agent-c"],
      "uses": 0,
      "quality_score": 0,
      "influence_score": 0,
      "last_used": "YYYY-MM-DD"
    }
  ],
  "agents": [
    {
      "name": "{agent-name}",
      "file": ".claude/agents/{name}.md",
      "uses": 0,
      "elo": 1000,
      "last_used": "YYYY-MM-DD",
      "status": "active|archived"
    }
  ],
  "capabilities": [
    {
      "file": "capabilities/{path}.md",
      "usage_score": 0,
      "quality_score": 0,
      "tokens": 0,
      "status": "active|archived"
    }
  ]
}
```

`influence_score` = how many other pipelines depend on this one's output.
`elo` = updated from intelligence/elo.md pairwise comparisons when agents compete.

After updating topology-map.json → also update the relevant rows in manifest.md token estimates.
