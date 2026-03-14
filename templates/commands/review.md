---
name: review
description: >
  Review code for spec compliance then quality. Spec-first — never quality before spec.
  Triggers on: "review this", "review PR", "check my code", "code review", "review changes",
  "is this good", "check quality", "review before merge", "review before ship".
  Read-only — uses plan mode. Never modifies files.
argument-hint: "[PR number, file path, or 'current changes']"
disable-model-invocation: true
allowed-tools: Read, Grep, Bash, Glob
---

# /review — Spec-First Code Review

$ARGUMENTS

---

**EnterPlanMode** — review is read-only. No file modifications during review.

---

## Step 1: Find What to Review

If $ARGUMENTS = PR number → `git show` or `gh pr diff {N}`
If $ARGUMENTS = file → read that file
If $ARGUMENTS = "current changes" or blank → `git diff HEAD`

```bash
git diff HEAD --stat
git diff HEAD
```

---

## Step 2: Spec Compliance (REQUIRED FIRST)

Find the spec before touching code quality:
- Check $ARGUMENTS for acceptance criteria
- Read `goals.md` for the current session's requirements
- Check linked issue or PR description if available
- Read CLAUDE.md for project-level requirements

Answer:
- Does this solve the stated problem?
- Are all acceptance criteria met?
- Are edge cases handled?

Output:
```
Spec compliance: ✓ pass   or   ✗ fail
Violations: [specific — file:line — or "none"]
```

**STOP if spec compliance fails.** Do not review code quality when spec is violated.
Report violations only — no code quality feedback until spec is clean.

---

## Step 3: Code Quality (only if Step 2 passes)

**IDE diagnostics**: use `mcp__ide__getDiagnostics` if available.
If unavailable or empty: skip — proceed to manual checks.
If returns results: include errors and warnings in the report.

Check:
- Follows project conventions from CLAUDE.md
- No security anti-patterns (see shared/security.md)
- If developer domain: tests exist for new behavior (TDD Iron Law)
- Minimum necessary complexity — no over-engineering
- Read antipatterns.md if it exists: `cat .claude/memory/antipatterns.md 2>/dev/null`

Output:
```
Code quality: ✓ pass   or   N issues found
Issues:
  - file:line — [what] — [blocking / suggestion]
```

**Blocking** = must fix before merge (security, broken behavior, missing tests)
**Suggestion** = optional improvement (style, naming, minor refactor)

---

## Completion Rule

**ExitPlanMode**

Final report format:
```
Spec:    ✓ pass (N criteria met)   or   ✗ fail — [violations]
Quality: ✓ pass                    or   N issues — [list with file:line]
IDE:     ✓ 0 errors                or   N errors [list]

Verdict: APPROVE / REQUEST CHANGES / NEEDS SPEC FIRST
```

Do not say "looks good" without showing the spec check output.
