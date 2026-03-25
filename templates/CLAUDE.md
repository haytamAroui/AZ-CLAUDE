# {{PROJECT_NAME}}

## Quick Start
1. Run `/setup` — scans this project, fills in the sections below, creates `goals.md`
2. Run `/pulse` — shows current state of the project
3. Run `/add [what to build]` to add features, `/fix [what's broken]` to fix bugs
4. Run `/persist` before closing — saves session state so next session picks up where you left off

---

## Identity
{{PROJECT_DESCRIPTION}}
Domain: {{DOMAIN}} | Stack: {{STACK}} | Scale: {{SCALE}}

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
{{TDD_RULE}}

## Session State
Read `.claude/memory/goals.md` at the start of every session.
If it does not exist, create it with empty sections.
Update it at the end of every session.

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY the files relevant to the current task — nothing else.

Quick dispatch (core — used most sessions):
- /add → commands/add.md · /fix → commands/fix.md · /test → commands/test.md
- /audit → commands/audit.md · /blueprint → commands/blueprint.md · /ship → commands/ship.md
- /pulse → commands/pulse.md · /explain → commands/explain.md
- Any code task → shared/tdd.md + shared/completion-rule.md

Extended (load command file on use):
- /setup · /dream · /snapshot · /persist · /refactor · /doc · /loop
- /migrate · /deps · /find · /create · /reflect · /hookify
- Spec-driven: /constitute → /spec → /clarify → /blueprint → /copilot
  - /analyze: cross-artifact consistency check (ghost milestones, spec vs. code drift)
  - /tasks: dependency graph + parallel wave groups from plan.md
  - /issues: convert plan.md milestones to GitHub Issues
- Standards: /driven → generates .claude/code-rules.md (coding contract for /add and /fix)
  - /verify → audits existing code against code-rules.md (file:line violations + auto-fix)
- MCP: /mcp → recommends and installs MCP servers based on your stack

Advanced (Level 5+):
- /evolve · /debate · /level-up
- Parallel execution: /parallel → dispatch multiple milestones simultaneously (worktree isolation + auto-merge)
  - /tasks → shows which milestones can run in parallel (wave groups)

## Parallel Agent Rules
When running parallel agents (/copilot with parallel waves, or /parallel):
1. **Own your scope** — only write files in your declared directories. Touch nothing outside.
2. **Errors in files you didn't modify** → do not fix them. Report "scope violation: {file}" to orchestrator.
3. **Never push from a worktree** — commit locally only. Orchestrator merges after all agents complete.
4. **Test in isolation** — run `{test framework} tests/{your-area}/` not the full suite. Cross-cutting failures are expected during parallel execution.
5. **Report your branch** — always end completion report with "Branch: parallel/{slug}".

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

**Dispatch flow for any non-trivial task:**
1. Spawn `problem-architect` → get Team Spec (agents needed, files to pre-read, risks)
2. Follow Team Spec: load listed skills, pre-read listed files
3. If structural decision flagged → spawn `architecture-advisor` skill or run /debate
4. Implement → spawn `code-reviewer` on result → spawn `test-writer` if coverage needed

**Skip dispatch only if:** 1-2 files, clearly scoped, pure config/docs, no cross-module impact.

## Trade-Off Hierarchies
When priorities conflict:
1. {{PRIORITY_1}}
2. {{PRIORITY_2}}
3. {{PRIORITY_3}}

## Available Commands
/dream · /setup · /fix · /add · /audit · /test · /blueprint · /evolve · /debate · /snapshot · /persist · /level-up · /ship · /pulse · /explain · /loop · /refactor · /doc · /migrate · /deps · /find · /create · /reflect · /hookify · /spec · /clarify · /analyze · /constitute · /tasks · /issues · /driven · /mcp · /parallel · /verify · /inoculate · /ghost-test
