---
name: clarify
description: >
  Resolve ambiguity in a feature request, spec, milestone, or task BEFORE any planning or coding.
  Triggers on: "clarify this", "what do you mean by", "I'm not sure what to build", "vague spec",
  "clarify the requirements", "before we plan", "let's get clear on", "help me define",
  "what exactly should it do", "I need to think through", "unclear requirements",
  "what are the acceptance criteria", "define the scope", "what's in scope", "what's out of scope",
  "who is this for", "what does done look like", "edge cases for", "what should happen when",
  "clarify before building", "let's clarify before we start".
  NOT triggered by: "add X", "implement X", "build X" alone — those go to /add directly.
argument-hint: "[feature description, milestone text, or spec to clarify]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
---

# /clarify — Resolve Before Planning

$ARGUMENTS

**EnterPlanMode** — read and think only. No file modifications.

---

## Purpose

Clarification runs BEFORE /blueprint and BEFORE /spec.
A vague input into /blueprint produces a vague plan. A vague plan produces wrong code.
This command produces a `.claude/specs/{slug}.md` with unambiguous, testable requirements.

---

## Step 1: Parse Input

If $ARGUMENTS is a milestone from plan.md → read `.claude/plan.md` to find it.
If $ARGUMENTS is a feature description → use it directly.
If $ARGUMENTS is blank → use **AskUserQuestion**: "What should I help clarify?"

Extract from the input:
- The goal (what problem this solves, for whom)
- Anything already specified (concrete details)
- Anything ambiguous or missing

---

## Step 2: Project Context

Read existing context to ask informed questions:

```bash
# Stack and domain
grep -i "domain:\|stack:\|scale:" CLAUDE.md 2>/dev/null | head -5

# Existing patterns similar to this feature
grep -ri "$ARGUMENTS" --include="*.ts" --include="*.py" --include="*.js" -l 2>/dev/null | head -5

# Current constitution (if exists)
cat .claude/constitution.md 2>/dev/null | head -20
```

---

## Step 3: Structured Interrogation

Ask ONLY the questions that are genuinely unresolved — maximum 5 questions at once.

Use **AskUserQuestion** with these categories (skip any already answered in $ARGUMENTS):

**Goal**
- What problem does this solve? Who experiences it?
- What does success look like from the user's perspective?

**Scope boundary**
- What is explicitly OUT of scope for this version?
- What's the minimal version that still solves the problem?

**Acceptance criteria**
- How will we know it's done? (list 2-3 concrete, testable criteria)
- What does a passing state look like vs. a failing state?

**Failure modes**
- What's the worst thing that could go wrong?
- What should happen when X fails? (fill in X from the feature)

**Constraints**
- Any performance, security, or backwards-compatibility requirements?
- Any existing code this must integrate with?

Do NOT ask about implementation details — only about behavior and requirements.

---

## Step 4: Write the Clarified Spec

After answers received, generate a slug from $ARGUMENTS:
```bash
SLUG=$(echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-40)
mkdir -p .claude/specs
```

Write `.claude/specs/${SLUG}.md`:

```markdown
# Spec: {feature title}
clarified: {today's date}
status: ready-for-blueprint

## Goal
{who uses this and what problem it solves — 1-2 sentences}

## User Stories
- As a {user type}, I want to {action} so that {outcome}
- As a {user type}, I want to {action} so that {outcome}

## Acceptance Criteria
1. {concrete, testable — "given X, when Y, then Z" format}
2. {concrete, testable}
3. {concrete, testable}

## Out of Scope
- {explicitly excluded item}
- {explicitly excluded item}

## Failure Modes
- {what happens when X fails — expected behavior}
- {what happens when Y fails — expected behavior}

## Constraints
- {performance / security / compatibility requirement, or "none"}

## Open Questions
- {any remaining unknowns — low priority, answer before implementation if possible}
```

---

## Step 5: Next Step

**ExitPlanMode**

Output:
```
Spec written: .claude/specs/{slug}.md
Acceptance criteria: N
Open questions: N (or "none")

Next: /blueprint .claude/specs/{slug}.md
```

If open questions remain → ask user to resolve them before /blueprint.
If no open questions → declare spec ready.

---

## Completion Rule

Show: the spec file path.
Show: acceptance criteria count.
Show: any open questions.
Do not write any code during /clarify — ever.
