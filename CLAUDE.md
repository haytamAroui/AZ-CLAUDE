# AZCLAUDE

## Identity
Claude Code architecture-native AI environment. A template installer (`npx azclaude`) that scaffolds
CLAUDE.md, skills, memory, agents, and hooks for any project — progressively, level by level.
Domain: Developer tooling | Stack: Node.js CLI, Bash, Markdown templates | Scale: STANDARD (67 files)

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
3. **Tests** — Every template change must be covered by `test-features.sh`. Run it before every commit.
4. **No over-engineering** — Templates are instructions for Claude. Keep them precise, not exhaustive.

## Session State
Read `.claude/memory/goals.md` at the start of every session.
Update it at the end of every session with /persist.

## Project Structure
```
bin/cli.js              — CLI installer (detectCLI, substitutePaths, sanitizePath, integrity hash)
templates/CLAUDE.md     — template installed into user projects
templates/commands/     — 16 command files installed as .claude/commands/
templates/capabilities/ — manifest + shared + level-builders + evolution + intelligence
templates/agents/       — orchestrator-init + loop-controller
templates/scripts/      — env-scan.sh (JSON output, ~200 tokens)
test-features.sh        — 654 grep-based tests, all must pass before commit
```

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY files relevant to the current task.

Quick dispatch:
- Template change → read the file, edit, run test-features.sh, commit
- New command → templates/commands/{name}.md, add to COMMANDS in bin/cli.js, add tests
- New capability → templates/capabilities/shared/{name}.md, add to manifest.md
- CLI change → bin/cli.js, add tests in test-features.sh
- /fix bug → commands/fix.md protocol
- /evolve → commands/evolve.md → evolution/detect + generate + evaluate
- /debate → commands/debate.md → intelligence/debate.md
- /persist → commands/persist.md

## Trade-Off Hierarchies
When priorities conflict:
1. Template quality > feature count — one precise template beats three vague ones
2. Real behavior > claimed behavior — if it can't be tested, it doesn't exist
3. User clarity > framework elegance — the user is the last consumer, optimize for them

## Available Commands
/dream · /setup · /fix · /add · /review · /test · /plan · /evolve · /debate · /checkpoint · /persist · /level-up · /ship · /status · /explain · /loop
