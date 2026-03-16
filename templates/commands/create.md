---
name: create
description: >
  Build a new command/skill with proper frontmatter, test cases, and evaluation.
  Guided workflow: intent → draft → test → iterate. Creates production-quality commands.
  Triggers on: "create skill", "new command", "build a skill for", "make a command",
  "I want a slash command that", "create a workflow for".
argument-hint: "[what the skill should do]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /create — Skill Creator

$ARGUMENTS

---

## Phase 1: Intent Capture

If $ARGUMENTS is blank or vague, use **AskUserQuestion**:
- What should this skill do? (specific action, not category)
- When should it trigger? (what phrases or situations)
- What tools does it need? (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch)
- Should it modify files or just report? (read-only vs read-write)

---

## Phase 2: Check for Duplicates

Before creating, check if something similar exists:

```bash
# Check project commands
grep -li "{keyword}" .claude/commands/*.md 2>/dev/null

# Check shared skills
grep -li "{keyword}" ~/shared-skills/*.md 2>/dev/null

# Check capabilities
grep -i "{keyword}" .claude/capabilities/manifest.md 2>/dev/null
```

If a match exists: show it. Ask if the user wants to extend it instead of creating new.

---

## Phase 3: Draft the Skill

Create `.claude/commands/{name}.md` with this structure:

```markdown
---
name: {name}
description: >
  {What it does. Include 5+ trigger phrases for reliable invocation.}
argument-hint: "[{what args it takes}]"
disable-model-invocation: true
allowed-tools: {tools list}
---

# /{name} — {Title}

$ARGUMENTS

---

## Step 1: {First action}
{Clear instructions — what to read, check, or prepare}

---

## Step 2: {Main action}
{The core work — what to do, how to do it}

---

## Step 3: {Verify}
{How to confirm it worked — show output, run tests}

---

## Completion Rule
{What to show as proof — never say "done" without evidence}
```

**Guidelines:**
- Description must have 5+ trigger phrases (Claude under-triggers with fewer)
- Use `disable-model-invocation: true` unless the skill needs free-form reasoning
- Include a completion rule — every skill must show proof of work
- Use `$ARGUMENTS` to accept user input
- Include **AskUserQuestion** fallback for blank arguments
- Match the style of existing commands in this project

---

## Phase 4: Generate Test Cases

Create 2-3 test prompts to verify the skill works:

```bash
mkdir -p .claude/evals
```

Write `.claude/evals/{name}-tests.md`:

```markdown
# Test Cases: /{name}

## Test 1: Basic usage
Prompt: "/{name} {typical argument}"
Expected: {what should happen}

## Test 2: No arguments
Prompt: "/{name}"
Expected: AskUserQuestion should trigger

## Test 3: Edge case
Prompt: "/{name} {unusual input}"
Expected: {graceful handling}
```

---

## Phase 5: Validate

1. Read the created skill file — verify frontmatter is correct
2. Check it appears in the commands list:
```bash
ls .claude/commands/{name}.md
```
3. Verify description has 5+ trigger phrases
4. Verify completion rule exists

---

## Phase 6: Register (if needed)

If this is a command that should ship with azclaude (not just this project):
- Add to `COMMANDS` array in `bin/cli.js`
- Add to `templates/commands/`
- Add tests to `tests/test-features.sh`
- Add dispatch entry to `templates/CLAUDE.md`

For project-only skills: no registration needed — it's already in `.claude/commands/`.

---

## Completion Rule

Show:
1. The created skill file content
2. The test cases
3. How to invoke: `/{name} [args]`

Do not say "skill created" without showing the file content.
