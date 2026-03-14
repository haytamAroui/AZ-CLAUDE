---
name: debate
description: Adversarial decision protocol for hard architectural choices. Opt-in only — not for routine decisions.
argument-hint: "[decision or tradeoff to evaluate]"
disable-model-invocation: true
---

# /debate — Adversarial Decision Protocol

$ARGUMENTS

---

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
