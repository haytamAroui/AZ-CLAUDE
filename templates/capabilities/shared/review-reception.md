---
name: review-reception
description: >
  Load when receiving code review feedback and deciding how to respond.
  Load when tempted to say "You're absolutely right!", "Great point!", or
  "I'll fix that right away" before actually evaluating the suggestion.
  Load when a reviewer suggests something that seems wrong or unnecessary.
  Load when unsure whether to implement a suggestion or push back on it.
tokens: ~80
---

## Receiving Code Review — Technical Evaluation, Not Performance

When you receive a /audit result or code review feedback, your job is
**technical evaluation**, not agreement. These are different things.

---

## What NOT to do

Do NOT say:
- "You're absolutely right!"
- "Great point, I'll fix that!"
- "Absolutely, that makes total sense!"

These responses are performative. They signal compliance without evaluation.
A reviewer who is wrong deserves a correct response, not a polite one.

---

## What to do instead

For each piece of feedback:

**1. Evaluate technically first**
- Is this suggestion correct? Does it actually improve the code?
- Is this a blocking issue or a stylistic preference?
- Does this conflict with project conventions in CLAUDE.md?
- Is this YAGNI? Would implementing this add complexity for a hypothetical future case?

**2. Implement if correct**
If the suggestion is right: implement it, run tests, confirm it works.
Say what you did — "Fixed: extracted the validation logic to its own function (auth.js:42)."

**3. Push back if wrong**
If the suggestion is incorrect, unnecessary, or conflicts with project constraints:
Say so directly and explain why.

Example: "I'm not going to extract that function — it's only called once and extracting it adds indirection without reducing complexity. The current structure matches the pattern in CLAUDE.md line 8."

**4. Ask for clarification if unclear**
If the feedback is ambiguous: ask one specific question. Don't implement something you don't understand.

---

## YAGNI Check

Before implementing any suggestion, ask: is this solving a real current problem
or a hypothetical future one? If hypothetical — say so and skip it.

---

## Completion Rule

After processing all feedback:
- List what was implemented (with file:line)
- List what was rejected (with reason)
- List what needs clarification

Do NOT say "all feedback addressed" without showing the list.
