---
name: dispatch-strategies
description: >
  Pluggable scoring strategies for milestone dispatch ordering within the same wave.
  Load when: orchestrator reads plan.md with strategy: field set, or /tasks called with --strategy flag.
  NOT loaded by default — only when strategy-based ranking is active.
tokens: ~120
---

# Dispatch Strategies

Milestones in the same wave have no dependency between them — they CAN run in any order.
Strategies decide which order is BEST by scoring each milestone on its attributes.

---

## Milestone Attributes (scored by problem-architect or /blueprint)

| Attribute | Scale | Meaning |
|-----------|-------|---------|
| `Risk: 1-5` | 1 = safe, 5 = likely to fail or cascade | Failure cost. Higher = more dangerous. |
| `Value: 1-5` | 1 = nice-to-have, 5 = core feature | Business impact. Higher = more important. |
| `Complexity:` | SIMPLE / MEDIUM / COMPLEX | Effort estimate. Maps to 1 / 2 / 3 for scoring. |

If a milestone is missing an attribute, default: Risk=3, Value=3, Complexity=MEDIUM.

---

## Strategies

### risk_first (default for /copilot)

```
score = Risk × 2 + Complexity_int
```

Dispatch highest score first. Surfaces dangerous milestones early — fail fast while there's still room to pivot. If M3 has Risk:5 and M4 has Risk:2, run M3 first.

### value_first

```
score = Value × 2 + (6 - Risk)
```

Dispatch highest score first. Delivers the most impactful features early. Low-risk, high-value milestones rank highest — ship what matters.

### simple_first

```
score = (4 - Complexity_int) × 2 + (6 - Risk)
```

Dispatch highest score first. Clears easy wins, builds momentum, unblocks dependents cheaply. Best for greenfield projects where early confidence matters.

### complex_first

```
score = Complexity_int × 2 + Risk
```

Dispatch highest score first. Front-loads the hardest work while energy and context are fresh. Best for late-stage projects where derisking matters most.

---

## How to Set a Strategy

**In plan.md frontmatter:**
```markdown
---
strategy: risk_first
---
```

**Via /tasks flag:**
```
/tasks --strategy value_first
```

**Orchestrator behavior:**
- If plan.md has `strategy:` → use it for all wave dispatch ordering
- If no `strategy:` field → no scoring, dispatch by milestone ID order (current default)
- Strategy applies ONLY within a wave — cross-wave ordering is always dependency-driven

---

## Tie-Breaking

When two milestones have the same score:
1. Higher Risk breaks the tie (surface problems early)
2. If still tied, lower milestone ID first (M2 before M3)
