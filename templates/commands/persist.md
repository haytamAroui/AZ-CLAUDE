---
name: persist
description: End the session — update goals.md, write friction log, append session summary. Run before closing.
disable-model-invocation: true
allowed-tools: Read, Write, Edit
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

## Step 2: Write Friction Log (only if there's real friction)

Review the session. If ANY of the four categories below apply, write `ops/observations/{YYYY-MM-DD}-{slug}-friction.md`:
```
---
date: {ISO date}
type: friction
---

## Harder than it should be
{what was harder}

## Repeated from last session
{what repeated}

## Took longer than expected
{what was slow}

## Environment is missing something
{what's missing}
```

If ALL four categories are "None" — skip this file entirely. No friction = no file.
Only write when there's a real signal worth capturing.

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
