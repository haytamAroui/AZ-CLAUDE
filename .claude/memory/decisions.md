# Architecture Decisions — AZCLAUDE Copilot

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
