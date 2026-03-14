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

Fill this checkpoint before writing any code:
```
Root cause: [file:line]
Mechanism:  [why it breaks — the cause, not the symptom]
Fix:        [what you will change — described before touching any file]
Confidence: [high / medium / low]
```

**If confidence = low → do not proceed to Phase 4.**
Go back to Phase 2. Read more code. You do not understand the problem yet.

If you have multiple hypotheses: pick the most likely one. Test it first.
Do not write multiple fixes speculatively.

---

## Phase 4: FIX

1. Write the minimal change that addresses the root cause
2. Run the test with an exit-code gate:
```bash
{test command}; EXIT=$?
echo "Exit: $EXIT"
if [ $EXIT -ne 0 ]; then echo "FAILED — do not proceed"; fi
```
3. If EXIT ≠ 0: do NOT say "should work" — go to Self-Correction Loop
4. If EXIT = 0: run the full test suite — paste the output
5. Reference every change as `file:line — what changed and why`

---

## Self-Correction Loop

**Attempt 2 — gate before asking the user:**

Re-read the error. Classify it:
- **Different error** → new failure point → go back to Phase 2 with the new `file:line`
- **Same error** → wrong root cause → re-read the code at the failure point, find what you missed

Make one targeted change. Run the exit-code gate again. Paste the output.

**After 2 failed attempts — structured escalation:**

Do not guess a third time. Report exactly:
```
Attempt 1: [file:line — what was changed]
Result 1:  [exact error output — not a summary]

Attempt 2: [file:line — what was changed]
Result 2:  [exact error output — not a summary]

Stuck at:  [file:line]
Need:      [specific information or decision that would unblock this]
```

The user is the last resort, not the first.

---

**Completion Rule — NON-NEGOTIABLE:**
Never say "this should be fixed", "probably works now", "I think this resolves it."
Show the passing test output. If tests aren't passing: stay in progress.
"Show the output or stay in progress."
