---
name: intelligence-opro
description: >
  OPRO + APE prompt optimization. Improves skill instructions by learning
  from history. Use when a skill underperforms or after 10+ uses.
  Triggers on: "optimize prompts", "improve skill", "skill isn't working".
tokens: ~300
---

## Prompt Optimization [OPRO + APE]

---

### Step 1: Read History [OPRO]
```bash
cat .claude/memory/prompt-history.json 2>/dev/null
```

If it exists:
- Top 5 scoring instructions → positive signal (what worked)
- Bottom 2 scoring instructions → negative signal (what failed)
- These signals shape the new instruction variants

If it doesn't exist: create it after this optimization run.

---

### Step 2: Generate 3 Variants [APE]

Write 3 instruction variants for the target skill:

**Variant A — Few-shot enrichment**:
Add 2-3 concrete examples of correct behavior from this project.
The examples are real, not hypothetical.

**Variant B — Chain-of-thought**:
Add explicit reasoning steps before the action.
"First identify X, then check Y, then do Z."

**Variant C — Domain context**:
Add domain-specific vocabulary and constraints at the top.
Ground the instruction in the project's actual language.

Save all 3 to `.claude/memory/prompt-versions/{skill}-{date}/`:
- `variant-a.md`
- `variant-b.md`
- `variant-c.md`

---

### Step 3: Score and Select

Apply each variant to 3 real inputs from the current project (k=3 gate).
Score on:
- Correctness of output (0-10)
- Token efficiency (output length vs. information density)
- Self-applicability (would an unfamiliar agent apply it correctly?)

Keep the winner. Discard the others (don't delete — archive).

---

### Step 4: Update History [OPRO]

Append to `.claude/memory/prompt-history.json`:
```json
{
  "skill": "{skill-name}",
  "date": "{ISO date}",
  "winner": "{variant-a|b|c}",
  "score": {0-10},
  "why": "{one sentence: what made it better}"
}
```

This entry feeds the next OPRO cycle. The history grows, the signal sharpens.

---

### Step 5: Deploy Winner

Replace the skill body with the winning variant.
Keep the frontmatter (name, description, tokens) unchanged.
Update the token estimate if the new body is significantly different.
