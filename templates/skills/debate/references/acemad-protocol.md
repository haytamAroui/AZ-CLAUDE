# AceMAD Debate Protocol — Full Reference

## Phase 1: Define the Question
State the decision as a binary or small option set:
"Should we do A or B?"
"Which architecture: X or Y?"
Not: "What should we do about the general problem?"

## Phase 2: Advocate A — MAXIMALIST
Argue the strongest possible case FOR the leading option.
- Make the best arguments you can — do not sandbag
- N ≤ 10 arguments maximum
- Each argument: one claim + one piece of evidence
- Label evidence: [VERIFIED] / [PARTIAL] / [UNVERIFIED] / [FALSE]

## Phase 3: Advocate B — SKEPTIC
Argue the strongest possible case AGAINST (or FOR the alternative).
- N ≤ 10 arguments maximum
- T ≤ 5 total rounds across both advocates
- Same evidence labeling rules apply
- Must address MAXIMALIST's strongest verified argument

## Phase 4: FACT CHECK — NON-NEGOTIABLE
Before synthesis, tag every claim:

| Tag | Meaning |
|-----|---------|
| [VERIFIED] | Confirmed by code, docs, or direct test |
| [PARTIAL] | Directionally correct but incomplete |
| [UNVERIFIED] | Asserted without evidence |
| [FALSE] | Contradicted by evidence |

**Disqualified claim language** — any argument containing:
"should work" / "probably" / "I believe" / "I think" → mark [UNVERIFIED], reduce weight.

If ≥ 30% of an advocate's claims are UNVERIFIED → confidence stays LOW.
Truth wins. Not volume.

## Phase 5: Synthesis

**5a. Draft synthesis** — pick the winner, state the margin (0-100 confidence).

**5b. Second-Order Cognition Check [AceMAD]**:
Did the synthesis address the strongest *verified* claim from the losing side?
If not → revise. Confidence stays LOW until addressed.

**5c. Self-refine** — critique the draft:
- Did I favor the side with more words?
- Did I ignore any [VERIFIED] claim?
- Is the margin honest?
Max 2 rounds of self-refine.

**5d. Order-Independence Check [PeerRank]**:
If margin < 10 points: run synthesis again with advocates in reversed order.
If conclusion reverses → result is INCONCLUSIVE.

**5e. Deliver** — state winner, confidence, and the one verified claim that decided it.

## Phase 6: Length-Independence [Elo-Evolve]
Score on **evidence-density** (verified claims per 100 words), NOT raw word count.
Flag any advocate exceeding 2× median length — the excess is noise.

## Phase 7: Record the Decision
Append to `.claude/memory/decisions.md`:
```
## {Decision Title} — {date}
**Question**: {the decision}
**Options**: {A} vs {B}
**Winner**: {chosen approach} (confidence: {level})
**Deciding claim**: {the one verified claim that settled it}
**Dissent**: {strongest verified argument for the loser}
```
