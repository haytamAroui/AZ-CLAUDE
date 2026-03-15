---
name: evolution-evaluate
description: >
  Load after generate.md has produced a new skill, agent, or capability.
  Load before promoting, committing, or merging any generated file.
  Load when a new skill was just written and you are unsure if it is good enough.
  Never promote generated output without running this — generated files fail silently.
tokens: ~200
---

## EVALUATE

Run for every file produced in GENERATE before it ships.

---

### Step 1: Five Quality Criteria [CE Pyramid]

Check all five. Fail any one → fix first, ship second. No exceptions.

| Criterion | Question | Pass condition |
|-----------|----------|---------------|
| Relevance | Does this context help with the current task? | Directly used in this task |
| Sufficiency | Does it contain everything needed to act? | No missing steps or undefined terms |
| Isolation | Does it stand alone without unstated dependencies? | Self-contained for its scope |
| Economy | Can any word be removed without losing meaning? | Minimum words for maximum clarity |
| Provenance | Is the source of this knowledge traceable? | Source referenced or derivation clear |

Pass all 5 → proceed to TAG.
Fail any 1 → fix it. Do not move forward until all 5 pass.

---

### Step 2: Pass-k Thresholds [DUCTILE]

A single passing test proves nothing.

- **k=3 dev gate**: Apply the generated skill to 3 different real inputs from the current project. k=3 catches prompt sensitivity.
- **k=10 deploy gate**: Before promoting to shared-skills, apply to 10 inputs. k=10 catches edge-case failures that k=3 misses.

Never mark a skill done after one successful application.
Never promote to shared-skills without passing k=10.

---

### Step 3: TAG

Classify every generated skill:

**GENERAL skill** — applies across projects:
- Works for any developer project, any writer project, etc.
- Does not depend on this project's specific code or structure
- Add frontmatter: `skill_type: general`
- After passing k=10: copy to `~/shared-skills/` for reuse across projects
- Add `discovered_in: {project}` to frontmatter before promoting

**NARROW skill** — specific to this project:
- Depends on this project's domain, stack, or structure
- Do NOT promote to shared-skills
- Stays in `.claude/commands/` only
- Narrow skills never go to shared-skills, even if they seem reusable

When uncertain: default to NARROW. Promote to GENERAL only with evidence across projects.

---

### Step 4: GOALS UPDATE

After evaluating all generated files:
1. Update `.claude/memory/goals.md` — mark completed items, add next actions
2. Top 3 concrete next actions only — not a wish list
3. Remove blockers that were resolved

---

### Step 5: SESSION SUMMARY

Write `{date}-cycle-{N}.md` to `.claude/memory/sessions/`:
```yaml
---
date: {ISO date}
cycle: {N}
topics: [list of what was detected, generated, evaluated]
gaps_fixed: [list]
skills_created: [list]
promoted_to_shared: [list or none]
---

{2-3 sentence summary of what changed and why}
```
