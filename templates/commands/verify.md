---
name: verify
description: >
  Audit existing code against the project's coding rules (.claude/code-rules.md).
  Finds rule violations at file:line level, reports them, and optionally auto-fixes.
  Triggers on: "check my code", "verify code quality", "does this follow our rules",
  "check coding style", "audit coding standards", "find violations", "lint against rules",
  "check this file against rules", "are we following conventions", "code quality check",
  "verify standards", "rules check", "style violations", "rule violations".
  NOT triggered by: dependency audits (use /deps), security audit (use /sentinel),
  full project audit (use /audit), governance check (use /constitute).
argument-hint: "[file/dir/pattern — default: git changed files]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
---

# /verify — Audit Code Against Project Rules

$ARGUMENTS

---

## Purpose

Check existing files against `.claude/code-rules.md`.
Report every violation at `file:line` precision.
Optionally auto-fix violations.

This is NOT a linter replacement — it is a semantic rule checker.
Use it: before a PR, after a big refactor, when onboarding new code.

---

## Step 1: Load Rules

```bash
# Load project coding contract
cat .claude/code-rules.md 2>/dev/null | head -5

# Detect stack if no code-rules.md
grep -i "stack:" CLAUDE.md 2>/dev/null | head -2
```

**If `.claude/code-rules.md` exists:**
Read the full file — extract every `DO:` and `DO NOT:` rule by section.
Build a rule checklist:
```
Section: TypeScript
  R1: DO: explicit return types on all public functions
  R2: DO NOT: use `any` — replace with `unknown` or a proper type
  ...
```

**If no `code-rules.md`:**
State: "No `.claude/code-rules.md` found — run `/driven` to create your project coding contract."
Then load the matching per-stack capability as a fallback:
- TypeScript detected → load `capabilities/shared/rules/typescript.md`
- React detected → load `capabilities/shared/rules/react.md`
- Python detected → load `capabilities/shared/rules/python.md`
- Node/Express detected → load `capabilities/shared/rules/node.md`

State which rules are being checked and that they are defaults — not project-specific.

---

## Step 2: Identify Target Files

**If $ARGUMENTS provided:**
```bash
# Expand argument to file list
if [ -f "$ARGUMENTS" ]; then
  echo "single-file"
elif [ -d "$ARGUMENTS" ]; then
  find "$ARGUMENTS" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.js" | head -50
else
  # Treat as glob pattern
  ls $ARGUMENTS 2>/dev/null | head -50
fi
```

**If no $ARGUMENTS (default — git changed files):**
```bash
git diff --name-only HEAD 2>/dev/null | grep -E "\.(ts|tsx|js|jsx|py)$" | head -30
```

If no git diff and no argument → scan all source files:
```bash
find src/ lib/ app/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.js" \) 2>/dev/null | head -30
```

State the file list before proceeding.

---

## Step 3: Check Each Rule

For each file × each rule in code-rules.md:

**DO NOT rules (search for violations):**
Map each "DO NOT" to a search pattern, then grep:
```bash
# Example — DO NOT: use `any`
grep -n ":\s*any\b\|<any>\|as any" {file} 2>/dev/null

# Example — DO NOT: use `var`
grep -n "^\s*var " {file} 2>/dev/null

# Example — DO NOT: use `console.log` in production code
grep -n "console\.log" {file} 2>/dev/null
```

**DO rules (check absence — structural)**:
These require reading the file, not just grepping.
For example:
- "DO: explicit return types" → read exported functions, check if return type is present
- "DO: handle loading/error states" → read component, check for loading/error branch
- "DO: parameterized queries" → check that DB calls don't use string concatenation

Use Grep and Read tools — don't spawn agents for Step 3.

**Violation format:**
```
{file}:{line}  →  violates [{section}] {rule}
```

Example output:
```
src/auth/login.ts:23  →  violates [TypeScript] DO NOT: use `any`
src/auth/login.ts:45  →  violates [TypeScript] DO NOT: use non-null assertion `!`
src/components/Form.tsx:12  →  violates [React] DO NOT: use index as `key`
```

---

## Step 4: Report

After checking all files:

```
Code Rules Verification — {date}
Source: .claude/code-rules.md
Files checked: {N}
Rules checked: {N}

Violations Found: {total}
─────────────────────────────────
{file}:{line}  →  [{section}] {rule}
...

Most violated rule: {rule} ({N} occurrences)
Clean files: {N}/{total}
```

**If 0 violations:**
```
✓ All {N} files pass project coding rules.
Files: {N} | Rules: {N} | Zero violations.
```

---

## Step 5: Fix Offer

If violations found, ask (use **AskUserQuestion**):

"Found {N} violations across {M} files.

Options:
  a) Auto-fix — I'll fix each violation now (may require reading context)
  b) Show fix plan — list what would change, I'll implement on approval
  c) Export — write violations to .claude/verify-report.md
  d) Skip — I'll fix manually"

**If option a — Auto-fix:**
For each violation:
1. Read the file section around the violation
2. Apply the minimal fix that satisfies the rule
3. Verify the fix doesn't break adjacent logic
4. Show the diff before writing

After all fixes:
```bash
# Confirm nothing is broken
npm test 2>&1 | tail -5  # or pytest or whatever is the test runner
```

Report: "Fixed {N} violations. {M} files changed. Tests: {result}."

**If option c — Export report:**
Write `.claude/verify-report.md`:
```markdown
# Code Rules Verification Report — {date}

## Summary
Files: {N} | Violations: {N} | Rules: {N}

## Violations
| File | Line | Section | Rule |
|------|------|---------|------|
| {file} | {line} | {section} | {rule} |

## Most Violated Rules
1. {rule} — {N} occurrences
2. ...
```

---

## When to Run `/verify`

| Trigger | Command |
|---------|---------|
| Before opening a PR | `/verify` (checks git diff) |
| After a big refactor | `/verify src/` |
| Audit a specific file | `/verify src/auth/login.ts` |
| Full codebase scan | `/verify src/` |
| After `/driven` changes rules | `/verify` to see existing violations |
