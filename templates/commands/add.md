---
name: add
description: >
  Add a new feature, endpoint, component, function, page, or capability.
  Triggers on: "add feature", "implement X", "build X", "create X", "new endpoint",
  "new component", "new page", "new function", "add support for", "I need X to do Y".
  TDD opt-in (signal-based). Follows existing patterns — never invents new ones.
argument-hint: "[what to add — be specific]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /add — Add a Feature

$ARGUMENTS

Load: shared/tdd.md + shared/completion-rule.md

---

## Pre-Flight: Constitution + Spec Check

```bash
# Check constitution
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "no constitution"

# Check if $ARGUMENTS is a spec file
[ -f "$ARGUMENTS" ] && grep -q "Acceptance Criteria" "$ARGUMENTS" && echo "spec-mode" || echo "inline-mode"
```

**If constitution found:**
Read `## Non-Negotiables` and `## Required Patterns` before implementing.
Keep these rules visible throughout Phases 2-4. Flag any implementation choice that would violate them.

**If spec file provided** (e.g., `/add .claude/specs/02-payment.md`):
- Skip Phase 1 clarification — the spec IS the clarification
- Load acceptance criteria as the implementation checklist
- Each AC becomes a task in TaskCreate
- Phase 3 (TDD): write tests that directly verify each AC
- Phase 5 (Verify): output maps to ACs explicitly ("AC1 ✓", "AC2 ✓", etc.)

---

## Pre-Flight Analysis (intelligent-dispatch)

Load `shared/intelligent-dispatch.md`.

If task will touch 3+ files OR crosses module boundaries:
→ Spawn problem-architect (see intelligent-dispatch protocol)
→ Use returned Team Spec: load skills, pre-read files, check pre-conditions, note risks
→ If Structural Decision: YES → run /debate before Phase 4

If problem-architect not installed: proceed with Phase 1 as normal (manual scan in Phase 2).

---

## Copilot Mode Detection

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE`:
- Skip AskUserQuestion — the milestone description from plan.md IS the spec
- Skip the Complexity Gate — copilot commits to the minimal approach by default
- Read `.claude/plan.md` for the current milestone's `Files:` and `Commit:` fields
- Read `.claude/memory/patterns.md` for conventions to follow
- Proceed directly to Phase 2 (Understand Before Writing)

If `INTERACTIVE_MODE`: run Phase 1 as normal.

---

## Phase 1: Clarify Scope

If $ARGUMENTS is blank or vague, use **AskUserQuestion**:
- What exactly needs to be added? (specific — "user login with JWT" not "auth")
- Where does it fit? (new file or which existing file)
- What does "done" look like? Acceptance criteria.

Do not proceed with a vague request. Scope creep starts at intake.

### Complexity Gate
Estimate how many files this feature will touch. If 4+ files:
1. Ask 2-3 clarifying questions BEFORE designing anything:
   - Edge cases: "What happens when X fails?"
   - Integration: "Should this work with existing Y?"
   - Constraints: "Any performance/security requirements?"
2. Explore the codebase first (Phase 2) — then ask informed questions
3. For complex features, present 2 approaches with trade-offs:
   - **Minimal**: smallest change, maximum reuse of existing patterns
   - **Clean**: better architecture, more files, easier to extend later
   - Ask which approach the user prefers before implementing

Do NOT skip the complexity gate for multi-file features. Building the wrong
thing fast is slower than asking 3 questions first.

**TaskCreate** before starting:
- `Understand existing pattern`
- `Write failing test` (if TDD active — skip otherwise)
- `Implement`
- `Verify`

---

## Phase 2: Understand Before Writing

Read surrounding code — never invent a pattern that already exists.

1. Find the closest existing feature similar to what's being added:
```bash
grep -r "{keyword from $ARGUMENTS}" --include="*.ts" --include="*.py" --include="*.js" -l | head -5
```
2. Read the file it lives in — understand naming, structure, error handling
3. Check for relevant types or interfaces: `grep -r "interface\|type\|schema" {file}`
4. Read CLAUDE.md: is TDD active? What's the domain and stack?
5. If complexity gate triggered (4+ files): present findings and ask
   clarifying questions NOW, informed by what you just read

**TaskUpdate** `Understand existing pattern` → completed

---

## Phase 3: Test First (opt-in — check signals first)

**Skip this phase for Writer / Research / Business domains.**

For developer domain, check BOTH signals before enforcing test-first:

```bash
# Signal 1: CLAUDE.md has an explicit TDD rule
grep -qi 'tdd\|test.first\|test-first\|failing test' CLAUDE.md && echo "TDD rule found" || echo "No TDD rule"

# Signal 2: test files exist in the project
find . \( -name '*.test.*' -o -name '*.spec.*' -o -name 'test_*.py' \) -not -path '*/node_modules/*' | head -1
```

**Both signals present → TDD protocol active. Write the failing test.**
**Either missing → skip Phase 3. Suggest tests after implementation if none exist.**

If TDD active: write the failing test following the exact pattern of nearby tests.
Run it — confirm it fails for the RIGHT reason:

```bash
{test command} {test file}; EXIT=$?
echo "Exit: $EXIT — expected non-zero (failing test)"
if [ $EXIT -eq 0 ]; then echo "TEST PASSES BEFORE IMPL — wrong test, rewrite it"; fi
```

Show the failure output. Do not proceed until the test fails correctly.

**TaskUpdate** `Write failing test` → completed (or skipped with reason)

---

## Phase 4: Implement

Write the minimal code to make the test pass.
Follow the pattern from Phase 2 exactly — no new patterns without a reason stated explicitly.

Reference every change: `file:line — what changed and why`

---

## Phase 5: Verify

Run the full test suite:

```bash
{test command}; EXIT=$?
echo "Exit: $EXIT"
if [ $EXIT -ne 0 ]; then echo "FAILED — do not proceed. Run /fix."; fi
```

If EXIT ≠ 0 → apply /fix self-correction loop. Do not declare done with a failing suite.

**TaskUpdate** all remaining steps → completed

---

## Completion Rule

Show:
1. The new test — `file:line`
2. The new implementation — `file:line`
3. Full test suite output (passing)

Do not say "feature added" without showing the test output.
