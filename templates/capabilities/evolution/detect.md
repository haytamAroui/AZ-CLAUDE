---
name: evolution-detect
description: >
  Load at the start of /evolve. Load when the environment feels stale or broken.
  Load when skills aren't triggering correctly, agents are making repeated mistakes,
  or friction logs mention the same pain 3+ times. Load when you suspect something
  was built weeks ago and may no longer match how the project actually works.
tokens: ~250
---

## DETECT

### Step 1: 3-Layer Memory Retrieval

**Layer 1 — Search** (grep keywords, don't read files yet):
```bash
git log --oneline -10
ls .claude/memory/learnings/ 2>/dev/null
ls ops/observations/ 2>/dev/null
grep -rl "friction\|gap\|repeated\|failed" .claude/memory/ 2>/dev/null
```

**Layer 2 — Filter** (recency and relevance):
- Last 5 commits — what was recently touched?
- Friction logs from the last 3 sessions only
- Memory files whose filenames match current task keywords

**Layer 3 — Read** (only what passed Layer 2):
- Read matched files — not all of them. Layer 1+2 cost ~100 tokens. Layer 3 costs per file.
- Session summaries: `tail -50 .claude/memory/sessions/*.md`
- Frontmatter filter: read `topics:` field before reading full session file.

---

### Step 2: Friction Scan

```bash
ls ops/observations/ 2>/dev/null
grep -r "harder than\|repeated from\|took longer\|missing" ops/observations/ 2>/dev/null
```

Classify signals:
- **Repetition signals** — same task appears in ≥ 2 friction logs
- **Correction signals** — Claude output corrected by user in ≥ 2 sessions
- **Speed signals** — "took longer than expected" for same task type
- **Missing signals** — "environment is missing" repeated

Domain-specific friction signals:
- Developer: test failures, missing scaffolding
- Writer: continuity errors, structure resets
- Researcher: unsourced claims, repeated lookups
- Compliance: wrong vocabulary, missing obligation documentation

Compute friction score alongside structural score. High friction = high priority fix.

---

### Step 3: CONTEXT ROT CLASSIFICATION [CE Pyramid]

Before patching any context problem, classify the rot type:

| Rot Type | Symptom | Fix |
|----------|---------|-----|
| Poisoning | Agent believes wrong facts | Remove or correct the false source |
| Distraction | Irrelevant context consuming window | Filter or summarize |
| Confusion | Agent receives contradictory instructions | Resolve conflict, enforce one rule |
| Clash | Context from multiple sources conflicts | Establish priority order |

Rule: **classify first, patch second.** Never patch without a rot type label.

---

### Step 4: SEQUENCE SCAN [AutoAgent]

Look for patterns that repeat across 3+ sessions:
```bash
grep -r "description:" .claude/memory/sessions/ 2>/dev/null | head -20
```

A sequence candidate = same 3+ steps done manually in 3+ separate sessions.

Rules:
- Flag candidates only — don't build the skill yet
- If it maps to an existing skill: skip
- If it's a project-specific one-off: skip
- If it's a general workflow pattern: flag for GENERATE

---

### Step 5: INTENTION-OUTCOME SCAN [AutoAgent]

```bash
grep "description:" .claude/memory/*.md 2>/dev/null
grep -r "friction\|gap\|missed" ops/observations/ 2>/dev/null
```

Compare what agents were supposed to do (description field) vs. what friction logs say happened.

- Gap = capability described but friction says it doesn't work
- Only flag gaps that appear in ≥ 2 friction entries (single-occurrence = noise)
- Gap action must be specific: "add X to file Y" — not "improve agent"

Add flagged gaps to PLAN alongside structural gaps.
