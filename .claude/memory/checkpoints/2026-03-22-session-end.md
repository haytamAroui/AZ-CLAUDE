---
date: 2026-03-22T23:30
label: v0.4.21-published-frontend-design-skill-improvements
files_in_progress: []
---

## What I'm doing right now
Session complete. v0.4.21 published to npm and tagged on GitHub. Two skill template improvements (anti-trigger + ambiguity protocol) stolen from external templates and applied to both frontend-design and skill-engineering-guide.

## Why — key decisions made this session

- **Anti-trigger pattern** added to skill-engineering-guide: `Do NOT trigger when:` in frontmatter prevents false-positive skill firing — Anthropic's own docs say Claude undertriggers, but false positives waste context just as badly
- **Ambiguity Protocol** added to all skills: explicit ask/redirect/fallback rules — silent partial output is worse than asking one question
- **frontend-design skill** ported to AZCLAUDE from external "best-in-class" template — 12 aesthetic directions, forbidden font/color anti-patterns, complexity budget table, Step 0 context detection
- **Rejected** both Universal Skill Templates wholesale — too compliance-heavy; extracted only 2 concrete improvements worth stealing
- **v0.4.20** = frontend-design skill (9 skills total, 1366 tests)
- **v0.4.21** = anti-trigger + ambiguity protocol improvements
- Both versions tagged on GitHub: v0.4.20 → 5b0fd3a, v0.4.21 → 6c8e463
- **3 learned reflexes** created from observations: release-trio (0.90), new-command-trio (0.85), plugin-sync (0.88)
- **.claude/constitution.md** written — 4 non-negotiables, 4 required patterns, 4 DoD criteria
- **Marketplace submitted** 2026-03-22 — plugin files corrected (repo URL, version, counts)

## What I know that isn't written down yet

- v0.4.21 is the current published version
- Tags v0.4.20 and v0.4.21 are both live on GitHub (just pushed in this session)
- Test count: 1366 (was 1359 before frontend-design was added)
- SKILLS array in bin/cli.js now has 9 entries (added `frontend-design`)
- The `/analyze` command was run on azclaude itself — found count drift across 4 files, all fixed
- `/constitute` was dogfooded on azclaude — constitution.md now governs all AI actions
- Plugin marketplace regression tests added to test-features.sh: AZ-CLAUDE-COPILOT repo check, version format check
- Uncommitted local state: `.claude/hooks/*.js` (4 local dev hooks, not shipped), `.claude/constitution.md` (local, not a template), old checkpoint deletions
- goals.md "Next actions" item 1 is stale — evolve branch already merged (4ce0605)

## What's next (top 3)
1. Test `npx azclaude-copilot@latest` on azcomply — install new agents (spec-reviewer, constitution-guard), run `/constitute` + `/spec` + `/copilot`
2. Post to Claude Code communities (Reddit r/ClaudeAI, Discord, X) — posts written and ready
3. Monitor marketplace listing approval (submitted 2026-03-22, no timeline known)

## Risk / open question
- Marketplace approval timeline unknown — could be days or weeks
- azcomply test not yet done — new agents (spec-reviewer, constitution-guard) untested in real project context
