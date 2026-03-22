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
1. Post to Claude Code communities (Reddit r/ClaudeAI, Discord, X) — posts written and ready since earlier session
2. Tag v0.4.19 on GitHub
3. Test npx azclaude-copilot@latest on azcomply — install new agents (spec-reviewer, constitution-guard), then run /spec + /copilot

## Open blockers
- Marketplace listing approval pending (no timeline known)
