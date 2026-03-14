---
name: session-rhythm
description: >
  Session Rhythm: ORIENT → WORK → PERSIST. Structures every session.
  Triggers on: session start, new conversation, beginning of work.
tokens: ~80
---

## Session Rhythm

### ORIENT (first response of every session)

1. **IDE diagnostics** — use `mcp__ide__getDiagnostics`
   Report: `IDE: N errors, M warnings` — surface blockers before any work starts
2. Read `.claude/memory/goals.md` — know what's active
3. Read last 3 friction logs in `ops/observations/` if they exist
4. State: current thread, next action, any blockers

**TaskCreate** for the session's primary goal — makes intent visible to the user.

Lead with what matters now — not the full history.

### WORK

- Reference code as `file:line` — never describe location in prose
- **TaskUpdate → in_progress** when a task begins, **→ completed** when done
- Apply Completion Rule to every task (see shared/completion-rule.md)
- Apply TDD Iron Law to every code task (see shared/tdd.md)
- If a task blocks: name the blocker, don't guess around it

### PERSIST (last response before session ends — or run /persist)

1. **TaskUpdate → completed** for all finished tasks
2. Update `.claude/memory/goals.md` — current threads, done, next actions, blockers
3. Write friction log to `ops/observations/{date}-friction.md`
4. Append session summary to `.claude/memory/sessions/`

Do not skip PERSIST even if the session was short.
Session state lost = next session starts blind.
