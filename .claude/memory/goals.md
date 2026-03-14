# Goals — AZCLAUDE
Updated: 2026-03-14

## Current threads
- Framework building: v1.9.1 shipped — 15 commands, native tools wired, 468 tests
- Dogfooding: AZCLAUDE just installed on itself — now using /persist and session-rhythm on own repo
- Install integration test: gap identified — test-features.sh tests templates but not the `npx azclaude` install output

## Done this session
- v1.7.0: CE 2.0 self-correction (exit-code gate, structured checkpoint, structured escalation)
- v1.8.0: native Claude Code tools wired into all 11 commands (AskUserQuestion, TaskCreate, CronCreate, mcp__ide__getDiagnostics, EnterWorktree, etc.)
- v1.9.0: core developer commands added (/add, /review, /test, /plan)
- v1.9.1: fixed 4 real bugs (CLI missing commands, wrong copy path, no IDE fallback, /plan approval gate)
- AZCLAUDE installed on itself — CLAUDE.md filled, goals.md created

## Next actions
1. Add install integration test — run `npx azclaude` on a blank temp dir, verify installed files are correct
2. Fix CLAUDE.md template dispatch table — /add, /review, /test, /plan are missing from quick dispatch
3. Consider: what does /evolve produce on the AZCLAUDE repo itself? Run it and see.

## Open blockers
- None
