---
name: session-rhythm
description: >
  Session Rhythm: ORIENT → WORK → PERSIST. Structures every session.
  Triggers on: session start, new conversation, beginning of work.
tokens: ~80
---

## Session Rhythm

### ORIENT (first response of every session)
1. Read `.claude/memory/goals.md` — know what's active before touching anything
2. Read last 3 friction logs in `ops/observations/` if they exist
3. State: current thread, next action, any blockers
4. Progressive disclosure: lead with what matters now, not the full history

### WORK
- Reference code as `file:line` — never describe location in prose
- Apply Completion Rule to every task (see shared/completion-rule.md)
- Apply TDD Iron Law to every code task (see shared/tdd.md)
- If a task blocks: name the blocker, don't guess around it

### PERSIST (last response before session ends — or run /persist)
1. Update `.claude/memory/goals.md` — current threads, done, next actions, blockers
2. Write friction log to `ops/observations/{date}-friction.md`
3. Append session summary to `.claude/memory/sessions/`

Do not skip PERSIST even if the session was short.
Session state lost = next session starts blind.
