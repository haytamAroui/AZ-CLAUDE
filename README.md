# AZCLAUDE

**Claude Code architecture-native AI coding environment.**

Most AI coding tools fight the model. AZCLAUDE works with how Claude Code actually works — lazy loading, manifest-driven dispatch, micro-sections, no persistent orchestrator. The result: 55x less token overhead per task, and an architecture that stays clean as you add new capabilities.

---

## Why AZCLAUDE

Every AI coding environment faces the same problem: how do you give Claude the right instructions without burning the context window on instructions it doesn't need?

The wrong answer — which most tools use — is to load everything upfront. One big file with all the rules, all the protocols, all the knowledge. When Claude fixes a bug, it reads 1752 lines of orchestrator instructions, 563 lines of evolution logic, and 200 lines of memory files before writing a single line of code. That's ~21,000 tokens consumed before any work starts.

Claude Code itself solves this differently. It was built on three principles:

1. **CLAUDE.md is a dispatch table, not a knowledge base.** It tells Claude where to look, not what to know. ~30 lines.
2. **Everything is cold until accessed.** Tools, files, agents — nothing loads until a specific task needs it.
3. **3-layer progressive disclosure.** Metadata (always loaded, ~100 tokens) → body (loaded if matched) → references (loaded if explicitly needed).

AZCLAUDE is built on these same principles. Not inspired by them — structurally aligned with them.

---

## Token Economics

| Task | Traditional (monolith) | AZCLAUDE |
|------|----------------------|----------|
| Bug fix | ~21,100 tokens | ~380 tokens |
| `/evolve` full cycle | ~20,000 tokens | ~660 tokens |
| `/debate` hard decision | ~29,000 tokens | ~350 tokens |
| New project setup | ~15,000 tokens | ~400 tokens |

**55x less context overhead on a simple bug fix.**

The difference: AZCLAUDE loads CLAUDE.md (~200 tokens) + the specific capability files for the task (~150-400 tokens). A monolithic orchestrator loads everything whether or not the task needs it.

---

## Architecture

```
CLAUDE.md (~30 lines)                    ← always loaded, dispatch table
│
├── reads manifest.md on first task      ← capability index, ~100 tokens
│
└── loads only what matches
    │
    ├── .claude/capabilities/
    │   ├── shared/          ← inject alongside any task
    │   │   ├── tdd.md                   ~50 tokens
    │   │   ├── completion-rule.md       ~40 tokens
    │   │   ├── session-rhythm.md        ~80 tokens
    │   │   ├── friction-log.md          ~60 tokens
    │   │   ├── 5-layer-agent.md         ~500 tokens
    │   │   ├── vocabulary-transform.md  ~80 tokens
    │   │   ├── multi-cli-paths.md       ~80 tokens
    │   │   └── quality-check.md         ~80 tokens
    │   │
    │   ├── evolution/       ← loaded per cycle, not all at once
    │   │   ├── detect.md                ~250 tokens
    │   │   ├── generate.md              ~250 tokens
    │   │   ├── evaluate.md              ~200 tokens
    │   │   ├── cycle2-knowledge.md      ~200 tokens
    │   │   ├── cycle3-topology.md       ~250 tokens
    │   │   └── re-derivation.md         ~150 tokens
    │   │
    │   ├── intelligence/    ← opt-in only
    │   │   ├── debate.md                ~400 tokens
    │   │   ├── opro.md                  ~300 tokens
    │   │   ├── elo.md                   ~200 tokens
    │   │   ├── pipeline.md              ~350 tokens
    │   │   └── experiment.md            ~80 tokens
    │   │
    │   └── level-builders/  ← load ONE at a time
    │       ├── level1-claudemd.md       ~200 tokens
    │       ├── level2-mcp.md            ~150 tokens
    │       ├── level3-skills.md         ~600 tokens
    │       ├── level4-memory.md         ~200 tokens
    │       ├── level5-agents.md         ~400 tokens
    │       ├── level6-hooks.md          ~400 tokens
    │       ├── level7-extmcp.md         ~150 tokens
    │       └── level8-orchestrated.md   ~200 tokens
    │
    ├── .claude/commands/    ← skills, loaded when invoked
    │   ├── dream.md         ← thin router → orchestrator-init
    │   ├── setup.md         ← thin router → orchestrator-init
    │   ├── fix.md           ← direct executor
    │   ├── evolve.md        ← thin router → evolution/* by cycle
    │   ├── debate.md        ← thin router → intelligence/debate.md
    │   ├── persist.md       ← direct executor
    │   ├── level-up.md      ← detects level, loads ONE level-builder
    │   ├── ship.md          ← direct executor (git)
    │   ├── status.md        ← direct executor (health check)
    │   ├── explain.md       ← direct executor
    │   └── loop.md          ← recurring task runner
    │
    └── .claude/agents/
        └── orchestrator-init.md  ← fires ONCE at /setup, then exits
```

### The Three Architectural Rules

**1. CLAUDE.md is a dispatch table.**
It contains core rules (3-5 lines), session state (pointer to goals.md), and a routing table that points to capability files. It does not contain instructions. Instructions live in capability files, loaded on demand.

**2. The orchestrator is not an agent.**
There is no permanent orchestrator sitting in memory consuming tokens every session. Routing logic lives in CLAUDE.md. The `orchestrator-init` agent fires once during `/setup` to analyze the project and configure the environment — then it exits. After that, CLAUDE.md routes everything.

**3. Every capability is a micro-file.**
Each capability file answers exactly one question. ≤150 lines. YAML frontmatter (the metadata layer). Self-contained for its scope. When you add a new capability: create one file, add one row to `manifest.md`. Nothing else changes.

---

## The Manifest

`manifest.md` is the capability index — the equivalent of Claude Code's Tool Search Tool. The model reads it once (~100 tokens) to know what's available, then loads only the file that matches the current task.

```markdown
| File | When to load | Tokens |
|------|-------------|--------|
| shared/tdd.md | Any code task | ~50 |
| evolution/detect.md | /evolve — scanning gaps | ~250 |
| intelligence/debate.md | Hard architectural decision | ~400 |
...
```

No traversal. No index scan. O(1) dispatch by description match.

---

## Commands

### `/dream` — Build From an Idea
Describe your project idea and tech stack. Runs `orchestrator-init` to analyze the idea, scan the current environment level, and build everything progressively — CLAUDE.md, memory, skills, agents — level by level. If idea or stack is missing, asks one focused question before proceeding.

### `/setup` — Project Environment Setup
Analyzes the project once. Detects domain (developer/writer/researcher/compliance), stack, and scale. Fills `CLAUDE.md`, creates `goals.md`, installs the capability index. Runs `orchestrator-init` as a focused subagent — passes only what it needs, not a 1752-line monolith.

### `/fix` — 4-Phase Debugging
REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Never guesses. Never says "should work." Shows actual test output or stays in progress.

### `/evolve` — Environment Evolution
Thin router that composes only the cycles needed:
- **Cycle 1**: detect gaps + generate improvements + evaluate quality (three micro-files, loaded in sequence)
- **Cycle 2**: knowledge consolidation (only if sessions ≥ 3 since last run)
- **Cycle 3**: topology optimization (only if `/level-up` or high topology friction)

Each cycle loads only its own micro-file. A detect-only run costs ~250 tokens, not the full evolution budget.

### `/debate` — Adversarial Decision Protocol
Opt-in only. MAXIMALIST vs SKEPTIC advocates. Fact-check with VERIFIED/UNVERIFIED/FALSE tags. Second-order cognition check. Order-independence test (run synthesis twice if margin < 10 points). Evidence-density scoring, not word count. Use for hard architectural decisions — not for decisions Claude can answer directly.

### `/level-up` — Scan and Build Next Level
Detects current environment level (0-7) with a visual checklist, then loads only the matching `level-builders/{N}.md` capability file to build the next level. One level at a time — never loads all level builders at once.

### `/ship` — Save and Push to GitHub
Stages changed files (skips `.env` and secrets), generates a meaningful commit message, commits, and pushes. If no remote exists, gives exact instructions to connect to GitHub.

### `/status` — Project Overview
Quick visual health check: app starts or fails, recent git changes, current environment level, 2-3 specific next steps from `goals.md`.

### `/explain` — Plain Language Explanation
Explain code, errors, or concepts without jargon. Pass `$ARGUMENTS` — code, error message, file name, or concept question. 2-3 paragraphs max.

### `/loop` — Recurring Task
Run a command or prompt on an interval (e.g. `/loop 5m /status`). Defaults to 10 minutes. Explains how to set up a real cron job for automated recurring tasks.

### `/persist` — Session End
Updates `goals.md`, writes friction log to `ops/observations/`, appends session summary. Shows both files as proof — never says "saved" without showing the content.

---

## Built-In Research Insights

Every research insight is inlined at the exact step where it fires — not in an aggregator file, not in a monolith. Each insight lives in the capability file that uses it:

| Insight | Source | Where it fires |
|---------|--------|---------------|
| Context Rot Classification (Poisoning/Distraction/Confusion/Clash) | CE Pyramid | `evolution/detect.md` — before any patch |
| Five Quality Criteria (Relevance/Sufficiency/Isolation/Economy/Provenance) | CE Pyramid | `evolution/evaluate.md` — quality gate |
| Contract-First (Input/Output/Failures schema) | DUCTILE | `evolution/generate.md` — before generating |
| Pass-k Thresholds (k=3 dev gate, k=10 deploy gate) | DUCTILE | `evolution/evaluate.md` — before promoting |
| Self-Applicability Check | QChunker | `evolution/generate.md` — after generating |
| MAXIMALIST/SKEPTIC personas + N≤10/T≤5 bounds | AceMAD | `intelligence/debate.md` |
| Second-Order Cognition check | AceMAD | `intelligence/debate.md` — synthesis step |
| Order-Independence (run synthesis twice if margin < 10) | PeerRank | `intelligence/debate.md` |
| Evidence-density scoring, not word count | Elo-Evolve | `intelligence/debate.md` |
| Comparative Binary Framing (pairwise not absolute) | Elo-Evolve | `intelligence/elo.md` + `intelligence/debate.md` |
| Authoritative ELO ownership by loop controller | PeerRank + Elo-Evolve | `intelligence/elo.md` |
| OPRO history signal (top 5 / bottom 2) | OPRO | `intelligence/opro.md` |
| APE: 3 variants (few-shot / chain-of-thought / domain context) | APE | `intelligence/opro.md` |
| Trade-Off Hierarchies scaffold | CE Pyramid | `CLAUDE.md` template |
| key_questions column (grep-based retrieval) | QChunker | `orchestrator-init.md` — knowledge index |

---

## Memory Architecture

AZCLAUDE uses Claude Code's 6-layer memory model:

| Layer | What | Loaded |
|-------|------|--------|
| 1 | `CLAUDE.md` | Always (auto) |
| 2 | `.claude/memory/` files | On demand, 3-layer retrieval |
| 3 | `.claude/capabilities/` | On demand, manifest-driven |
| 4 | Skill metadata (frontmatter) | Always (lightweight, ~100 tokens each) |
| 5 | Skill bodies | On demand, when skill activates |
| 6 | `goals.md` via hook | Auto-injected if stale (> 30 min) |

The hook injects `goals.md` automatically — Claude never needs to remember to read it.

**3-layer memory retrieval** (search → filter → read):
1. grep keywords, list files — no content read yet
2. filter by recency (last 5 sessions) and relevance (keyword match)
3. read only files that passed the filter

Total: ~100 tokens for the search layer. You only pay for files you actually need.

---

## Hooks

Global hooks — installed once, cover every project:

**UserPromptSubmit**: auto-creates memory directories, injects `goals.md` if it hasn't been read in 30 minutes.

**Stop**: creates a friction stub in `ops/observations/` if the session ends without `/persist`. Warns visibly.

Install with:
```bash
npx azclaude
```

Run once. Works in every project from that point forward.

---

## How to Add New Capabilities

This is the O(1) pattern. Adding a new capability never touches existing files:

1. Create the file:
```markdown
# .claude/capabilities/{category}/{name}.md

---
name: {capability-name}
description: >
  What this does. When it fires. Trigger words for dispatch.
tokens: ~{estimate}
---

[body — ≤ 150 lines]
```

2. Add one row to `manifest.md`:
```
| {category}/{name}.md | {trigger description} | ~{tokens} |
```

Done. The dispatch in `CLAUDE.md` already says "read manifest.md for unknown capabilities." Nothing else changes.

---

## Installation

```bash
# Install globally
npm install -g azclaude

# Or run directly in your project
npx azclaude
```

Then in Claude Code:
```
/setup
```

---

## Comparison

| | Traditional monolith | AZCLAUDE |
|---|---|---|
| Always-loaded context | Full orchestrator (1752+ lines) | CLAUDE.md (~30 lines) |
| Capability discovery | Embedded in monolith | manifest.md (~40 lines) |
| Add new capability | Edit large file | 1 new file + 1 manifest row |
| Bug fix token cost | ~21,000 tokens | ~380 tokens |
| Subagent context | Full module file | Micro-section only |
| Orchestrator | Persistent agent every session | Fires once at setup, exits |
| Debate | Default for decisions | Opt-in for hard decisions only |
| Architecture source | Inspired by Claude Code | Structurally aligned with Claude Code |

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
