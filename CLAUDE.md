# AZCLAUDE COPILOT

## Identity
Autonomous product builder. Describe a product once — AZCLAUDE Copilot builds it across sessions:
planning, implementing, testing, committing, evolving, deploying. Zero human input after the first message.
Forked from AZCLAUDE v1.0.0. New features: /copilot command, plan tracker, Node.js runner loop.
Domain: Developer tooling | Stack: Node.js CLI, Markdown templates | Scale: STANDARD

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
bin/cli.js              — CLI installer (inherited from AZCLAUDE)
bin/copilot.js          — outer loop runner (restarts Claude Code sessions until done)
templates/CLAUDE.md     — template installed into user projects
templates/commands/     — 25 command files (+/copilot)
templates/skills/       — 7 SKILL.md files with references/
templates/capabilities/ — manifest + shared + level-builders + evolution + intelligence
templates/agents/       — orchestrator-init + loop-controller + code-reviewer + test-writer
templates/scripts/      — env-scan.sh (JSON output, ~200 tokens)
ROADMAP.md              — 5-phase build plan (the spec for this product)
tests/test-features.sh  — grep-based tests, all must pass before commit
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

## Build Plan
Read `ROADMAP.md` for the full 5-phase spec. Build order:
1. Phase 1: templates/commands/copilot.md (the /copilot command)
2. Phase 2: plan-tracker capability + structured /plan output
3. Phase 3: bin/copilot.js (Node.js runner loop — NOT bash)
4. Phase 4: Wire /dream → /plan → /add → /evolve → /review → /ship into copilot flow
5. Phase 5: Agent emergence (zero new code — /evolve already does it)

## Available Commands
/dream · /setup · /fix · /add · /review · /test · /plan · /evolve · /debate · /checkpoint · /persist · /level-up · /ship · /status · /explain · /loop · /refactor · /doc · /migrate · /deps · /find · /create · /reflect · /hookify · /copilot
