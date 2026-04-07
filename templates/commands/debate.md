---
name: debate
description: Adversarial decision protocol for hard architectural choices. Opt-in only — not for routine decisions.
argument-hint: "[decision or tradeoff to evaluate]"
disable-model-invocation: true
---

# /debate — Adversarial Decision Protocol

$ARGUMENTS

---

## Deep Mode Detection

If `$ARGUMENTS` contains `--deep`:
1. Strip `--deep` from arguments before processing
2. Load `shared/ultrathink.md` — enables extended thinking for adversarial analysis
3. Steelman each position harder — find the strongest version of every argument before comparing
4. Consider 2nd-order consequences: "if we pick A, what breaks in 6 months?"
5. Search for hidden third options that neither side proposed

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

## Copilot Mode Detection

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE`:
- Skip AskUserQuestion — read `.claude/memory/blockers.md` for the blocker context
- The decision to debate is: how to unblock the stuck milestone
- Frame options from: the error message, what was tried, and alternative approaches
- After debate concludes: return the winning approach to /copilot for implementation
- Record decision in `.claude/memory/decisions.md` as normal

If `INTERACTIVE_MODE`: run Frame the Decision as normal.

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

### Knowledge Filing

```bash
ls .claude/knowledge/index.md 2>/dev/null && echo "KNOWLEDGE_EXISTS" || echo "NO_KNOWLEDGE"
```

If `KNOWLEDGE_EXISTS`: also file the decision to `knowledge/decisions/{slug}.md` with full tradeoff analysis, options considered, winner, rationale, and date. Update `knowledge/index.md` and append to `knowledge/log.md`. Use `auto_generated_by: /debate`.

Do not say "I recommend X" without showing the evidence-weighted reasoning.
