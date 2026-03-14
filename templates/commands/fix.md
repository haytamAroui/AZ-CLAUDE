---
name: fix
description: Reproduce → investigate root cause → hypothesize → fix and verify. Never guesses. Never says "should work".
argument-hint: "[error message, failing test, or bug description]"
disable-model-invocation: true
allowed-tools: Read, Grep, Bash, Edit, Write
---

# /fix — 4-Phase Debugging Protocol

$ARGUMENTS

Load: shared/tdd.md + shared/completion-rule.md before starting.

---

## Phase 1: REPRODUCE

Confirm the bug exists before touching anything.
- Run the failing test or command exactly as described
- Paste the actual output — never summarize it
- If you cannot reproduce it: stop. Ask for exact steps. Do not guess.

No investigation before reproduction. No fix before root cause.

---

## Phase 2: INVESTIGATE

Read the code. Do not guess.
- Locate the failure point: `file:line`
- Read the actual code at that location
- Read what calls it and what it calls
- Check recent changes: `git log --oneline -10 -- {file}`
- Read test framework config: `package.json` / `requirements.txt` / `Cargo.toml`

Antipattern check — if `antipatterns.md` exists, read it before proceeding.

Rules:
- No fix hypothesis before root cause is confirmed in code
- No "I think the problem is" without reading the actual file
- No changes to files not involved in the failure

---

## Phase 3: HYPOTHESIZE

One root cause. Not a list.

State exactly:
- What is broken: `file:line`
- Why it breaks: the mechanism, not the symptom
- What the fix is: described before writing any code

If you have multiple hypotheses: pick the most likely one. Test it first.
Do not write multiple fixes speculatively.

---

## Phase 4: FIX

1. Write the minimal change that addresses the root cause
2. Run the test — show the actual output
3. Run the full test suite — show the result
4. Reference every change as `file:line — what changed and why`

---

## Self-Correction Loop

If tests still fail after the first fix:

**Attempt 2 — before asking the user:**
- Do NOT change more code speculatively
- Re-read the new error — same error or different?
  - Different error → new failure point → go back to Phase 2
  - Same error → wrong root cause → re-read the code, find what you missed
- Make one targeted change. Run tests. Show output.

**After 2 failed attempts — stop:**
Do not guess a third time. Present findings:
- What you tried (attempt 1 + attempt 2, specific changes)
- What the error says now (exact output)
- Where you are stuck (`file:line`)
- What specific information from the user would unblock you

The user is the last resort, not the first.

---

**Completion Rule — NON-NEGOTIABLE:**
Never say "this should be fixed", "probably works now", "I think this resolves it."
Show the passing test output. If tests aren't passing: stay in progress.
"Show the output or stay in progress."
