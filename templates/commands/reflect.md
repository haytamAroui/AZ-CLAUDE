# /reflect — Self-Improving CLAUDE.md

**Purpose**: Analyze conversation patterns and friction to propose improvements to CLAUDE.md rules.
Unlike /evolve (which improves the environment structure), /reflect improves Claude's *behavior* by
updating the instructions that guide it.

---

## Step 1: Gather Evidence

Read these files to find friction patterns:

1. **Friction logs** — `ops/observations/*-friction.md` (last 5 files)
2. **goals.md** — look for repeated blockers or stalled threads
3. **Session logs** — `.claude/memory/sessions/` (last 3 sessions)
4. **Current CLAUDE.md** — the rules file being evaluated

If friction logs are empty or don't exist, analyze the current conversation transcript instead:
- Where did you hesitate, backtrack, or give a wrong answer?
- Where did the user correct you?
- Where did you over-engineer or under-deliver?

---

## Step 2: Identify Patterns

Look for these categories:

| Category | Signal | Example |
|----------|--------|---------|
| **Missing rule** | Same mistake repeated across sessions | Always forgetting to run tests |
| **Vague rule** | Rule exists but doesn't prevent the mistake | "Write good tests" doesn't say which framework |
| **Contradicting rules** | Two rules conflict | "Be concise" vs "Explain thoroughly" |
| **Dead rule** | Rule refers to something that no longer exists | References a deleted file or old convention |
| **Missing routing** | Task type has no dispatch entry | User asks for something not in Quick dispatch |

---

## Step 3: Propose Changes

For each finding, propose a specific CLAUDE.md edit:

```
Finding: [what's wrong]
Evidence: [which friction log / conversation turn showed this]
Proposed change:

  ## Rules
  + 5. **Tests** — Run `npm test` before every commit. Never skip.

  OR

  Quick dispatch:
  + - /reflect → commands/reflect.md (self-improving CLAUDE.md)
```

**Rules for proposals:**
- One finding = one change. Don't bundle.
- Show the exact text to add/remove/modify.
- Never remove a rule the user explicitly added.
- Never add a rule that contradicts an existing one without flagging the conflict.

---

## Step 4: Review with User

Present all findings as a numbered list. Wait for approval.

```
Reflection found 3 improvements:

1. MISSING RULE — No test framework specified
   Evidence: 3 sessions used Jest, 1 used Vitest by mistake
   Proposed: Add "5. **Tests** — Use Jest. Run `npm test` before commits."

2. DEAD RULE — Rule 4 references `shared-skills/` which was removed
   Proposed: Remove rule 4.

3. MISSING ROUTING — /reflect not in Quick dispatch
   Proposed: Add routing entry.

Apply which? (all / 1,2 / none)
```

---

## Step 5: Apply

For each approved change:
1. Edit CLAUDE.md with the exact proposed text
2. If a routing entry was added, verify the command file exists
3. Run tests if the project has them

---

## Step 6: Log

Append to `ops/observations/{date}-reflect.md`:

```markdown
# Reflection — {date}
Applied {N} of {M} proposed changes.

## Changes
- [applied] {finding 1 summary}
- [skipped] {finding 2 summary} — reason: {user said no / conflict}
```
