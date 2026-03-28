# Architecture Decisions — AZCLAUDE

## Classification Drift Risk — 2026-03-18

**Decision**: Accept template-level enforcement as sufficient for v0.1, track drift via /evolve.

**Context**: The architecture has 5 extension points (commands, skills, capabilities, agents, hooks). This flexibility is a strength but creates risk of behavioral overlap.

**Three risks identified**:
1. **Classification drift** — same behavior ends up in a skill AND a capability AND a command
2. **Behavioral overlap** — new contributor puts auth logic in both an agent and a skill
3. **Runtime enforcement gap** — checklists guide, but don't prevent duplication at runtime

**Why accept this for now**:
- The manifest is the single coordination layer — if it's accurate, the right pieces load
- `/evolve` Cycle 3 (topology) detects agent overlap and dead manifest entries
- The quality checklist asks "does another skill already cover this domain?"
- At current scale (26 commands, 8 skills, 7 agents), manual coordination works

**When to revisit**:
- When total extension count exceeds 50 (commands + skills + agents)
- When 2+ contributors are adding extensions simultaneously
- When /evolve detects the same pattern in 3+ different extension types

**Trade-off**: Speed of evolution > architectural purity. The system that ships and self-improves beats the perfectly classified system that never launches.

## Memory rotation architecture — 2026-03-20
**Context**: MEDIUM project (215 files), Node.js CLI, hooks run on every tool call, target projects unbounded size
**Choice**: v0.3.8 — in-memory rotation, PID-scoped counter, session-once marker preserved, observations path unchanged
**Why**: Proposal's missing session-once marker costs 175k tokens/session re-injection; shared counter has TOCTOU race; disk read-back adds unnecessary I/O on hot path; dedup removal causes instant rotation on single-file iterative edits
**Reconsider when**: Plan status / reflex guidance injection in user-prompt wanted — add ON TOP of v0.3.8, not replacing it

## Intelligent copilot architecture (three-tier) — 2026-03-20
**Context**: MEDIUM project (215 files, 1 contributor), developer tooling, copilot targets projects of any size
**Choice**: Three-tier approved for v0.4 with 4 corrections: Sonnet orchestrator (Opus = --deep flag), milestone-builder.md base template (not pure dynamic), file-write overlap check before parallel dispatch, copilot.md keeps full logic as fallback
**Why**: Separation enforces read-before-write mechanically (tool restriction), plan.md owned by one agent prevents status corruption, architect spec is explicit artifact (logged to decisions.md), parallel dispatch justified for 12-milestone projects
**Reconsider when**: Projects under 6 milestones or single-domain → flat loop is sufficient
**Critical gap to fix**: Architect spec must include "Files Written" section; orchestrator must check overlap before parallel dispatch or silent file corruption occurs

## Security Auditor Architecture — 2026-03-21
**Context**: STANDARD scale, developer tooling, Claude Code environment scanner
**Choice**: One `security-auditor` agent (not split into 5 sub-agents)
**Why**: All 5 categories (secrets/permissions/hooks/MCP/agent-configs) share same tools (Read, Grep, Bash), same output format (Security Report), same invocation path (/sentinel + /ship). Splitting would require an orchestrator to aggregate — unnecessary complexity at STANDARD scale. Agent differs from /sentinel command in that it runs as a subprocess with isolated context, returns a structured Security Report for programmatic consumption, and can be invoked by orchestrator before /ship. /sentinel dispatches to the agent when installed; falls back to inline layers when agent is missing.
**Reconsider when**: 5+ category specialists needed with different models per category, or MCP scanning requires live server interaction

## DAG Dispatch Merge Strategy — 2026-03-28
**Question**: Merge-on-complete vs merge-after-batch in DAG-based parallel dispatch
**Options**: Merge-on-complete (merge each branch immediately when agent finishes) vs Merge-after-batch (wait for all dispatched agents, then merge sequentially)
**Winner**: Merge-on-complete with batch-merge fallback (confidence: 72/100)
**Deciding claim**: Unblocking dependents immediately is the entire point of DAG dispatch — without merge-on-complete, DAG degrades to wave dispatch with extra bookkeeping [VERIFIED]
**Dissent**: Orchestrator complexity increases — more complex Markdown instructions are harder for Claude to follow reliably [VERIFIED]. Mitigated by batch-merge fallback for simpler projects (max_parallel <= 3).
**Secondary decision**: DAG state file extends `parallel-wave-state.md` with `dispatch_mode: dag` field rather than replacing the format (backward compatible).
**Reconsider when**: Rate limiting with 6+ concurrent agents proves to be a bottleneck (untested), or orchestrator instruction-following degrades measurably
