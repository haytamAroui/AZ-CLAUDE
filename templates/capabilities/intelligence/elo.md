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
