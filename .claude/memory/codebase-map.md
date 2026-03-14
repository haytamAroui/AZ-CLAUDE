# Codebase Map — AZCLAUDE
Updated: 2026-03-14

| File | Purpose |
|------|---------|
| `bin/cli.js` | CLI installer: detectCLI, substitutePaths, sanitizePath, generateIntegrityHash, verifyIntegrity, AZCLAUDE_CLI env override |
| `package.json` | npm package metadata, version, bin entry, files list |
| `test-features.sh` | 489-test suite: template content + install integration tests |
| `CLAUDE.md` | Project rules, dispatch table, trade-off hierarchies |
| `.claude/memory/goals.md` | Session state: current threads, done, next actions, blockers |
| `.claude/memory/codebase-map.md` | This file |
| `templates/CLAUDE.md` | Template installed into user projects (has `{{PLACEHOLDER}}` tokens) |
| `templates/commands/` | 15 skill files: add, debate, dream, evolve, explain, fix, level-up, loop, persist, plan, review, setup, ship, status, test |
| `templates/agents/orchestrator-init.md` | One-shot init agent: scans project, fills CLAUDE.md, creates goals.md, writes blueprint.json |
| `templates/agents/loop-controller.md` | Level 10 autonomous evolution agent (3 cycles, delegates to micro-files) |
| `templates/capabilities/manifest.md` | Capability index — maps files to when/why to load them |
| `templates/capabilities/shared/tdd.md` | TDD Iron Law — test-first protocol for developer domain |
| `templates/capabilities/shared/completion-rule.md` | Show output or stay in progress — no "should work" |
| `templates/capabilities/shared/session-rhythm.md` | ORIENT→WORK→PERSIST with native tool hooks |
| `templates/capabilities/shared/5-layer-agent.md` | Agent template: persona, scope, tools, constraints, domain context |
| `templates/capabilities/shared/native-tools.md` | Native Claude Code tools reference: when/how to use each |
| `templates/capabilities/shared/security.md` | Security: hook integrity, path sanitization, injection protection |
| `templates/capabilities/shared/quality-check.md` | Post-setup verification: 15 commands, CLAUDE.md filled, goals dated |
| `templates/capabilities/shared/friction-log.md` | Friction log format for ops/observations/ |
| `templates/capabilities/shared/vocabulary-transform.md` | Domain vocabulary mapping (developer/writer/researcher/compliance) |
| `templates/capabilities/shared/multi-cli-paths.md` | Multi-CLI path table (Claude Code/Codex/OpenCode/Gemini/Cursor) |
| `templates/capabilities/level-builders/` | Level 1-8 build instructions loaded ONE at a time by /level-up |
| `templates/capabilities/evolution/` | detect, generate, evaluate, cycle2-knowledge, cycle3-topology, re-derivation |
| `templates/capabilities/intelligence/` | debate, elo, experiment, opro, pipeline |
| `templates/scripts/env-scan.sh` | Bash scanner: outputs JSON with project signals, scale, stack |
| `ops/observations/` | Friction logs written by Stop hook and /persist |
