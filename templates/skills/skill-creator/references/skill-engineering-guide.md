# How To Craft The Best Skill — AZCLAUDE Skill Engineering Guide

Based on: Anthropic's skill-development docs, DeerFlow's skill architecture, ui-ux-pro-max (42K stars), Superpowers (42K stars), 7 academic papers, and the Vishnyakova Context Engineering Pyramid.

---

## The Rule

A skill is not documentation. A skill is not a prompt. A skill is a RECIPE that changes Claude's behavior for a specific task. If removing the skill doesn't change how Claude works, the skill is worthless.

---

## The Structure

```
skill-name/
├── SKILL.md              ← REQUIRED: frontmatter + lean instructions
├── scripts/              ← deterministic work Claude shouldn't reason about
│   └── do-something.sh
├── references/           ← deep content, loaded only when needed
│   └── detailed-guide.md
└── examples/             ← concrete outputs Claude should match
    └── sample-output.md
```

---

## Part 1: The Frontmatter — WHERE THE SKILL LIVES OR DIES

The frontmatter description is the ONLY thing Claude sees when deciding whether to load your skill. Everything else is invisible until the skill triggers.

### Bad description (5-8 triggers):
```yaml
---
name: security-review
description: Reviews code for security vulnerabilities and credential leaks.
---
```
Claude sees this and thinks: "I'll use this when someone says 'security review'." 
That's 2 trigger phrases. The skill rarely fires.

### Good description (50+ triggers — the ui-ux-pro-max pattern):
```yaml
---
name: security-review
description: >
  Security analysis and credential scanning. Use when writing, reviewing, 
  fixing, or auditing code for: API keys, secrets, tokens, passwords, 
  credentials, .env files, hardcoded values, AKIA, sk-, ghp_, bearer 
  tokens, JWT secrets, database connection strings, private keys, SSH keys,
  OAuth secrets, webhook secrets, encryption keys. Also use for: input 
  validation, SQL injection, XSS, CSRF, command injection, path traversal, 
  eval(), os.system(), exec(), shell commands, file permissions, CORS, 
  authentication, authorization, rate limiting, data exposure, error 
  leaking stack traces. Trigger on: /audit, /ship, security check, 
  audit, vulnerability, penetration test, compliance check, OWASP, 
  secure coding, hardening. Even if the user doesn't explicitly mention 
  security, use this skill whenever code touches authentication, payments, 
  user data, file uploads, or external APIs.
---
```

### The formula:
```
description = 
  WHAT it does (1 sentence)
  + ACTIONS that trigger it (write, review, fix, audit, check, scan...)
  + OBJECTS it applies to (keys, tokens, passwords, .env, connections...)
  + PATTERNS it detects (injection, XSS, CSRF, eval, exec...)
  + COMMANDS that invoke it (/audit, /ship, security...)
  + CONTEXTS where it should fire even without explicit request
  + "Even if the user doesn't explicitly mention X, use this skill when Y"
```

The last line is critical. Anthropic's own docs say:
"Claude has a tendency to undertrigger skills. Make descriptions pushy."

### Frontmatter options:
```yaml
---
name: skill-name                    # becomes /skill-name slash command
description: >                      # PUSHY trigger description (see above)
  ...
disable-model-invocation: true      # ONLY for dangerous skills (evolve, debug)
                                    # omit this for skills that should auto-fire
---
```

---

## Part 2: The Body — 1,500-2,000 WORDS MAX

Anthropic's rule: SKILL.md body targets 1,500-2,000 words. Everything else goes in references/.

### The body structure:

```markdown
# Skill Name

## When This Fires
One paragraph: what task this skill handles and why it exists.

## Workflow
Numbered steps. Imperative form. What Claude DOES, not what Claude SHOULD do.

1. Run the detection script:
   ```bash
   bash skills/skill-name/scripts/detect.sh
   ```
2. Read the output. If [condition], do [action].
3. Apply [pattern] to the code.
4. Verify by running [check].

## Rules
- Non-negotiable constraints (5-10 max)
- Written as positive directives: "Always X" not "Don't do Y"
- Specific, testable, unambiguous

## Examples
One concrete input → output example that shows the expected behavior.

## References
For detailed [topic], read: `references/detailed-guide.md`
For [pattern] examples, read: `references/patterns.md`
```

### Writing rules (from Anthropic's skill-development docs):

1. **Imperative form.** "Run the script" not "You should run the script"
2. **Positive directives.** "Always validate inputs" not "Don't skip validation"
3. **Progressive disclosure.** Lean SKILL.md, deep references/
4. **Written for Claude, not humans.** Be precise, skip prose.
5. **Include what's non-obvious.** Claude already knows how to code. Include domain-specific knowledge, project-specific conventions, and procedural steps that aren't common knowledge.

---

## Part 3: Scripts — DETERMINISTIC WORK CLAUDE SHOULDN'T REASON ABOUT

From DeerFlow + ui-ux-pro-max: the best skills have backing scripts that do mechanical work. Claude runs the script, reads the output, then reasons about what to do with it.

### When to use scripts:
```
✓ Scanning files for patterns      → grep/find is faster than Claude reading
✓ Detecting frameworks/tools       → checking file existence is deterministic
✓ Formatting structured output     → appending to decisions.md with timestamp
✓ Searching databases              → CSV/JSON lookup (ui-ux-pro-max pattern)
✓ Running validators               → linters, type checkers, test runners

✗ Making judgments                  → Claude reasons, scripts don't
✗ Writing code                     → Claude writes, scripts can't adapt
✗ Explaining decisions             → Claude explains, scripts output data
```

### Script template:
```bash
#!/usr/bin/env bash
# skill-name/scripts/action.sh
# Purpose: one line explaining what this does
# Usage: bash skills/skill-name/scripts/action.sh [args]
# Output: structured text Claude reads and acts on

set -euo pipefail

# Do the deterministic work
result=$(grep -rn "pattern" --include="*.js" --include="*.ts" . 2>/dev/null || true)

# Output structured result for Claude
if [ -n "$result" ]; then
  echo "## Found $(echo "$result" | wc -l) matches"
  echo "$result"
else
  echo "## No matches found"
fi
```

### SKILL.md references the script:
```markdown
## Step 1: Scan the codebase
Run the detection script. Do NOT read the script file — just execute it:
```bash
bash skills/security-review/scripts/scan-secrets.sh
```
Read the output. If matches found, review each one.
```

Key rule from ui-ux-pro-max: "Do NOT read the python file, just call it with the parameters." Scripts are black boxes. Claude runs them and reads the output. This saves tokens — Claude doesn't waste context reading script source code.

---

## Part 4: References — DEEP CONTENT LOADED ON DEMAND

```
references/
├── detailed-patterns.md    ← 500+ lines of patterns/examples
├── edge-cases.md           ← rare situations with specific guidance  
├── domain-knowledge.md     ← industry-specific rules
└── schema.md               ← data formats, API contracts
```

### When to put content in references/ vs SKILL.md:

```
In SKILL.md (always loaded):          In references/ (loaded on demand):
- Workflow steps                      - Detailed pattern catalogs
- Core rules (5-10)                   - Edge case handling
- One example                         - Full domain knowledge
- Script invocation commands          - Schema definitions
- When to load which reference        - Extended examples
```

### How to reference from SKILL.md:
```markdown
## Advanced Patterns
For the complete pattern catalog with 50+ examples, read:
`references/patterns.md`

Only load this reference when the task involves [specific condition].
```

This is the Vishnyakova paper's "economy" criterion: minimum tokens while preserving quality. SKILL.md is ~1,500 words. References can be 5,000+ words. But references only load when needed.

---

## Part 5: Examples — CONCRETE OUTPUT CLAUDE SHOULD MATCH

```
examples/
└── sample-output.md    ← what the skill's output looks like
```

### Why examples matter:
Claude follows examples more reliably than instructions. If you show Claude "this is what a security review looks like," it produces that format. If you only describe the format, Claude improvises.

### Example template:
```markdown
# Example: Security Review of auth.js

## Input
User asked: "review auth.js for security issues"

## Output (what Claude should produce)

### Security Review: src/auth.js

**Critical:**
- Line 45: JWT secret hardcoded (`const SECRET = "abc123"`)
  → Move to environment variable, reference via process.env.JWT_SECRET

**High:**
- Line 72: No input validation on email parameter
  → Add: `if (!validator.isEmail(email)) throw new ValidationError()`

**Medium:**
- Line 103: Error message exposes stack trace
  → Replace with generic error: `res.status(500).json({ error: "Internal error" })`

**Summary:** 1 critical, 1 high, 1 medium. Fix critical before merge.
```

---

## Part 6: Quality Checklist — BEFORE SHIPPING ANY SKILL

From Anthropic's skill-development skill + AZCLAUDE's debate engine research:

```
□ Description has 30+ trigger keywords (pushy, not modest)
□ Description ends with "even if the user doesn't explicitly ask"
□ SKILL.md body is under 2,000 words
□ All detailed content is in references/, not SKILL.md
□ Workflow uses imperative form ("Run X" not "You should run X")
□ Rules are positive directives ("Always X" not "Don't do Y")
□ At least one concrete example in examples/ or inline
□ Scripts do deterministic work only (no LLM reasoning in scripts)
□ Scripts output structured text Claude can parse
□ SKILL.md says "Do NOT read the script file, just execute it"
□ Every reference file is mentioned in SKILL.md with load condition
□ Removing the skill would change Claude's behavior (not just add info)
□ disable-model-invocation: true ONLY if skill should never auto-fire
```

---

## Part 7: The Evolution Connection

From EvoSkill paper + AZCLAUDE's /evolve:

Skills aren't static. After real usage:

1. **Track triggers.** Did the skill fire when expected? If not → make description pushier
2. **Track quality.** Did Claude follow the workflow? If not → simplify steps
3. **Track gaps.** Did Claude need knowledge the skill didn't provide? → add to references/
4. **Promote patterns.** If a skill's patterns keep working → mark as portable in ~/shared-skills/
5. **Prune failures.** If a skill consistently produces bad output → rewrite or remove

This is the evolution loop applied to skills. /evolve should read session friction and identify which skills need improvement.

---

## Quick Start: Create a New Skill in 5 Minutes

```bash
# 1. Create the directory
mkdir -p .claude/skills/my-skill/{scripts,references,examples}

# 2. Write SKILL.md (copy this template, fill in)
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: >
  [WHAT it does]. Use when [ACTION 1], [ACTION 2], [ACTION 3].
  Triggers on: [KEYWORD 1], [KEYWORD 2], [KEYWORD 3], [KEYWORD 4],
  [KEYWORD 5], [KEYWORD 6], [KEYWORD 7], [KEYWORD 8], [KEYWORD 9],
  [KEYWORD 10]. Also applies when working with [CONTEXT 1], [CONTEXT 2].
  Even if the user doesn't explicitly mention [DOMAIN], use this skill
  when the task involves [CONDITION].
---

# My Skill

## When This Fires
[One paragraph explaining the purpose]

## Workflow
1. [First step — imperative form]
2. [Second step]
3. [Third step]

## Rules
- [Positive directive 1]
- [Positive directive 2]
- [Positive directive 3]

## Example
[One concrete input → output]

## References
For detailed [topic], read: `references/guide.md`
EOF

# 3. Add a script if applicable
cat > .claude/skills/my-skill/scripts/detect.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
# [What this detects]
echo "## Results"
# [deterministic work here]
EOF
chmod +x .claude/skills/my-skill/scripts/detect.sh

# 4. Test it — ask Claude something that should trigger the skill
```

---

## Sources

- Anthropic skill-development SKILL.md: imperative form, 1500-2000 words, progressive disclosure
- Anthropic skill-creator: pushy descriptions, trigger optimization loop
- DeerFlow: skills with executable scripts that produce files
- ui-ux-pro-max (42K stars): exhaustive keyword descriptions, Python search engine over CSV databases
- Superpowers (42K stars): auto-invoked skills, TDD enforcement, mandatory skill check
- EvoSkill paper: skill evolution through failure analysis, held-out validation
- Vishnyakova CE Pyramid: economy criterion (minimum tokens), progressive disclosure
- DUCTILE paper: documentation-quality-as-signal, Pass-k behavioral checks
