---
name: skill-creator
description: >
  Creates new Claude Code skills with proper structure. Use when the user says
  "create a skill", "add a skill", "new skill", "build a skill", "write a
  skill", "make a skill", "I need a skill for", "skill for", "add capability",
  "new capability", "teach Claude to", "automate this workflow". Also use when
  converting an existing command to a skill, migrating a capability to a skill,
  or when the user describes a repeated workflow that should be automated.
  Even if the user doesn't say "skill", use this when they describe a behavior
  Claude should learn for a specific domain or task pattern.
---

# Skill Creator

Creates production-quality skills that follow the Anthropic skill spec.
A skill is a RECIPE that changes Claude's behavior — not documentation, not a prompt.

## Workflow

1. **Capture intent.** Ask: what task does this skill handle? What triggers it?

2. **Generate the directory:**
   ```bash
   bash .claude/skills/skill-creator/scripts/scaffold.sh SKILL_NAME
   ```

3. **Write the frontmatter.** Follow the pushy description formula:
   ```
   description =
     WHAT it does (1 sentence)
     + ACTIONS that trigger it (10+ verbs)
     + OBJECTS it applies to (10+ nouns)
     + COMMANDS that invoke it
     + CONTEXTS where it fires without explicit request
     + "Even if the user doesn't explicitly mention X, use this when Y"
   ```
   Target 30+ trigger keywords. Claude undertriggers modest descriptions.

4. **Write the body.** Under 2,000 words. Imperative form.
   - "Run the script" not "You should run the script"
   - "Always validate" not "Don't skip validation"
   - Include one concrete example inline
   - Move deep content to `references/`

5. **Add scripts/** if the skill involves deterministic work:
   - Scanning files for patterns
   - Detecting frameworks or tools
   - Formatting structured output
   - Do NOT put LLM reasoning in scripts

6. **Add examples/** with concrete input → output samples.

7. **Validate.** Read `references/quality-checklist.md` and verify all items pass.

## Rules
- SKILL.md body: 1,500-2,000 words maximum
- Description: 30+ trigger keywords minimum
- Scripts: deterministic only, output structured text
- Scripts: SKILL.md says "Do NOT read the script file, just execute it"
- Every reference file mentioned in SKILL.md with load condition
- Removing the skill must change Claude's behavior (not just add info)
- `disable-model-invocation: true` ONLY for dangerous skills

## References
For the complete skill engineering guide: `references/skill-engineering-guide.md`
For the quality checklist: `references/quality-checklist.md`
For a sample skill output: `examples/sample-skill.md`
