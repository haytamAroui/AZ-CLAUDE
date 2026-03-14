---
name: persist
description: >
  Session-end command. Updates goals.md, writes friction log, appends session summary.
  Run before closing every session.
  Triggers on: /persist, "save session", "end session", "before I go".
tokens: ~100
---

# /persist — Session End

Load: shared/session-rhythm.md + shared/friction-log.md

---

## Step 1: Update goals.md

Read `.claude/memory/goals.md`. Update these sections:

**Current threads** — what is still in progress (not done, not blocked)
**Done this session** — what was completed (specific, not vague)
**Next actions** — top 3 concrete next steps only
**Open blockers** — anything that blocked progress

Write the updated file back. Do NOT skip even if the session was short.

---

## Step 2: Write Friction Log

Write `ops/observations/{YYYY-MM-DD}-{slug}-friction.md`:
```
---
date: {ISO date}
type: friction
---

## Harder than it should be
{or "None"}

## Repeated from last session
{or "None"}

## Took longer than expected
{or "None"}

## Environment is missing something
{or "None"}
```

Do NOT skip even if all answers are "None."
None entries are signal too — they confirm what's working.

---

## Step 3: Append Session Summary

Append to `.claude/memory/sessions/{date}-session.md`:
```yaml
---
date: {ISO date}
topics: [{what was worked on}]
---

{2-3 sentences: what changed, what was learned, what's next}
```

---

## Completion Rule — NON-NEGOTIABLE

Print the updated goals.md content.
Print the friction log content.
Show both files as proof.
Do not say "session saved" without showing the actual file content.
