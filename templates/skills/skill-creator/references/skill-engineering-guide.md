# Skill Engineering Guide — Full Reference

Based on: Anthropic's skill-development docs, DeerFlow's skill architecture,
ui-ux-pro-max (42K stars), Superpowers (42K stars), 7 academic papers,
and the Vishnyakova Context Engineering Pyramid.

---

## The Rule

A skill is not documentation. A skill is not a prompt. A skill is a RECIPE
that changes Claude's behavior for a specific task. If removing the skill
doesn't change how Claude works, the skill is worthless.

---

## Part 1: Frontmatter — WHERE THE SKILL LIVES OR DIES

The frontmatter description is the ONLY thing Claude sees when deciding
whether to load your skill. Everything else is invisible until triggered.

### The formula:
```
description =
  WHAT it does (1 sentence)
  + ACTIONS that trigger it (write, review, fix, audit, check, scan...)
  + OBJECTS it applies to (keys, tokens, passwords, .env, connections...)
  + PATTERNS it detects (injection, XSS, CSRF, eval, exec...)
  + COMMANDS that invoke it (/review, /ship, security...)
  + CONTEXTS where it should fire even without explicit request
  + "Even if the user doesn't explicitly mention X, use this skill when Y"
```

The last line is critical. Anthropic's own docs say:
"Claude has a tendency to undertrigger skills. Make descriptions pushy."

### Frontmatter options:
```yaml
---
name: skill-name                    # becomes /skill-name or auto-invoked
description: >                      # PUSHY trigger description (30+ keywords)
  ...
disable-model-invocation: true      # ONLY for dangerous skills (evolve, debug)
---
```

---

## Part 2: Body — 1,500-2,000 WORDS MAX

### Structure:
```markdown
# Skill Name

## When This Fires
One paragraph: what task, why it exists.

## Workflow
Numbered steps. Imperative form. What Claude DOES.

1. Run the detection script:
   ```bash
   bash skills/skill-name/scripts/detect.sh
   ```
2. Read the output. If [condition], do [action].
3. Apply [pattern] to the code.
4. Verify by running [check].

## Rules
- Non-negotiable constraints (5-10 max)
- Positive directives: "Always X" not "Don't do Y"
- Specific, testable, unambiguous

## Examples
One concrete input → output showing expected behavior.

## References
For detailed [topic], read: `references/guide.md`
```

### Writing rules:
1. Imperative form: "Run the script" not "You should run the script"
2. Positive directives: "Always validate" not "Don't skip validation"
3. Progressive disclosure: lean SKILL.md, deep references/
4. Written for Claude, not humans: precise, skip prose
5. Include what's non-obvious: domain-specific, project-specific

---

## Part 3: Scripts — DETERMINISTIC WORK

The best skills have backing scripts that do mechanical work.
Claude runs the script, reads the output, then reasons about it.

### When to use scripts:
```
✓ Scanning files for patterns      → grep/find faster than Claude reading
✓ Detecting frameworks/tools       → checking file existence is deterministic
✓ Formatting structured output     → appending to files with timestamps
✓ Searching databases              → CSV/JSON lookup
✓ Running validators               → linters, type checkers, test runners

✗ Making judgments                  → Claude reasons, scripts don't
✗ Writing code                     → Claude writes, scripts can't adapt
✗ Explaining decisions             → Claude explains, scripts output data
```

### Script template:
```bash
#!/usr/bin/env bash
set -euo pipefail
# [What this does]
result=$(grep -rn "pattern" --include="*.js" . 2>/dev/null || true)
if [ -n "$result" ]; then
  echo "## Found $(echo "$result" | wc -l) matches"
  echo "$result"
else
  echo "## No matches found"
fi
```

Key rule: SKILL.md says "Do NOT read the script file, just execute it."
Scripts are black boxes. This saves tokens.

---

## Part 4: References — DEEP CONTENT ON DEMAND

```
references/
├── detailed-patterns.md    ← 500+ lines of patterns/examples
├── edge-cases.md           ← rare situations with specific guidance
├── domain-knowledge.md     ← industry-specific rules
└── schema.md               ← data formats, API contracts
```

### In SKILL.md (always loaded) vs references/ (on demand):

| SKILL.md | references/ |
|----------|-------------|
| Workflow steps | Detailed pattern catalogs |
| Core rules (5-10) | Edge case handling |
| One example | Full domain knowledge |
| Script invocation | Schema definitions |
| When to load which ref | Extended examples |

---

## Part 5: Examples — OUTPUT CLAUDE SHOULD MATCH

Claude follows examples more reliably than instructions. Show the format,
Claude produces the format. Describe the format, Claude improvises.

```markdown
# Example: [Task Description]

## Input
User asked: "[exact request]"

## Output (what Claude should produce)
[Complete, formatted output]
```

---

## Part 6: Evolution

Skills aren't static. After real usage:

1. Track triggers — did the skill fire when expected? Make description pushier
2. Track quality — did Claude follow the workflow? Simplify steps
3. Track gaps — did Claude need knowledge not provided? Add to references/
4. Promote patterns — if patterns keep working → mark portable in ~/shared-skills/
5. Prune failures — if skill consistently fails → rewrite or remove
