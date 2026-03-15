---
name: friction-log
description: >
  Load when the session had something hard, slow, or frustrating. Load when
  you hit the same problem twice. Load when a task took longer than expected.
  Load when about to close a session and want to record what was painful.
  Load when the user says "that was annoying" or "why is this so hard".
tokens: ~60
---

## Friction Log Format

Write to `ops/observations/{YYYY-MM-DD}-{slug}-friction.md`:
```
---
date: {ISO date}
type: friction
domain: {developer|writer|researcher|compliance}
---

# Friction — {date}

## Harder than it should be
{describe or "None"}

## Repeated from last session
{describe or "None"}

## Took longer than expected
{describe or "None"}

## Environment is missing something
{describe or "None"}
```

Do NOT skip this even if all answers are "None."
The absence of friction is itself a signal.

## Domain-Specific Signals to Watch
- **Developer**: test failures that shouldn't happen, missing scaffolding, repeated setup steps
- **Writer**: continuity errors, structure resets, context loss between sections
- **Researcher**: claims made without a source, repeated lookups for same fact
- **Compliance**: obligation missed, wrong vocabulary used, assessment not documented
