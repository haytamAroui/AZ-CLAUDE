---
name: driven
description: >
  Generate or update the project coding rules contract (.claude/code-rules.md).
  Asks 6 questions about architecture, testing, code style, strictness, documentation,
  and git conventions — then generates a precise DO/DO NOT rule file tailored to
  the detected stack. Every /add and /fix reads this file before writing code.
  Triggers on: "coding rules", "code rules", "set coding standards", "define standards",
  "project standards", "how should we write code", "coding conventions", "code style",
  "what are the rules", "driven development", "project coding contract", "style guide",
  "coding contract", "define conventions", "set our rules", "project rules for code".
  Do NOT trigger for: governance/ethics/security rules (use /constitute), security audit (use /sentinel).
argument-hint: "[blank to create | 'update' to modify a section | 'show' to print current rules]"
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /driven — Build the Project Coding Contract

$ARGUMENTS

---

## Purpose

`.claude/code-rules.md` is the coding standards contract for this project.
It is written once, updated explicitly, and read by every `/add` and `/fix` before writing code.

**Precedence hierarchy — when conflicts arise:**
```
constitution.md  ← governance wins (security, architecture, forbidden deps)
code-rules.md    ← style wins (syntax, naming, testing patterns, git format)
```

If a rule in `code-rules.md` contradicts `constitution.md` — flag the conflict to the user. Never resolve silently.

---

## Step 1: Check Existing State

```bash
# Check for existing rules
cat .claude/code-rules.md 2>/dev/null | head -8

# Read stack from CLAUDE.md
grep -i "stack:" CLAUDE.md 2>/dev/null | head -3
```

**If $ARGUMENTS = "show":**
Print `.claude/code-rules.md` in full and stop.

**If $ARGUMENTS = "update":**
- Show current `.claude/code-rules.md`
- Use **AskUserQuestion**: "Which section to update? (architecture / testing / style / strictness / docs / git / naming)"
- Re-run only that section's interview question
- Overwrite only that section — leave the rest unchanged
- Show the diff and stop

**If `code-rules.md` exists and $ARGUMENTS is blank:**
Use **AskUserQuestion**: "`.claude/code-rules.md` already exists. Regenerate from scratch, or run `/driven update` to modify one section?"
- Regenerate → proceed to Step 2
- Update → switch to update flow above

**If no `code-rules.md`:** proceed to Step 2.

---

## Step 2: Detect Stack + Load Rule Library

Read `CLAUDE.md` Stack field. If empty or missing, run detection:

```bash
[ -f package.json ] && node -e "const p=require('./package.json');const d={...p.dependencies,...p.devDependencies};console.log(Object.keys(d).join(' '))" 2>/dev/null | tr ' ' '\n' | grep -E "^react$|^next$|^express$|^fastify$|typescript" | head -5
[ -f pyproject.toml ] && echo "python=yes"
[ -f requirements.txt ] && echo "python=yes"
```

State the detected stack before starting the interview. Example:
```
Detected stack: React 19, TypeScript, Node/Express, PostgreSQL
```

**Load per-stack rule library as the default rule baseline:**
- TypeScript detected → read `capabilities/shared/rules/typescript.md`
- React detected → read `capabilities/shared/rules/react.md`
- Python detected → read `capabilities/shared/rules/python.md`
- Node/Express detected → read `capabilities/shared/rules/node.md`

These rule libraries provide the curated DO/DO NOT defaults for each section of `code-rules.md`.
When the user selects "Default" in any interview question (Step 3), use the matching rules from the loaded library as the generated content for that section.
When the user provides custom answers, use those instead — the library is a fallback, not a requirement.

---

## Step 3: Interview — 6 Questions

Use **AskUserQuestion** — one question at a time. Never ask all at once.
Every question includes a **Default** option. If selected, use the industry-standard for the detected stack and note it in the file header.

**Q1 — Architecture:**
"What architecture pattern should this project follow?
  1. Clean Architecture (layers: domain / use-cases / infrastructure)
  2. DDD — Domain-Driven Design (aggregates, value objects, bounded contexts)
  3. MVC (models / views / controllers)
  4. Feature-based (co-locate everything per feature)
  5. Hexagonal / Ports & Adapters
  6. Default (recommended for your stack)"

**Q2 — Testing:**
"What is the testing philosophy?
  1. TDD mandatory — write the failing test first, always
  2. TDD optional — follow existing signals (CLAUDE.md rule + test files present)
  3. Test-after — implement first, test after
  4. No tests
  5. Default"

**Q3 — Code style:**
"Functional, OOP, or mixed?
  1. Functional — prefer pure functions, avoid classes, immutable data
  2. OOP — class-based patterns, encapsulation, inheritance where appropriate
  3. Mixed — functions for business logic, classes for infrastructure/services
  4. Default"

**Q4 — Strictness:**
"How strict are the type/lint rules?
  1. Strict — no `any`, all types explicit, no lint suppressions
  2. Moderate — types where it matters, `any` allowed at boundaries
  3. Pragmatic — types at system boundaries only
  4. Default"

**Q5 — Documentation:**
"What documentation is required in code?
  1. JSDoc / docstrings on all public functions and classes
  2. Inline comments for complex logic only
  3. None
  4. Default"

**Q6 — Git commit format:**
"What commit message format?
  1. Conventional commits — feat/fix/docs/refactor/test/chore(scope): description
  2. Free-form — no enforced format
  3. Custom — I'll specify the format
  4. Default"

If user selects Custom on Q6 → ask one follow-up: "What is your commit format? (example format)"

---

## Step 4: Conflict Check

```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "no constitution"
```

If constitution found: read `## Non-Negotiables` and `## Required Patterns`.
Cross-check each interview answer against those sections.

If conflict found, state it before generating:
```
CONFLICT DETECTED:
  constitution.md requires: {X}
  Your answer to Q{N}: {Y}

Resolve before continuing:
  (a) Keep the constitutional rule — I'll override your Q{N} answer
  (b) Update /constitute to allow {Y} — run /constitute after this
```

Wait for user resolution before proceeding to Step 5.

---

## Step 5: Generate `.claude/code-rules.md`

Write the file using answers from Step 3:

```markdown
# Code Rules — v1 (Generated {date})
# Stack: {detected stack}
# Architecture: {Q1} | Testing: {Q2} | Style: {Q3} | Strictness: {Q4}
# NOTE: These rules guide AI generation. Align your linters/CI to match.
# To update a section: /driven update | To regenerate: /driven

---

## Naming Conventions
{stack-specific — e.g., for TypeScript/React:}
- DO: variables and functions → camelCase
- DO: components and classes → PascalCase
- DO: constants → UPPER_SNAKE_CASE
- DO: database tables and columns → snake_case
- DO NOT: mix naming conventions within a layer

## {Primary language — TypeScript / Python / etc.}
{DO / DO NOT rules matching Q4 strictness}
{Max 8 rules}

## {Primary framework — React / Express / FastAPI / etc.}
{DO / DO NOT rules matching Q1 architecture + Q3 style}
{Max 8 rules}

## Testing
{DO / DO NOT rules matching Q2 philosophy}
{Max 6 rules}

## Documentation
{DO / DO NOT rules matching Q5}
{Max 4 rules}

## Git
{DO / DO NOT rules matching Q6}
{Max 4 rules}
```

Rules for generation:
- One rule per line. `DO:` or `DO NOT:` prefix only — no prose, no explanations.
- Maximum 8 rules per section. If more exist, keep the 8 highest-impact ones.
- Use the actual detected stack for section headings — not generic labels.
- Default answers: use the industry standard for the detected stack, note `# Default` in the header.

---

## Step 6: Confirm

Show:
```
Code rules written: .claude/code-rules.md
Stack: {detected}
Sections: {N} — naming · {lang} · {framework} · testing · docs · git
Total rules: {count}
Architecture: {Q1} | Testing: {Q2} | Style: {Q3}

Every /add and /fix will now read this file before writing code.

Suggested commit (do not run — confirm first):
  git add .claude/code-rules.md
  git commit -m "chore: add project coding rules contract"
```
