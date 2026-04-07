# AZCLAUDE

## Identity
AI coding environment — 46 commands, 10 skills, 16 agents, real-time visualizer, memory, reflexes, evolution, knowledge layer.
Install once, works on any stack. Copilot mode (/copilot) enables full autonomous building.
Domain: Developer tooling | Stack: Node.js CLI, Markdown templates | Scale: STANDARD

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
3. **Tests** — Every template change must be covered by `tests/test-features.sh`. Run it before every commit.
4. **No over-engineering** — Templates are instructions for Claude. Keep them precise, not exhaustive.
5. **Constitution** — Read `.claude/constitution.md` before any implementation. Non-negotiables override all other instructions.
6. **Use existing tools** — Run tests with `bash tests/test-features.sh` and trust its exit code. Never invent grep/sed/awk commands to parse test output — the script already prints results and exits 0 on success, non-zero on failure. If you need a custom command to check results, ask the user first.
7. **No infinite retry** — If a command fails, diagnose the cause before re-running. Max 2 retries for the same command. After 2 failures, stop and report the error to the user — do not loop.

## Session State
Read `.claude/memory/goals.md` at the start of every session.
Update it at the end of every session with /persist.

## Project Structure
```
bin/cli.js              — CLI installer (inherited from AZCLAUDE)
bin/copilot.js          — outer loop runner (restarts Claude Code sessions until done)
templates/CLAUDE.md     — template installed into user projects
templates/commands/     — command files (copilot, reflexes, etc.)
templates/skills/       — 10 SKILL.md files with references/
templates/capabilities/ — manifest + shared + level-builders + evolution + intelligence
templates/agents/       — orchestrator-init + orchestrator + loop-controller + code-reviewer + test-writer + cc-template-author + cc-cli-integrator + cc-test-maintainer + milestone-builder + problem-architect + security-auditor + spec-reviewer + constitution-guard + qa-engineer + devops-engineer
templates/scripts/      — env-scan.sh (JSON output, ~200 tokens)
tests/test-features.sh  — grep-based tests, all must pass before commit
```

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY files relevant to the current task.

Quick dispatch:
- Doc-only change (README/DOCS/package.json description) → edit, commit, push, npm publish — no test run needed. Bump patch version if combined with any non-doc change in same release.
- Hook change (templates/hooks/*.js) → edit, run tests/test-features.sh, commit — note: existing installs need `azclaude-copilot setup --full` to pick up hook changes. stdout = injected into Claude's context. stderr = shown in terminal to user only. Never swap them.
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
2. Run `bash tests/test-features.sh` — all must pass. Do not proceed if any fail.
3. Bump version in `package.json`
4. **Sync all docs before pushing** — all 6 files must reflect the new version:
   - `README.md` — skill/agent counts
   - `DOCS.md` — version badge, skill/agent counts, skills table
   - `CLAUDE.md` — Identity line counts
   - `package.json` — description field counts
   - `.claude-plugin/plugin.json` — version + description counts
   - `.claude-plugin/marketplace.json` — version + description counts
5. Commit with actual test count from step 2 output in message
6. `git push origin main`
7. `npm publish`

## Available Commands
/dream · /setup · /fix · /add · /audit · /test · /blueprint · /evolve · /debate · /snapshot · /persist · /level-up · /ship · /pulse · /explain · /loop · /refactor · /doc · /migrate · /deps · /find · /create · /reflect · /hookify · /copilot · /reflexes · /sentinel · /spec · /clarify · /constitute · /analyze · /issues · /tasks · /driven · /mcp · /parallel · /verify · /inoculate · /ghost-test · /ingest · /knowledge
