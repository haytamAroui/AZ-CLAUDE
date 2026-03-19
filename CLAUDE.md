# AZCLAUDE

## Identity
AI coding environment — 26 commands, 8 skills, 7 agents, memory, reflexes, evolution.
Install once, works on any stack. Copilot mode (/copilot) enables full autonomous building.
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
templates/commands/     — command files (copilot, reflexes, etc.)
templates/skills/       — 8 SKILL.md files with references/
templates/capabilities/ — manifest + shared + level-builders + evolution + intelligence
templates/agents/       — orchestrator-init + loop-controller + code-reviewer + test-writer + cc-template-author + cc-cli-integrator + cc-test-maintainer
templates/scripts/      — env-scan.sh (JSON output, ~200 tokens)
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
- /reflect → commands/reflect.md (self-improving CLAUDE.md)
- Release → bump package.json, run tests, commit, push, npm publish

## Trade-Off Hierarchies
When priorities conflict:
1. Template quality > feature count — one precise template beats three vague ones
2. Real behavior > claimed behavior — if it can't be tested, it doesn't exist
3. User clarity > framework elegance — the user is the last consumer, optimize for them

## Release Process
1. Edit code
2. Run `bash tests/test-features.sh` — all must pass
3. Bump version in `package.json`
4. Commit with test count in message
5. `git push origin main`
6. `npm publish`

## Available Commands
/dream · /setup · /fix · /add · /audit · /test · /blueprint · /evolve · /debate · /snapshot · /persist · /level-up · /ship · /pulse · /explain · /loop · /refactor · /doc · /migrate · /deps · /find · /create · /reflect · /hookify · /copilot · /reflexes
