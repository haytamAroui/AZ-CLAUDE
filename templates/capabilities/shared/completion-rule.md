---
name: completion-rule
description: >
  Completion Rule. Prevents premature task closure with vague language.
  Inject into every task. Never skip.
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
