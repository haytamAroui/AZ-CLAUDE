---
name: dream
description: >
  Build a new project from an idea. Analyzes the idea, detects the tech stack,
  scans the current environment level, then builds everything progressively.
  Triggers on: /dream, "I want to build", "new project idea", "create project".
tokens: ~80
---

# /dream — Build a Project From an Idea

I want to build a project. Here's my idea:

$ARGUMENTS

---

Read `.claude/capabilities/manifest.md` to orient, then:

1. If the idea above is blank — ask: "What do you want to build? Give me your idea and the technologies you want to use." Stop here until answered.

2. If no tech stack was mentioned — ask ONE question: "What technologies do you want to use?" Stop here until answered.

3. Once idea and stack are clear:
   - Read `.claude/agents/orchestrator-init.md` and run the full project setup for this idea
   - Detect current environment level (check which of `.claude/capabilities/`, `.claude/commands/`, `.claude/memory/`, `.claude/agents/` exist and are configured)
   - Build what's missing level by level — load only the relevant `level-builders/{N}.md` file for each level, not all at once
   - Show progress at each level: what was created, what changed

4. At the end — show a summary:
   - What level the environment is now at
   - What files were created
   - What the first task should be

## Completion Rule
Show the created CLAUDE.md and goals.md as proof.
Do not say "project ready" without showing the files.
