# Goals — AZCLAUDE
Updated: 2026-03-20

## Current threads
- [checkpoint] 17:20 — v0.3.5-ci-added → .claude/memory/checkpoints/2026-03-19-17-20.md
- [checkpoint] 05:30 — v0.3.3-all-gaps-resolved → .claude/memory/checkpoints/2026-03-19-05-30.md
- Published to npm: azclaude-copilot@0.3.5 (19 releases total)
- 1058 tests, 49 commits
- Tested on certification project — 18/18 verification checks pass
- GitHub Actions CI live — Node 18/20/22 matrix

## Done this session
- 00:06 — .github\workflows\tests.yml (+43/-0)
- 00:03 — package.json (+1/-1) — "version": "0.4.3",
- 00:02 — DOCS.md (+72/-24)
- 23:59 — README.md (+53/-22) — Intelligent Dispatch — Pre-Flight for Every Command
- 23:56 — package.json (+1/-1) — "version": "0.4.2",
- 23:53 — tests\test-features.sh (+33/-0)
- 23:51 — templates\capabilities\manifest.md (+1/-0)
- 23:51 — templates\commands\ship.md (+20/-0) — Step 0: Risk Scan (intelligent-dispatch)
- 23:51 — templates\commands\refactor.md (+21/-0) — Load: shared/completion-rule.md
- 23:50 — templates\commands\audit.md (+21/-0) — Step 1b: Structural Context (intelligent-dispatch)
- 23:50 — templates\commands\dream.md (+17/-0) — Phase 2: Environment Scan
- 23:50 — templates\commands\fix.md (+14/-0) — Load: shared/tdd.md + shared/completion-rule.md before start
- 23:50 — templates\commands\add.md (+13/-0) — Load: shared/tdd.md + shared/completion-rule.md
- 23:50 — templates\capabilities\shared\intelligent-dispatch.md
- 23:45 — package.json (+1/-1) — "version": "0.4.1",
- 23:43 — tests\test-features.sh (+11/-0)
- 23:42 — templates\commands\setup.md (+21/-0) — Step 6: Generate Project-Specific Agents (if project has 10+
- 23:42 — templates\commands\evolve.md (+20/-0) — Check existing before creating
- 23:42 — templates\commands\blueprint.md (+27/-1) — Copilot Mode — Structured plan.md Output
- 23:35 — package.json (+2/-2) — "version": "0.4.0",
- 23:35 — tests\test-features.sh (+37/-0)
- 23:34 — bin\cli.js (+1/-1)
- 23:34 — templates\commands\copilot.md (+10/-0) — /copilot — Autonomous Milestone Execution
- 23:32 — templates\agents\milestone-builder.md
- 23:32 — templates\agents\problem-architect.md
- 23:32 — templates\agents\orchestrator.md
- 23:00 — package.json (+1/-1) — "version": "0.3.9"
- 22:58 — tests\test-features.sh (+2/-0)
- 22:58 — DOCS.md (+43/-17) — Hook Profiles
- 22:58 — README.md (+24/-5) — Hook Profiles
- 22:57 — templates\hooks\user-prompt.js (+48/-0) — // Inject latest checkpoint if one exists — captures mid-ses
- 22:47 — package.json (+1/-1) — "version": "0.3.8"
- 22:44 — .claude\hooks\post-tool-use.js (+62/-14) — const archiveTs   = new Date().toISOString().slice(0, 16);
- 22:44 — templates\hooks\post-tool-use.js (+28/-1) — const archiveTs   = new Date().toISOString().slice(0, 16);
- 22:42 — tests\test-features.sh (+14/-0)
- 22:41 — templates\hooks\stop.js (+29/-2)
- 00:15 — package.json (+1/-1) — "version": "0.3.7"
- 00:15 — README.md (+34/-14) — bash
- 00:13 — bin\cli.js (+12/-9)
- 00:11 — package.json (+1/-1) — "version": "0.3.6"
- 00:08 — bin\cli.js (+13/-2) — for (const ref of matches) {
- v0.1.0→v0.3.5: 19 releases from real copilot testing + CI
- 6 gaps found and fixed + observation gap + stale template gap + CI gap
- Rebrand: AZCLAUDE COPILOT → AZCLAUDE
- Skills-first philosophy: minimum 2 project-specific skills on /setup
- Hook captures all tools + tool sequences for reflex patterns
- GitHub Actions CI with Node matrix + live badge

## Next actions
1. Test on azcomply project (larger production case)
2. v0.4 planning: smarter runner prompt, reflex noise filtering
3. Test --deep copilot mode end-to-end

## Open blockers
- None

## In progress
- 00:12 — README.md (+318/-368)
