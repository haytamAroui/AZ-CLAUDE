---
name: intelligence-elo
description: >
  ELO quality ranking across options, agents, or skills. Use when comparing
  multiple candidates and need a defensible rank order.
  Triggers on: "rank these", "which is best", "compare quality".
tokens: ~200
---

## ELO Quality Ranking [PeerRank + Elo-Evolve]

---

### Authoritative Ownership [Elo-Evolve]
The loop controller (the model running this skill) owns the authoritative ELO scores.
Subagents that produce provisional scores feed into this controller — they do not own the final rank.
Provisional scores from subagents are inputs, not decisions.

Self-evaluation reliability: r=0.538 (self-scored) vs r=0.905 (loop controller reconciliation).
Never let an agent self-rank as authoritative.

---

### Pairwise Comparison Protocol

**Comparative Binary Framing**: Compare pairs, not absolutes.
"Is A better than B for this criterion?" — not "Rate A from 1 to 10."

For N candidates: run N×(N-1)/2 pairwise comparisons.
Each comparison: one winner, one loser. No ties unless evidence is genuinely equal.

---

### ELO Schema

For each candidate, track:
```json
{
  "id": "{candidate-id}",
  "elo": 1000,
  "wins": 0,
  "losses": 0,
  "adjusted_evidence_score": 0,
  "fact_check": {
    "verified": 0,
    "partial": 0,
    "unverified": 0,
    "false": 0
  }
}
```

ELO update after each comparison:
- Winner: elo += 32 × (1 - expected_score)
- Loser: elo -= 32 × expected_score
- expected_score = 1 / (1 + 10^((opponent_elo - this_elo) / 400))

---

### Adjusted Evidence Score

Do not rank on raw ELO alone. Adjust for fact-check quality:
- `adjusted_evidence_score = verified_claims / (verified + unverified + false)`
- If adjusted_evidence_score < 0.5: cap ELO at 1100 regardless of wins
- A candidate that wins on volume but loses on evidence quality is not the best candidate

---

### Output

Rank candidates by final ELO descending.
For the winner: state the one pairwise comparison that determined the rank.
Record in `.claude/memory/decisions.md` with the full ranking table.

---

### Persistent ELO — elo-rankings.json

Write rankings to `.claude/memory/elo-rankings.json` so scores accumulate across sessions:

```json
{
  "last_updated": "YYYY-MM-DD",
  "debate_elo": [
    {
      "position": "{argument-id}",
      "context": "{decision-topic}",
      "elo": 1000,
      "wins": 0,
      "losses": 0,
      "adjusted_evidence_score": 0.0
    }
  ],
  "agent_elo": [
    {
      "agent": "{agent-name}",
      "elo": 1000,
      "tasks_completed": 0,
      "wins": 0,
      "losses": 0,
      "last_task": "YYYY-MM-DD"
    }
  ],
  "pattern_elo": [
    {
      "pattern": "{pattern-description}",
      "source": ".claude/memory/patterns.md",
      "elo": 1000,
      "times_applied": 0,
      "times_succeeded": 0,
      "times_failed": 0
    }
  ]
}
```

**Update rules:**
- `debate_elo`: updated after each `/debate` cycle — one entry per argued position
- `agent_elo`: updated after each pipeline run — winner = agent whose output was accepted without revision
- `pattern_elo`: updated after each task — pattern succeeded if the approach worked, failed if re-derivation was triggered

Read `elo-rankings.json` at the start of each debate or agent spawn. Pass as context so prior performance informs the current run.
