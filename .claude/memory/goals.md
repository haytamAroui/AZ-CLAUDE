# Goals — AZCLAUDE
Updated: 2026-03-22

## Current threads
- Marketplace listing submitted — awaiting approval (form submitted 2026-03-22)

## Done this session
- v0.4.14–v0.4.19 published: smart install (auto-detect first/upgrade/verify), zero-arg routing fix, smart onboarding banner, @latest consistency, description fix, count fixes, plugin file fixes
- .claude/constitution.md written — 4 non-negotiables, 4 required patterns, 4 DoD criteria, CLAUDE.md Rule 5 added
- /constitute, /analyze, /spec, /clarify, /blueprint dogfooded on azclaude itself — all working
- /analyze found and fixed count drift: CLAUDE.md 27→33 commands, 10→13 agents; README/package.json 15→13 agents
- .claude-plugin/marketplace.json: fixed repo AZ-CLAUDE→AZ-CLAUDE-COPILOT, v0.4.12→v0.4.19, 27→33 commands
- .claude-plugin/plugin.json: v0.4.12→v0.4.19, 27→33 commands, new features in description
- .claude/specs/01-marketplace-listing.md: spec written → clarified → blueprinted → done
- tests/test-features.sh: +2 plugin regression guards (repo=AZ-CLAUDE-COPILOT, version format) → 1359 tests
- DOCS.md: version bump 0.4.14→0.4.18
- v0.4.18 tagged on GitHub, v0.4.19 published to npm

## Next actions
1. Commit /evolve fixes on azclaude/evolve-2026-03-22 branch and merge to main (doc-only — no version bump, no npm publish)
2. Post to Claude Code communities (Reddit r/ClaudeAI, Discord, X) — posts written and ready since earlier session
3. Test npx azclaude-copilot@latest on azcomply — install new agents (spec-reviewer, constitution-guard), then run /spec + /copilot

## Open blockers
- Marketplace listing approval pending (no timeline known)

## In progress
- 22:32 — ops\evolution-log.md
- 22:32 — .claude\memory\sessions\2026-03-22-cycle2.md
- 22:22 — .claude\capabilities\manifest.md — last_updated: 2026-03-22
- 22:21 — DOCS.md (+20/-1) — Hook I/O Contract (stdout vs stderr)
- 22:21 — CLAUDE.md (+1/-1)
- 22:21 — .claude-plugin\plugin.json (+1/-1) — "version": "0.4.19",
- 22:20 — .claude-plugin\marketplace.json (+1/-1) — "version": "0.4.19",
