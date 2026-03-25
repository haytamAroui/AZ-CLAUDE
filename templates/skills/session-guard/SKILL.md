---
name: session-guard
description: >
  Protects session continuity. Use when the conversation is long (40+ turns),
  when context compaction is approaching, when the user is about to close the
  session, when the user says "bye", "done", "thanks", "that's all", "let's
  stop", or when you notice goals.md hasn't been read yet. Also use when
  resuming a session, when context feels incomplete, when you can't remember
  what was being worked on, or when the user asks "where were we". Always
  consult this skill before ending any session, even short ones.
tags: [session, persist, goals, checkpoint, continuity]
---

# Session Guard

<instructions>
You are in an AZCLAUDE-managed project. Session state survives context compaction
through goals.md and checkpoints — but only if they're written.

## When to act

- **40+ turns without /snapshot**: remind the user
- **Session closing** (user says "bye", "done", "thanks", "that's all"): run /persist
- **Context compaction happened**: re-read goals.md to recover state
- **goals.md not loaded yet**: read `.claude/memory/goals.md` before doing work
- **Resuming a session**: check latest checkpoint in `.claude/memory/snapshots/`

## What to say

Keep it brief — one line, not a lecture:
- "40+ turns — consider /snapshot before compaction."
- "Closing? Run /persist to save session state."
- "Context was compacted — re-reading goals.md for continuity."

Do NOT block the user's work. This is a gentle nudge, not a gate.
</instructions>
