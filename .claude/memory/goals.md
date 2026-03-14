# Goals — AZCLAUDE
Updated: 2026-03-14

## Current threads
- None — v2.0.0 shipped and clean

## Done this session
- v2.0.0: Node.js cross-platform hooks (user-prompt.js, stop.js) — no bash required
- v2.0.0: TDD rewritten as signal-based opt-in — no more "Iron Law" mandate
- bin/cli.js: installHookScripts(), uses process.execPath + absolute path in settings.json
- 504 tests, 0 failures

## Next actions
1. Commit v2.0.0 with message: "v2.0.0 — Node.js hooks (cross-platform), TDD opt-in protocol (504 tests)"
2. Run /evolve after commit to check for new gaps introduced by v2.0.0
3. Consider: update README Risks section — bash hook risk is now gone

## Open blockers
- None
