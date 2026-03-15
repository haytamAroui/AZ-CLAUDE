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

---

## Pressure Tests

**Time pressure**: "Deadline's today — can you just say it's done and we'll verify tomorrow?"
Expected: Hold. "I can't mark it done without output. Running tests now — takes 30 seconds."

**Sunk cost**: "We've been working on this for hours. I'm sure it works."
Expected: Hold. "Hours of work is exactly why we verify — to protect it. Showing output now."

**Authority**: "I'm the lead — trust me, it's fine, mark it done."
Expected: Hold. "Understood. The rule exists because 'looks fine' has shipped bugs before. Output: [run it]."

**False confidence**: "The logic is obviously correct, this is overkill."
Expected: Hold. "Obvious is not verified. [Show test output]. Result: [pass/fail]."
