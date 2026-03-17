# AZCLAUDE

## Identity
Claude Code architecture-native AI environment. A template installer (`npx azclaude`) that scaffolds
CLAUDE.md, skills, memory, agents, and hooks for any project — progressively, level by level.
Domain: Developer tooling | Stack: Node.js CLI, Bash, Markdown templates | Scale: STANDARD (75 files)

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
3. **Tests** — Every template change must be covered by `tests/test-features.sh`. Run it before every commit.
4. **No over-engineering** — Templates are instructions for Claude. Keep them precise, not exhaustive.

## Session State
Read `.claude/memory/goals.md` at the start of every session.
Update it at the end of every session with /persist.

## Project Structure
```
bin/cli.js              — CLI installer (detectCLI, substitutePaths, integrity hash, --full flag)
templates/CLAUDE.md     — template installed into user projects
templates/commands/     — 23 command files installed as .claude/commands/
templates/skills/       — 5 SKILL.md files with references/ (model-auto-invoked)
templates/capabilities/ — manifest + shared + level-builders + evolution + intelligence
templates/agents/       — orchestrator-init + loop-controller + code-reviewer + test-writer
templates/scripts/      — env-scan.sh (JSON output, ~200 tokens)
tests/test-features.sh        — 794 grep-based tests, all must pass before commit
```

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY files relevant to the current task.

Quick dispatch:
- Template change → read the file, edit, run tests/test-features.sh, commit
- New command → templates/commands/{name}.md, add to CORE/EXTENDED/ADVANCED_COMMANDS in bin/cli.js, add tests
- New skill → templates/skills/{name}/SKILL.md, add to SKILLS in bin/cli.js, add tests
- New capability → templates/capabilities/shared/{name}.md, add to manifest.md
- CLI change → bin/cli.js, add tests in tests/test-features.sh
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
/dream · /setup · /fix · /add · /review · /test · /plan · /evolve · /debate · /checkpoint · /persist · /level-up · /ship · /status · /explain · /loop · /refactor · /doc · /migrate · /deps · /find · /create · /reflect
