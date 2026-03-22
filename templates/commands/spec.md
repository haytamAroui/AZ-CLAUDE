---
name: spec
description: >
  Write a structured, versioned spec for a feature BEFORE planning or coding.
  Triggers on: "write a spec", "spec this out", "create a spec", "spec for", "I need a spec",
  "document the requirements", "write requirements for", "define what to build",
  "spec-driven", "requirements document", "feature spec", "write the spec first",
  "spec before we plan", "what should we build", "define the feature",
  "product spec", "technical spec for", "write spec then plan",
  "spec before blueprint", "let's spec this".
  Use after /dream (intent exists) and before /blueprint (plan).
  NOT triggered by "add X" or "build X" alone.
argument-hint: "[feature or product description]"
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /spec — Write a Structured Spec

$ARGUMENTS

---

## Purpose

The spec is the primary artifact. Code is derived from it, not the reverse.
A spec produced here becomes the canonical input for /blueprint → /add → /audit.
Without a spec, /blueprint is guessing. With a spec, every milestone traces to a requirement.

**Workflow position:**
```
/dream → /spec → /clarify (if needed) → /blueprint → /add
```

---

## Copilot Mode Detection

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE`: read `.claude/copilot-intent.md` as the source — skip Phase 1 questions.
If `INTERACTIVE_MODE`: run Phase 1 as normal.

---

## Phase 1: Intake

If $ARGUMENTS is blank or vague, use **AskUserQuestion**:
- What are you building? (specific — "user login with JWT" not "auth")
- Who uses it? (role/persona)
- What's the single most important outcome for the first version?

If a spec file already exists for this feature:
```bash
ls .claude/specs/ 2>/dev/null
```
Show existing spec and ask: "Use this as a base, or start fresh?"

---

## Phase 2: Context Scan

```bash
# Understand what already exists
grep -i "domain:\|stack:\|scale:" CLAUDE.md 2>/dev/null | head -5

# Find related existing code
grep -ri "$(echo "$ARGUMENTS" | cut -d' ' -f1-3)" --include="*.ts" --include="*.py" --include="*.js" -l 2>/dev/null | head -8

# Read constitution if it exists
cat .claude/constitution.md 2>/dev/null | head -30
```

---

## Phase 3: Write the Spec

Generate slug and create spec file:

```bash
SLUG=$(echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-40)
NEXT_N=$(ls .claude/specs/ 2>/dev/null | grep -c '^' || echo 0)
N=$(printf '%02d' $((NEXT_N + 1)))
mkdir -p .claude/specs
SPEC_FILE=".claude/specs/${N}-${SLUG}.md"
```

Write `$SPEC_FILE`:

```markdown
# Spec: {feature title}
id: {N}-{slug}
created: {today's date}
status: draft
version: 1

---

## Goal
{1-2 sentences — the problem this solves, for whom, and why now}

## User Stories
- As a {user type}, I want to {action} so that {outcome}
- As a {user type}, I want to {action} so that {outcome}
- As a {user type}, I want to {action} so that {outcome}

## Acceptance Criteria
All criteria must be independently verifiable — "given X, when Y, then Z" format.

1. Given {precondition}, when {action}, then {expected outcome}
2. Given {precondition}, when {action}, then {expected outcome}
3. Given {precondition}, when {action}, then {expected outcome}

## Data Model Changes
{Describe any new or modified data structures, fields, tables, or schemas.}
{If none: "No data model changes."}

## API / Interface Changes
{Describe new or modified endpoints, function signatures, events, or contracts.}
{If none: "No API changes."}

## Out of Scope (this version)
- {explicitly excluded}
- {explicitly excluded}
- {explicitly excluded}

## Failure Modes
| Scenario | Expected behavior |
|----------|-------------------|
| {X fails} | {what should happen} |
| {Y is missing} | {what should happen} |

## Constraints
- Performance: {requirement or "none"}
- Security: {requirement or "none"}
- Backwards compatibility: {requirement or "none"}
- Dependencies: {blocked by or requires}

## Open Questions
{List any unresolved decisions. Run /clarify to resolve before /blueprint.}
- [ ] {question}
```

---

## Phase 4: Validate

Before saving, check:
- At least 3 acceptance criteria present
- Out of scope section is not empty (forces explicit scoping)
- No open questions remain (or mark spec as `draft` if they do)

If any open questions remain → set `status: draft` and recommend `/clarify {spec-file}`.
If all criteria met → set `status: ready-for-blueprint`.

**Spec Reviewer Gate** (if `spec-reviewer` agent is installed):

```bash
ls .claude/agents/spec-reviewer.md 2>/dev/null && echo "agent=found" || echo "agent=missing"
```

If `agent=found` AND status is `ready-for-blueprint`: spawn spec-reviewer:
```
Review spec file: {SPEC_FILE}
```

- Verdict `APPROVED` → proceed to Completion Rule
- Verdict `NEEDS_CLARIFY` → downgrade status to `draft`, output spec-reviewer feedback,
  recommend `/clarify {spec-file}`
- Verdict `INCOMPLETE` → do NOT write the file yet, list missing sections and re-run Phase 3

If `agent=missing`: skip gate, trust manual validation above.

---

## Completion Rule

Show:
1. Spec file path: `.claude/specs/{N}-{slug}.md`
2. Acceptance criteria count
3. Status: `draft` or `ready-for-blueprint`
4. Open questions count

If `ready-for-blueprint`:
```
Next: /blueprint .claude/specs/{N}-{slug}.md
```

If `draft`:
```
Next: /clarify .claude/specs/{N}-{slug}.md  (resolve open questions first)
```

Do not write any implementation code during /spec.
