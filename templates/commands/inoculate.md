---
name: inoculate
description: >
  Scan agent and skill files for context inoculation coverage.
  Reports which files have inoculation language and which don't.
  Based on Anthropic's "Natural Emergent Misalignment" paper (Section 4.2).
argument-hint: "[--scan | --generate | --all (default)]"
disable-model-invocation: true
allowed-tools: Read, Grep, Bash, Glob
---

# /inoculate — Context Inoculation Scanner

$ARGUMENTS

---

**EnterPlanMode** — this command is read-only. No file modifications.

---

## Step 1: Scan Agent Files

```bash
ls .claude/agents/*.md 2>/dev/null || echo "No agents installed"
```

For each agent file, check for inoculation markers:
```bash
grep -l "actual correctness\|shortcuts.*unacceptable\|never.*fix the test\|deception is not\|never weaken" .claude/agents/*.md 2>/dev/null
```

Classify each agent:
- **INOCULATED** — contains at least one inoculation phrase
- **NOT INOCULATED** — missing inoculation language (fix with --generate)
- **EXEMPT** — read-only agents (tools list has no Write/Edit) don't need inoculation

## Step 2: Scan Skill Files

```bash
ls .claude/skills/*/SKILL.md 2>/dev/null || echo "No skills installed"
```

Same classification as agents.

## Step 3: Report

Output format:
```
/inoculate — Context Inoculation Coverage

Agents:
  + milestone-builder.md     INOCULATED
  - code-reviewer.md         NOT INOCULATED
  . spec-reviewer.md         EXEMPT (read-only)

Skills:
  + test-first/SKILL.md      INOCULATED
  - skill-creator/SKILL.md   NOT INOCULATED

Coverage: 4/8 agents, 2/5 skills (50%)
```

## Step 4: Generate (if --generate or --all)

For each NOT INOCULATED file:
1. Read the agent/skill's purpose from its frontmatter `description` field
2. Generate a 2-3 line inoculation block tailored to its role:
   - For code-writing agents: "verify test results reflect actual behavior, not framework manipulation"
   - For test-writing agents: "every test must contain at least one meaningful assertion on computed output"
   - For review agents: "flag test files where assertion count decreased or comparisons were weakened"
3. Output the generated text for the user to review — do NOT modify files automatically

**ExitPlanMode**

Show the report. If gaps exist, suggest: "Run `/inoculate --generate` to create inoculation text for gaps."
