# Project Constitution
project: AZCLAUDE
created: 2026-03-22
last_updated: 2026-03-22
version: 1

---

## Non-Negotiables (Never Do This)

These rules are inviolable. No exception, no matter the deadline or pressure.

- Never make breaking changes to the installed `.claude/` directory structure without providing a migration path
- Never hardcode file paths or use OS-specific separators — always use `path.join()` (must work on Windows, Mac, Linux)
- Never introduce external runtime dependencies — `package.json` has zero dependencies and must stay that way
- Never modify files outside `.claude/` (CLAUDE.md, package.json, source files) without explicit user confirmation

## Required Patterns (Always Do This)

These patterns must be used in all new code. Deviations require explicit approval.

- Every template change must be covered by `tests/test-features.sh` before commit
- Every new command must be wired in exactly 3 places: template file (`templates/commands/`) + `cli.js` COMMANDS array + `templates/CLAUDE.md`
- `bash tests/test-features.sh` must exit 0 before every release — no green tests, no publish
- Templates are instructions for Claude, not code — keep them precise and short; over-engineered templates reduce reliability

## Forbidden Dependencies

Libraries, frameworks, or services that must never be introduced:

- Any npm runtime package (zero-dependency constraint — Node.js built-ins only)
- LangChain, AutoGPT, or any agent framework (Claude Code's Agent/Task primitives are the runtime)
- Any build step or compiler (templates are plain Markdown, no transpilation)

## Architectural Commitments

Decisions already made. Not open for debate without a /debate session.

| Concern | Decision | Reason |
|---------|----------|--------|
| Template format | Markdown | Claude reads markdown natively — no parser, no schema, no compile step |
| Installer | Node.js CLI (`bin/cli.js`) | Cross-platform requirement — shell scripts fail on Windows |
| Agent runtime | Pure Claude Code primitives | No external framework; Agent/Task tools are the runtime |
| Distribution | Single npm package | One `npx` command, zero setup steps for the user |

## Pre-Push / Pre-Publish Gate (Never Do This)

Before any `git push` or `npm publish`, ALL of the following must be in sync with the new version:

- [ ] `README.md` — skill count, agent count, version references accurate
- [ ] `DOCS.md` — version badge, skill count, agent count, skills table accurate
- [ ] `CLAUDE.md` (project root) — skill/agent counts in Identity line accurate
- [ ] `package.json` — `description` field counts accurate
- [ ] `.claude-plugin/plugin.json` — `version` and description counts accurate
- [ ] `.claude-plugin/marketplace.json` — `version` and description counts accurate

Pushing stale counts is a non-negotiable violation. Update docs first, always.

## Definition of Done

A change is only "done" when ALL of the following are true:

- [ ] `bash tests/test-features.sh` exits 0 (all grep assertions pass)
- [ ] All 6 files in the Pre-Push Gate above are in sync
- [ ] Version bumped in `package.json`
- [ ] Committed and pushed to `main`
- [ ] Published to npm (`npm publish`)

## Priority Hierarchy

When requirements conflict, resolve in this order:

1. **Template quality > feature count** — one precise template beats three vague ones
2. **Real behavior > claimed behavior** — if it can't be tested, it doesn't exist
3. **User clarity > framework elegance** — the developer is the last consumer, optimize for them

## User Values

Users of this project value (in order): **reliability > simplicity > features**
Optimise in this order when trade-offs arise.

---

_This constitution governs all AI actions in this project.
Any command (/add, /fix, /copilot) must check this file before implementing._
