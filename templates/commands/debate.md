---
name: debate
description: >
  Adversarial debate for hard architectural decisions. Opt-in only.
  Do NOT use for routine decisions — Claude's direct answer is faster and equally good.
  Triggers on: /debate, "debate", "which is better", "should we", hard tradeoff.
tokens: ~60
---

# /debate — Adversarial Decision Protocol

Thin router. Opt-in only.

---

## When to Use This

Use when:
- The decision is genuinely uncertain
- Multiple criteria are in tension
- Getting it wrong costs real time to reverse

Do NOT use when:
- The answer is obvious on reflection
- The decision is reversible and low-cost
- You just want validation — ask directly instead

---

## Run the Debate

Read `capabilities/intelligence/debate.md` and execute the full protocol.

If the decision involves ranking multiple options (not binary):
Also read `capabilities/intelligence/elo.md` for pairwise ranking.

---

## Completion Rule
State the winner, the confidence level, and the one verified claim that decided it.
Record the decision in `.claude/memory/decisions.md`.
Do not say "I recommend X" without showing the evidence-weighted reasoning.
