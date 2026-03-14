---
name: level8-orchestrated
description: >
  Build Level 8+: orchestrated intelligence (pipelines, debate, experiment).
  When to invoke intelligence vs evolution modules. Decision matrix for Level 8-10.
  Triggers on: "build level 8", "add intelligence", "orchestrated agents", "level 8".
tokens: ~200
requires: level7-extmcp
---

## Level 8+: Orchestrated Intelligence

Levels 8-10 are opt-in. They add overhead. Only build them when the answer to the
decision matrix questions is yes.

---

### Decision Matrix — When to Go Beyond Level 7

Answer these 8 questions. Each "yes" adds a capability. Stop when overhead > value.

| # | Question | Yes → Add | No → Skip |
|---|----------|-----------|-----------|
| 1 | Do you make the same architectural decision type repeatedly? | Add `intelligence/debate.md` | Use single-agent reasoning |
| 2 | Do you have 3+ agents that feed into each other? | Add `intelligence/pipeline.md` | Use parallel agents without chaining |
| 3 | Do you need to rank competing approaches across sessions? | Add `intelligence/elo.md` + `elo-rankings.json` | Use single-session comparison |
| 4 | Do your skill descriptions keep undertriggering? | Add `intelligence/opro.md` | Manually rewrite descriptions |
| 5 | Do you try risky approaches that break main? | Add `intelligence/experiment.md` | Work on main branch |
| 6 | Has friction repeated 10+ times with no fix? | Add `evolution/re-derivation.md` | Manually fix friction |
| 7 | Are your memory files growing faster than they're being used? | Add `evolution/cycle2-knowledge.md` | Let memory grow |
| 8 | Are agents becoming stale or overlapping? | Add `evolution/cycle3-topology.md` | Prune manually |

---

### Level 8 — Intelligence Layer

Build when: questions 1-5 have any "yes".

What to add:
- Load `intelligence/` capability files relevant to yes answers
- Add `elo-rankings.json` if running ELO across sessions
- Do NOT add all intelligence files — load what the matrix says

**Token cost of Level 8**: ~50-400 tokens per task (only loads what fires).
Not a permanent overhead — each intelligence file loads on demand.

---

### Level 9 — Persistent Knowledge Layer

Build when: questions 6-8 have any "yes" OR `/evolve` has been run 3+ times.

What to add:
- Schedule `/evolve` (or run manually after 5+ sessions)
- `evolution/cycle2-knowledge.md` for memory pruning
- `evolution/cycle3-topology.md` for agent topology maintenance

**When to run `/level-up` vs `/evolve`:**
- `/level-up` = structural upgrade (add a new level/capability) — run once
- `/evolve` = quality improvement cycle (improve existing capabilities) — run periodically

---

### Level 10 — Self-Improving Loop

Build only when:
- You've run `/evolve` 5+ times and the manual cycle is becoming overhead
- The project has 10+ sessions of history and active memory files
- A loop controller would genuinely reduce friction

**Warning**: Level 10 adds autonomous capability. Only build when the previous levels
are working correctly — a self-improving loop on a broken foundation improves nothing.

**What to build:**

Install the loop controller agent:
```bash
cp .claude/capabilities/../agents/loop-controller.md .claude/agents/loop-controller.md
```

Or instruct Claude to create `.claude/agents/loop-controller.md` by reading the template
at `.claude/agents/loop-controller.md` (installed by `npx azclaude`).

Once the loop controller exists, `/evolve` automatically delegates to it — no further
configuration needed. The handoff is built into the `/evolve` command.

**Level 10 complete when:**
- `.claude/agents/loop-controller.md` exists
- Running `/evolve` shows "Delegating to loop-controller…" instead of running manually
- First autonomous cycle completes and shows the cycle report

---

### Level 8+ Complete When
- Decision matrix answered — only relevant capabilities added
- ELO files exist if ELO was chosen
- `/evolve` schedule defined if knowledge consolidation was chosen
- No capability added "just in case" — every addition answers a matrix yes
