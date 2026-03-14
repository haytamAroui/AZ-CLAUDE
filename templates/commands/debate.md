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

## Frame the Decision

If $ARGUMENTS is vague (no clear options stated), use **AskUserQuestion**:
- What are the options being considered?
- What constraint matters most? (performance / maintainability / cost / speed)
- What would make this decision irreversible or costly to reverse?

Do not proceed without clear options.

---

## Run the Debate

**EnterPlanMode** — the debate protocol is analysis only. No files touched during debate.

Read `capabilities/intelligence/debate.md` and execute the full protocol.

If the decision involves ranking multiple options (not binary):
Also read `capabilities/intelligence/elo.md` for pairwise ranking.

---

## Completion Rule

**ExitPlanMode** — now record the decision.

State the winner, the confidence level, and the one verified claim that decided it.
Record the decision in `.claude/memory/decisions.md`.
Do not say "I recommend X" without showing the evidence-weighted reasoning.
