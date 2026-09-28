# {{PROJECT_NAME}}

## Quick Start
1. Run `/setup` — scans this project, fills in the sections below, creates `goals.md`
2. Read `.claude/memory/goals.md` — shows current state of the project
3. Run `/add [what to build]` to add features, `/fix [what's broken]` to fix bugs
4. Update `.claude/memory/goals.md` before closing — so the next session picks up where you left off

---

## Identity
{{PROJECT_DESCRIPTION}}
Domain: {{DOMAIN}} | Stack: {{STACK}} | Scale: {{SCALE}}

## Verify
Quick: {{QUICK_VERIFY}}
Test: {{TEST_VERIFY}}
Build: {{BUILD_VERIFY}}

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
3. **Use existing tools** — Run tests with the project's test command (see Verify section) and trust its exit code. Never invent grep/sed/awk commands to parse test output. If you need a custom command to check results, ask the user first.
4. **No infinite retry** — If a command fails, diagnose the cause before re-running. Max 2 retries for the same command. After 2 failures, stop and report the error to the user — do not loop.
{{TDD_RULE}}

## Session State
Read `.claude/memory/goals.md` at the start of every session.
If it does not exist, create it with empty sections.
Update it at the end of every session.

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY the files relevant to the current task — nothing else.

Twelve commands, grouped by what they add that Claude Code cannot supply natively.
Anything that duplicated a native command was removed — see README "The 12 Commands".

Dev loop:
- /setup → commands/setup.md · /fix → commands/fix.md · /add → commands/add.md
- /test → commands/test.md · /ship → commands/ship.md
- Any code task → shared/tdd.md + shared/completion-rule.md

Spec-driven chain (judgment layer — native gives the mechanism, never the content):
- /constitute → commands/constitute.md · /spec → commands/spec.md
- /clarify → commands/clarify.md · /blueprint → commands/blueprint.md

Knowledge layer (the cloud product — native auto-memory is machine-local):
- /ingest → commands/ingest.md · /knowledge → commands/knowledge.md

Autonomy:
- /copilot → commands/copilot.md

Native Claude Code already covers what the rest of this framework used to: /doctor,
/security-review, /code-review, /loop, /batch, /workflows, /rewind, /usage, /skills.
Do not reimplement them — reach for the native command instead.

## Parallel Agent Rules
When running parallel agents:
1. **Own your scope** — only write files in your declared directories. Touch nothing outside.
2. **Errors in files you didn't modify** → do not fix them. Report "scope violation: {file}" to orchestrator.
3. **Never push from a worktree** — commit locally only. Merge after all agents complete.
4. **Test in isolation** — run `{test framework} tests/{your-area}/` not the full suite. Cross-cutting failures are expected during parallel execution.
5. **Report your branch** — always end completion report with "Branch: {branch}".

Unknown capability → grep manifest.md by description, load match

## Agent Auto-Dispatch
Agents live in `.claude/agents/`. Spawn them via the Agent tool with the matching `subagent_type`.
**You MUST spawn the matching agent when these conditions are met — do not handle these tasks yourself.**

| Condition | Agent to spawn | Why |
|-----------|---------------|-----|
| Task touches 3+ files or crosses module boundaries | `problem-architect` | Pre-flight analysis: team spec, risks, file ownership |
| Architecture decision between 2+ real options | `architecture-advisor` (skill) | Evidence-based trade-off analysis, not gut feeling |
| Code was written or modified | `code-reviewer` | Catches bugs, security issues, style violations |
| Code needs test coverage | `test-writer` | Generates tests matching project framework + patterns |
| Task spans 2+ milestones or needs parallel work | `orchestrator` | Owns plan.md, dispatches milestone-builder agents |
| Security-sensitive change (auth, keys, hooks, deploy) | `security-auditor` | 111-rule scan, structured report with file:line refs |
| Infrastructure, CI/CD, Docker, deploy config | `devops-engineer` | Pipeline, container, cloud infrastructure specialist |
| Test strategy, E2E, release readiness | `qa-engineer` | Risk-based coverage, acceptance criteria validation |
| Spec file provided for planning | `spec-reviewer` | Validates spec quality before /blueprint uses it |
| Milestone about to be implemented | `constitution-guard` | Checks milestone against constitution.md non-negotiables |
| Document ingestion or knowledge maintenance | `knowledge-compiler` | Extracts entities/concepts, maintains cross-references, updates knowledge index |

**Mandatory pipeline for ALL code tasks (enforced by hook on every message):**
1. **ALWAYS** spawn `problem-architect` FIRST → get Team Spec (agents, skills, files, risks)
2. **RELAY**: Pass Team Spec + pre-read file contents to the next agent via `## Pre-loaded Context` block. The receiving agent MUST NOT re-read files listed in that block. See `capabilities/shared/context-relay.md` for role-based filters and size limits.
3. Follow Team Spec exactly: load listed skills, pre-read listed files, in order
4. If structural decision flagged → spawn `architecture-advisor` skill for an evidence-based comparison
5. Implement following Team Spec patterns
6. **ALWAYS** spawn `code-reviewer` after implementation
7. **ALWAYS** spawn `test-writer` if tests are needed

**Skip pipeline only if:** message is a pure question with no action verb (e.g., "what does this function do?").
**Never skip for:** any code change, no matter how small. The pipeline catches bugs in 1-line changes too.

**Self-healing:** If problem-architect's Team Spec lists a MISSING skill or agent (domain expertise not installed):
- Use `skill-creator` to generate the missing skill before implementation
- Use `agent-creator` to generate the missing agent before implementation
- The created skill/agent is immediately available and persists for all future tasks
- Example: task needs GraphQL expertise → no GraphQL skill exists → skill-creator generates one → use it

## Trade-Off Hierarchies
When priorities conflict:
1. {{PRIORITY_1}}
2. {{PRIORITY_2}}
3. {{PRIORITY_3}}

## Available Commands
/setup · /fix · /add · /test · /ship · /constitute · /spec · /clarify · /blueprint · /ingest · /knowledge · /copilot
