---
name: audit
description: >
  Review code for spec compliance then quality. Spec-first — never quality before spec.
  Triggers on: "review this", "review PR", "check my code", "code review", "review changes",
  "is this good", "check quality", "review before merge", "review before ship".
  Read-only — uses plan mode. Never modifies files.
argument-hint: "[PR number, file path, or 'current changes']"
disable-model-invocation: true
allowed-tools: Read, Grep, Bash, Glob
---

# /audit — Spec-First Code Review

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

## Copilot Mode Detection

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE`:
- The spec is `.claude/copilot-intent.md` (original product description)
- Review ALL project code against the intent, not just recent changes
- Check every milestone in `.claude/plan.md` marked `done` — verify it's actually implemented
- If review finds gaps → output them as new milestones (copilot will add to plan.md)
- Skip ExitPlanMode approval — output verdict directly

---

## Step 1a: Plan Consistency Check

```bash
[ -f .claude/plan.md ] && echo "plan=found" || echo "plan=missing"
```

If `plan=found`: run `/analyze plan` inline — scan for GHOST milestones before reviewing code quality.
Ghost milestones in the plan mean the audit is reviewing against a false baseline.
Output ghost findings in the report; do not block audit, but flag them clearly.

---

## Step 1b: Structural Context (intelligent-dispatch)

Load `shared/intelligent-dispatch.md`.

If problem-architect available — spawn it before reviewing:
```
Task: audit — structural context for spec compliance review
Current state: {what's changed, what the diff covers}
Available agents: {list}
Available skills: {list}
```
Use returned Team Spec to inject:
- `decisions.md` rulings to check against (architectural commitments)
- `patterns.md` conventions the code should follow
- `antipatterns.md` known failure patterns to scan for
- Risks flagged by architect → include in audit checklist

If problem-architect not installed: proceed with manual review using available memory files.

---

## Step 2: Spec Compliance (REQUIRED FIRST)

**Assume the implementation may be incomplete or optimistic. Verify independently.**
Do not trust any description of what was implemented — read the actual code.

Find the spec before touching code quality:
- Check $ARGUMENTS for acceptance criteria
- If copilot mode: read `.claude/copilot-intent.md` as the spec
- Read `goals.md` for the current session's requirements
- Check linked issue or PR description if available
- Read CLAUDE.md for project-level requirements

Verify independently — do not accept "I implemented X" — check that X is actually there:
- Read the files listed in the diff, not just the diff summary
- Run the relevant tests if possible: `bash -c "npm test 2>&1 | tail -20"` or equivalent
- Check edge cases the implementer may have skipped

Answer:
- Does this solve the stated problem? (verified, not assumed)
- Are all acceptance criteria met? (checked in code, not in description)
- Are edge cases handled?

Output:
```
Spec compliance: ✓ pass   or   ✗ fail
Violations: [specific — file:line — or "none"]
Verification method: [what you ran or read to confirm]
```

**STOP if spec compliance fails.** Do not review code quality when spec is violated.
Report violations only — no code quality feedback until spec is clean.

---

## Step 2b: Reward Hack Detection (if autonomous code was generated)

If `.claude/copilot-intent.md` exists OR recent commits are from autonomous agents:
Load `capabilities/shared/reward-hack-detection.md` and run the Static Checks (1-5).
Report any flags before proceeding to code quality.

---

## Step 3: Code Quality (only if Step 2 passes)

**IDE diagnostics**: use `mcp__ide__getDiagnostics` if available.
If unavailable or empty: skip — proceed to manual checks.
If returns results: include errors and warnings in the report.

```bash
[ -f .claude/code-rules.md ] && echo "code-rules=found" || echo "no code-rules"
```

**If code-rules found:** read `.claude/code-rules.md` — use it as the primary convention checklist for this step (naming, style, testing, git). It overrides generic CLAUDE.md conventions for style questions.

Check:
- Follows project conventions from CLAUDE.md (and code-rules.md if present)
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

## Content Audit (educational/documentation projects only)

Detect: `ls **/course* **/exam* **/quiz* **/lesson* knowledge/ docs/courses/ 2>/dev/null`

If educational content detected:
1. **Weight/percentage validation** — compare any stated percentages against source material
2. **Internal link check** — verify all markdown links resolve to existing files/anchors
3. **Content completeness** — check each section has substantive content (not just headers)
4. **Consistency check** — domain names, numbering, terminology used consistently
5. **Scroll depth warning** — flag any single page with 3000+ words (suggest splitting)

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
