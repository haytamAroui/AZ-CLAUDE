# Skill Quality Checklist

Verify ALL items before shipping any skill.

## Frontmatter
- [ ] Description has 30+ trigger keywords
- [ ] Description ends with "even if the user doesn't explicitly ask"
- [ ] Name is lowercase, hyphenated, descriptive
- [ ] `disable-model-invocation: true` ONLY if skill should never auto-fire

## Body
- [ ] SKILL.md body is under 2,000 words
- [ ] Workflow uses imperative form ("Run X" not "You should run X")
- [ ] Rules are positive directives ("Always X" not "Don't do Y")
- [ ] At least one concrete example (inline or in examples/)
- [ ] All detailed content in references/, not SKILL.md
- [ ] Every reference file mentioned with load condition

## Scripts
- [ ] Scripts do deterministic work only (no LLM reasoning)
- [ ] Scripts output structured text Claude can parse
- [ ] SKILL.md says "Do NOT read the script file, just execute it"
- [ ] Scripts use `set -euo pipefail`
- [ ] Scripts have usage comments at the top

## Behavior
- [ ] Removing the skill changes Claude's behavior (not just removes info)
- [ ] Skill doesn't duplicate native Claude Code functionality
- [ ] Skill doesn't conflict with other installed skills

## Structure
- [ ] `SKILL.md` exists in skill root
- [ ] `references/` has deep content (if applicable)
- [ ] `examples/` has output samples (if applicable)
- [ ] `scripts/` has backing scripts (if applicable)
- [ ] No file exceeds 500 lines
