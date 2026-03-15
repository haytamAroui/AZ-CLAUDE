---
name: completion-rule
description: >
  Load when about to say "should work", "probably passes", "looks correct",
  "I think this is done", or "it should be fine". Load before closing any task.
  Load before showing a code change without running it first.
  If there is even a 1% chance you are about to claim completion — load this.
tokens: ~40
---

## Completion Rule — NON-NEGOTIABLE

Never say:
- "This should be fixed"
- "It probably works now"
- "I think this resolves it"
- "Should work"
- "Probably passes"

These phrases mean: stay in progress. Do not mark the task done.

## What Done Looks Like
- Show the actual test output (passing)
- Show the actual command output
- Reference the file:line that changed and why
- If tests aren't passing → stay in progress, keep working

"Show the output or stay in progress."
