---
name: debate
description: >
  Structured adversarial debate for hard decisions. Use when making any
  technical decision between 2+ options, architecture choices, library
  selection, REST vs GraphQL, monolith vs microservices, SQL vs NoSQL,
  or when the user says "should I", "which is better", "compare",
  "pros and cons", "trade-offs", "help me decide", "A or B", "what
  approach", or any variation of "I can't decide between". Also use
  when the user presents two options and seems uncertain which to pick,
  even if they don't explicitly ask for a debate.
disable-model-invocation: true
tags: [decision, tradeoff, comparison, architecture, acemad]
---

# Structured Debate [AceMAD]

<instructions>

Use when a decision is genuinely uncertain, multi-criteria, and wrong choice costs real time.
Do NOT use for routine decisions — Claude's direct answer is faster and equally good.

## Quick Flow

1. **Define** — State as binary: "A or B?" (not "what should we do?")
2. **Advocate A** — Strongest case FOR (≤10 arguments, evidence-tagged)
3. **Advocate B** — Strongest case AGAINST (≤10 arguments, must address A's strongest)
4. **Fact Check** — Tag every claim: [VERIFIED] / [PARTIAL] / [UNVERIFIED] / [FALSE]
5. **Synthesize** — Pick winner, state confidence (0-100), check for position bias
6. **Record** — Append to `.claude/memory/decisions.md`

## Evidence Rules

- Each argument: one claim + one piece of evidence
- ≥30% UNVERIFIED → confidence stays LOW regardless of score
- Score on evidence-density (verified claims per 100 words), NOT word count
- If margin < 10 points: run synthesis reversed to check position bias

For the full 7-phase protocol with examples, read `references/acemad-protocol.md`.

</instructions>
