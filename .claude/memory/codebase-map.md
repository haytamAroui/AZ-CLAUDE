# Codebase Map — AZCLAUDE
Updated: 2026-03-16

| File | Purpose |
|------|---------|
| `bin/cli.js` | CLI installer: detectCLI, substitutePaths, sanitizePath, generateIntegrityHash, verifyIntegrity, AZCLAUDE_CLI env override |
| `package.json` | npm package metadata, version, bin entry, files list |
| `test-features.sh` | 613-test suite: template content + install integration + Node.js hooks + TDD opt-in tests |
| `CLAUDE.md` | Project rules, dispatch table, trade-off hierarchies |
| `DOCS.md` | 14-section professional user guide (all 16 commands, 27 capabilities, 10 levels) |
| `CONTRIBUTING.md` | Contributor guide: how to add capabilities, run tests, PR checklist |
| `LICENSE` | MIT license |
| `.claude/memory/goals.md` | Session state: current threads, done, next actions, blockers |
| `.claude/memory/codebase-map.md` | This file |
| `templates/CLAUDE.md` | Template installed into user projects (has `{{PLACEHOLDER}}` tokens) |
| `templates/commands/` | 16 command files: add, checkpoint, debate, dream, evolve, explain, fix, level-up, loop, persist, plan, review, setup, ship, status, test |
| `templates/agents/orchestrator-init.md` | One-shot init agent: scans project, fills CLAUDE.md, creates goals.md, writes blueprint.json |
| `templates/agents/loop-controller.md` | Level 10 autonomous evolution agent (3 cycles, delegates to micro-files) |
| `templates/capabilities/manifest.md` | Capability index — maps 27 files to when/why to load them |
| `templates/capabilities/shared/tdd.md` | TDD Iron Law — test-first protocol for developer domain |
| `templates/capabilities/shared/completion-rule.md` | Show output or stay in progress — no "should work". Includes 4 Cialdini pressure tests |
| `templates/capabilities/shared/session-rhythm.md` | ORIENT-WORK-PERSIST with native tool hooks |
| `templates/capabilities/shared/5-layer-agent.md` | Agent template: persona, scope, tools, constraints, domain context |
| `templates/capabilities/shared/native-tools.md` | Native Claude Code tools reference: when/how to use each |
| `templates/capabilities/shared/security.md` | Security: hook integrity, path sanitization, injection protection |
| `templates/capabilities/shared/quality-check.md` | Post-setup verification: 16 commands, CLAUDE.md filled, goals dated |
| `templates/capabilities/shared/friction-log.md` | Friction log format for ops/observations/ |
| `templates/capabilities/shared/vocabulary-transform.md` | Domain vocabulary mapping (developer/writer/researcher/compliance) |
| `templates/capabilities/shared/multi-cli-paths.md` | Multi-CLI path table (Claude Code/Codex/OpenCode/Gemini/Cursor) |
| `templates/capabilities/shared/review-reception.md` | Ban sycophancy, YAGNI check, pushback guidance for receiving reviews |
| `templates/capabilities/shared/pressure-test.md` | 4 Cialdini adversarial scenarios for enforcement skills |
| `templates/capabilities/level-builders/` | Level 1-8 build instructions loaded ONE at a time by /level-up |
| `templates/capabilities/evolution/` | detect, generate, evaluate, cycle2-knowledge, cycle3-topology, re-derivation |
| `templates/capabilities/intelligence/` | debate, elo, experiment, opro, pipeline |
| `templates/scripts/env-scan.sh` | Bash scanner: outputs JSON with project signals, scale, stack |
| `templates/hooks/user-prompt.js` | Node.js UserPromptSubmit hook: session marker, injection filter, goals.md injection |
| `templates/hooks/stop.js` | Node.js Stop hook: stamps goals.md date, writes friction stub |
| `templates/hooks/post-tool-use.js` | Node.js PostToolUse hook: git diff stat (+N/-M) + change summary |
| `ops/observations/` | Friction logs written by Stop hook and /persist |
| `.claude-plugin/plugin.json` | Claude Code marketplace plugin metadata (v3.13.0) |
| `.claude-plugin/marketplace.json` | Marketplace listing configuration |
