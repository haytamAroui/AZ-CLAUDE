---
name: setup
description: >
  Project environment setup. Analyzes project, fills CLAUDE.md, creates memory
  structure, installs hooks. Run once at project start.
  Triggers on: /setup, "set up project", "initialize", "configure Claude".
tokens: ~80
---

# /setup — Project Environment Setup

Spawn the initialization specialist for this project:

1. Read `.claude/capabilities/manifest.md` to confirm capabilities are installed
2. Spawn `agents/orchestrator-init.md` as a subagent with this context:
   - Current working directory
   - Project scale (file count from quick bash check)
   - Any existing CLAUDE.md content (to avoid overwriting intentional config)

3. The orchestrator-init agent:
   - Detects scale, domain, and signals
   - Fills CLAUDE.md
   - Creates `.claude/memory/goals.md`
   - Creates `knowledge-index.md` if knowledge/ directory exists
   - Runs environment scan as a single script (not 15 separate calls)

4. After the agent completes:
   - Load `capabilities/shared/quality-check.md` and run the environment check
   - All ✓ required before printing "Setup complete"
   - Print filled CLAUDE.md and goals.md as proof

## If Running Again on an Existing Project
Do not overwrite CLAUDE.md — read it first and update only the placeholders that are still unfilled.
Do not overwrite goals.md — read it and preserve existing threads.
