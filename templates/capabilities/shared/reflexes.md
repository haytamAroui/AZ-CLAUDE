---
name: reflexes
description: >
  Load when /evolve finds repeated tool-use patterns, when reviewing learned behaviors,
  when the observer has accumulated enough observations, or when promoting reflexes to
  skills/agents. Load when: "reflexes", "learned behaviors", "what has copilot learned",
  "observation patterns", "promote reflex", "reflex status".
tokens: ~250
---

# Reflexes — Learned Behavioral Patterns

A reflex is an atomic learned behavior extracted from session observations.
Smaller than a skill, more concrete than a pattern. Confidence-scored.

## Reflex Model

```yaml
---
id: grep-before-edit
trigger: "when modifying code files"
action: "Search with Grep first, confirm with Read, then Edit"
confidence: 0.7
domain: workflow
scope: project
evidence_count: 8
last_observed: 2026-03-18
---
```

### Properties
- **Atomic** — one trigger, one action (not multi-step)
- **Confidence-scored** — 0.3 (tentative) → 0.5 (moderate) → 0.7 (strong) → 0.9 (certain)
- **Domain-tagged** — code-style, testing, git, debugging, workflow, file-patterns, security
- **Scoped** — `project` (default) or `global`
- **Evidence-backed** — tracks observation count

## Confidence Rules

| Observations | Initial confidence |
|-------------|-------------------|
| 3-5 | 0.3 (tentative) |
| 6-10 | 0.5 (moderate) |
| 11-20 | 0.7 (strong) |
| 21+ | 0.85 (near-certain) |

Adjustments:
- +0.05 per confirming observation
- -0.10 per contradicting observation (user corrects behavior)
- -0.02 per week without observation (automatic decay)
- Confidence never exceeds 0.95
- Confidence < 0.15 after decay → auto-pruned by `/reflexes clear`

## Confidence Decay

Reflexes that aren't confirmed decay over time. This prevents stale patterns from
accumulating. The decay formula:

```
effective_confidence = base_confidence - (0.02 × weeks_since_last_observed)
```

Example: a reflex with confidence 0.5 not observed for 10 weeks → 0.5 - 0.2 = 0.3 (demoted to tentative).

**Auto-pruning**: `/reflexes clear` and `/evolve` Cycle 2 remove reflexes where
effective_confidence < 0.15. This keeps the reflex library lean and relevant.

## Reflex Frontmatter

Every reflex file includes `last_observed` date for decay calculation:

```yaml
---
id: grep-before-edit
trigger: "when modifying code files"
action: "Search with Grep first, confirm with Read, then Edit"
confidence: 0.7
domain: workflow
scope: project
evidence_count: 8
last_observed: 2026-03-18
created: 2026-03-10
---
```

## Scope Rules

| Pattern type | Scope | Examples |
|-------------|-------|---------|
| Language/framework conventions | **project** | "Use React hooks", "Django REST patterns" |
| File structure preferences | **project** | "Tests in `__tests__/`" |
| Code style | **project** | "Functional over class-based" |
| Security practices | **global** | "Validate user input", "Sanitize SQL" |
| Tool workflow preferences | **global** | "Grep before Edit", "Read before Write" |
| Git practices | **global** | "Conventional commits", "Small focused commits" |

**Default to `project` scope.** Promote to global only when seen in 2+ projects with confidence >= 0.8.

## Storage

```
.claude/memory/reflexes/
├── observations.jsonl        ← raw tool-use observations (auto-captured by hook)
├── project/                  ← project-scoped reflexes
│   ├── grep-before-edit.md
│   └── prefer-functional.md
└── global/                   ← universal reflexes (promoted)
    └── validate-user-input.md
```

## Observation Format (observations.jsonl)

```json
{"ts":"2026-03-18T10:30:00Z","tool":"Edit","file":"src/auth.js","session":"abc","event":"complete"}
{"ts":"2026-03-18T10:30:05Z","tool":"Bash","cmd":"npm test","session":"abc","event":"complete"}
```

Captured automatically by PostToolUse hook. Truncated to last 500 entries.
Auto-purged after 30 days. Secret patterns scrubbed before writing.

## Pattern Detection (run by /evolve or /reflexes analyze)

Detect these patterns from observations.jsonl:

1. **Tool sequences** — same tool chain repeated 3+ times (Grep → Read → Edit)
2. **User corrections** — user immediately undoes/redoes an action
3. **Error → fix pairs** — error output followed by a fix pattern
4. **File co-access** — same files always read/edited together
5. **Naming conventions** — consistent naming in created files

## Evolution Path

```
Observations (raw)
    → 3+ occurrences detected
    → Reflex created (confidence 0.3-0.85)
    → /evolve clusters related reflexes
    → Strong cluster (3+ reflexes, avg confidence > 0.7)
    → Evolved into skill, command, or agent
```

## Integration with /evolve

When `/evolve` runs Cycle 1 (Detect):
1. Read `.claude/memory/reflexes/observations.jsonl`
2. Detect patterns (3+ occurrences minimum)
3. Create/update reflex files in `.claude/memory/reflexes/project/`
4. Check for promotion candidates (seen in 2+ projects, confidence >= 0.8)
5. Cluster related reflexes → generate skills if cluster is strong enough

## Reading Reflexes Before Acting

Agents and commands should read reflexes before implementing:
```
Read .claude/memory/reflexes/project/ → follow strong reflexes (confidence >= 0.7)
Read .claude/memory/reflexes/global/ → follow universal reflexes
```

Reflexes with confidence < 0.5 are suggestions only — do not enforce.
