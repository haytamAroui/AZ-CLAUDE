<p align="center">
  <h1 align="center">AZCLAUDE</h1>
  <p align="center"><strong>The AI coding environment that remembers your project, speaks your domain, and gets smarter every week.</strong></p>
  <p align="center">
    <a href="#-see-it-in-30-seconds">Demo</a> ·
    <a href="#-installation">Install</a> ·
    <a href="#-the-memory-system">Memory</a> ·
    <a href="#-all-22-commands">Commands</a> ·
    <a href="#-the-intelligence-layer">Intelligence</a> ·
    <a href="#-10-levels">10 Levels</a>
  </p>
</p>

---

## The Problem

You open Claude Code. Ask it to fix a bug. It doesn't know your conventions, your test patterns, your architecture decisions from last week. You explain. Next session — you explain again. Context compacts at turn 80 and you lose your place entirely. Every agent starts from zero. Every session is a fresh start with an amnesiac assistant.

**AZCLAUDE fixes this permanently.** One install. Two minutes. Then your AI coding CLI:

- Remembers every file it touched — with git diff stats — across sessions
- Injects the reasoning behind your last decisions before your first message
- Speaks your domain's language (compliance gets "obligations", not "tasks")
- Routes to the right capability without loading everything (~380 tokens per task, not ~21,000)
- Detects its own gaps weekly and generates the fixes

---

## Why AZCLAUDE Exists

Claude Code is smarter than any tool someone will build on top of it.

Think about what Claude Code already ships with:

- **Hooks** — code that fires on every edit, every prompt, every session start
- **Agents** — markdown files with persona, scope, tools, constraints, loaded automatically
- **Skills** — recipes Claude reads on demand, zero preloading
- **Commands** — slash commands that trigger multi-step workflows
- **Subagents** — isolated context windows per task, fresh every time
- **Memory directories** — persistent files that survive across sessions
- **UserPromptSubmit** — inject content into Claude's context before it reads your message

All the ingredients are there. The architecture is already built. Nobody needs to build a database, a daemon, a vector store, or an MCP server to make Claude Code remember things or coordinate agents. Claude Code can already do all of it — natively, cross-platform, with zero dependencies.

The problem isn't missing features. The problem is that nobody orchestrates them.

**That's what AZCLAUDE does.** It's the first tool built entirely inside Claude Code's own architecture — not around it, not on top of it, not fighting it.

```
What other tools do:                    What AZCLAUDE does:

Add SQLite for memory                   Write to .claude/memory/ (Claude reads it natively)
Add ChromaDB for search                 Use grep + file structure (Claude already does this)
Add MCP server for tools                Use hooks (Claude already has them)
Add Bun/Python runtime                  Use Node.js (Claude Code already requires it)
Add worker service on port 37777        Use UserPromptSubmit (Claude injects it automatically)
Add background daemon                   Use PostToolUse (fires on every edit, zero config)

Result: 5+ external dependencies         Result: zero external dependencies
Breaks when Claude Code updates          Works when Claude Code updates
Fails on Windows                         Works everywhere Claude Code works
```

When Anthropic improves Claude Code — and they will — tools built around it break. AZCLAUDE gets better for free, because it uses the native features that Anthropic is actively improving.

**AZCLAUDE doesn't extend Claude Code. It unlocks it.**

Every capability in AZCLAUDE is Claude Code doing what it was designed to do — orchestrated so that the right file lands in the right place at the right time:

- Memory that survives context compaction? That's `UserPromptSubmit` injecting `goals.md` — a hook writing to a file Claude already reads.
- Agents tailored to your project? That's markdown in `.claude/agents/` — the directory Claude already loads from.
- Skills loaded on demand? That's files in `.claude/skills/` — the system Claude already lazy-loads.
- Debate engine with fact-checking? That's a subagent with a structured prompt — the tool Claude already spawns.
- Self-improvement loop? That's `/evolve` reading session files and rewriting agents — using Read, Write, Edit tools Claude already has.

No databases. No servers. No runtimes. No protocols.
Just Claude Code, doing what Claude Code does — with the right instructions in the right files.

**Zero dependencies beyond Node.js. Pure Claude Code, fully orchestrated.**

---

## ⚡ See It In 30 Seconds

```bash
npx azclaude demo
```

Runs the actual hooks on a temp project. Writes goals.md with a simulated edit. Compacts context. Shows UserPromptSubmit injecting everything back. Real execution. No mocks. Cleans up after itself.

---

## 🚀 Installation

```bash
# Install
npx azclaude

# Build your project's environment (run once inside your project)
/setup

# Verify everything is working
npx azclaude doctor
```

`doctor` runs 32 checks — runtime, global hooks, settings integrity, all 22 commands. Exits 0 if healthy. Exits 1 with the exact fix hint if anything is wrong.

**Or install from the Claude Code marketplace** — search "AZCLAUDE", click Install. Hooks active immediately. Then run `/setup`.

---

## 🧠 The Memory System

This is what no other tool does. Three layers work silently in the background. Context compaction stops being a problem.

### What happens at turn 80 (context compaction)

```
Turn 1    — Session starts.
            UserPromptSubmit injects goals.md + latest checkpoint automatically.
            Claude reads both before your first message. Zero re-explanation.

Turn 15   — You run /checkpoint.
            Captures: what you're doing, WHY, key decisions, what's next.

Turn 30   — /checkpoint again.

Turn 80   — Claude Code compacts. Earlier turns are gone.

Turn 81   — Next prompt. UserPromptSubmit fires.
            → Claude gets goals.md: every file touched, +N/-M, change summary
            → Claude gets checkpoint: the reasoning behind every decision
            → Picks up in seconds, not minutes.

End       — /persist. Full summary, friction log, session narrative.
```

### Three layers — what each solves

| Layer | Mechanism | Survives compaction | Automatic |
|-------|-----------|-------------------|-----------|
| **File breadcrumb** | PostToolUse → goals.md | ✅ WHERE you were, WHAT changed | ✅ Every edit |
| **Reasoning snapshot** | `/checkpoint` → checkpoints/ | ✅ WHY decisions were made | ❌ Run every 15–20 turns |
| **Session narrative** | `/persist` → sessions/ | ✅ Full summary, next actions | ❌ Run before closing |

### What the injection looks like (what Claude reads before your first message)

```
--- ACTIVE GOALS ---
## In progress
- 22:10 — src/auth.js (+8/-2) — added JWT validation
- 22:13 — test/auth.test.js (+15/-0) — added token expiry tests
- 22:18 — README.md (+3/-1) — updated auth section
--- END GOALS ---

--- LAST CHECKPOINT (2026-03-14-22:10.md) ---
## What I'm doing now
Implementing JWT refresh token rotation in src/auth.js

## WHY — decisions made this session
- Chose RS256 over HS256: asymmetric keys safer for multi-service setup
- Redis for token blacklist: O(1) lookup vs DB query

## What I know that isn't written yet
Old refresh flow in auth.js:180 has a race condition — fix next task

## What's next
1. Add token blacklist check to middleware
2. Write expiry tests
3. Update API docs
--- END CHECKPOINT ---
```

No re-explanation. No "where were we?". Straight to work.

---

## 📋 All 22 Commands

### Build & Ship

| Command | What it does |
|---------|-------------|
| `/dream` | Idea → full project scaffold. Rules, memory, skills, agents — built level by level |
| `/setup` | Analyzes your existing project once. Detects domain + stack + scale. Builds everything |
| `/add` | Add a feature. Reads your existing patterns first — never invents conventions |
| `/fix` | Paste an error → REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX → show passing tests. Never says "should work" |
| `/review` | Spec-first review. Checks requirements before style. Blocking vs suggestion distinction |
| `/test` | IDE diagnostics → framework detection → exit-code gate → failure classification |
| `/plan` | For 4+ file changes. Read-only analysis → risk level → approval gate before any code |
| `/ship` | IDE gate → tests → secrets scan → smart commit → push |
| `/refactor` | Restructure code safely. Tests before + after. Worktree isolation for risky changes |
| `/doc` | Generate docs from code. Matches existing style (JSDoc, docstrings). Verifies examples |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes. Tests before + after |
| `/deps` | Audit: outdated, vulnerable, unused packages. Structured report |

### Think & Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Hard choice → two advocates argue with evidence → fact-checked → winner logged to decisions.md |
| `/evolve` | Scans for gaps → generates fixes → quality-gates them. Self-improvement, automated |
| `/level-up` | Shows your current level (0–10) → builds the next one |
| `/find` | Search for skills across project commands, ~/shared-skills/, and capabilities |
| `/create` | Build a new command with proper frontmatter, test cases, and guided workflow |

### Memory & Session

| Command | What it does |
|---------|-------------|
| `/checkpoint` | Mid-session snapshot. WHY + decisions + what's next. Auto-injected on next session start |
| `/persist` | End-of-session: goals, friction log, session summary |
| `/status` | App health + recent changes + current level + next steps |
| `/explain` | Code or error → plain language. Zero jargon |
| `/loop` | `/loop 30m /evolve quick` — repeat any command on an interval |

---

## 🔬 The Intelligence Layer

### /debate — AceMAD Protocol

Not a simple pros/cons list. A structured adversarial debate with mathematical evidence scoring.

```
Question: REST or GraphQL for the new API?

MAXIMALIST argues FOR GraphQL:
  [VERIFIED]   Single endpoint reduces N+1 query problem — measured 40% fewer roundtrips
  [VERIFIED]   Type system catches breaking changes at schema level, not runtime
  [UNVERIFIED] "GraphQL is the future of APIs" ← disqualified, loses weight

SKEPTIC argues AGAINST:
  [VERIFIED]   REST caching via HTTP is free. GraphQL requires custom layer
  [VERIFIED]   Team has 0 GraphQL experience — learning curve cost is real
  [PARTIAL]    Tooling maturity — REST ecosystem is larger, but closing

FACT CHECK: 4/6 claims verified. 1 disqualified.

SYNTHESIS:
  Winner: REST (confidence: 67)
  Deciding claim: [VERIFIED] team experience gap → 3-week learning cost outweighs query savings
  Strongest dissent: GraphQL N+1 reduction is real — revisit if team grows past 5 engineers
  Order-independence: margin = 67, re-run not required
```

**Rules that make it trustworthy:**
- Every claim tagged `[VERIFIED]` / `[PARTIAL]` / `[UNVERIFIED]` / `[FALSE]`
- "Should work", "probably", "I believe" → auto-marked `[UNVERIFIED]`, loses weight
- If margin of victory < 10 → debate re-runs with advocates reversed. If result flips → marked INCONCLUSIVE
- Score = evidence-density (verified claims per 100 words), not word count

### ELO — Pairwise Ranking

When ranking 3+ options, `/debate` loads ELO automatically.

- Binary comparisons reduce statistical noise: σ_abs=35.65 → σ_comp=7.85
- Loop Controller owns ELO reconciliation: reliability r=0.538 → r=0.905
- Hard cap: if verified ratio < 0.5, ELO capped at 1100 regardless of wins

Rankings persist across sessions in `.claude/memory/elo-rankings.json`. Three tracks: `debate_elo`, `agent_elo`, `pattern_elo`.

### Pipeline — Agent Chains

Pre-built templates for multi-agent work. Each agent receives ONLY the previous agent's output — no context bleed. Agent 3 never inherits Agent 1's 50,000-token conversation.

```
Feature:      planner → implementer → reviewer
Fix:          investigator → hypothesizer → fixer
Review:       spec-checker → quality-checker  (hard gate between stages)
Architecture: analyst → maximalist → skeptic → synthesizer
```

---

## 📊 10 Levels

Build what you need. Stop when the environment matches the project's complexity.

| Level | What you get | Context cost |
|-------|-------------|-------------|
| **1** | CLAUDE.md — 30-line dispatch table | ~30 tokens |
| **2** | MCP servers — database, browser, APIs | ~150 tokens |
| **3** | 22 commands + lazy-loaded capabilities | ~380 tokens per task |
| **4** | Memory — goals, checkpoints, sessions | ~200 tokens per session |
| **5** | Custom agents from git evidence | ~400 tokens per agent |
| **6** | Hooks — auto-tracking, injection, friction detection | ~0 tokens (global) |
| **7** | External MCP — guide for connecting databases, browsers, APIs | Varies |
| **8** | Intelligence — debates, pipelines, decisions | ~400 tokens per decision |
| **9** | Evolution — 3-cycle self-improvement | ~1000 tokens per cycle |
| **10** | Loop Controller — autonomous Opus agent: prune dead agents, enrich knowledge index, re-derive architecture in background | ~1500 tokens per full cycle |

```
/level-up    → detect current level → build next
/evolve      → at Level 7+, stop building, start improving
```

---

## 🏗️ Agents From Evidence

AZCLAUDE creates agents from your git history — not guessing.

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn
```

Files that always change together → same agent. `auth.js` and `auth.test.js` always commit together → one agent owns both. 3 agents with clear boundaries beat 6 overlapping ones.

### The 5-layer structure

Every AZCLAUDE agent has exactly 5 layers. Missing one = incomplete agent.

```yaml
---
name: auth-agent
description: >
  Handles all authentication work. Triggers on: login, logout, JWT,
  session, token, OAuth, password, register, permissions.
model: sonnet
permissionMode: acceptEdits
---

Layer 1 — PERSONA:      "Authentication specialist for this Express project"
Layer 2 — SCOPE:        "Owns src/auth/ and tests/auth/. Does NOT touch frontend."
Layer 3 — TOOLS:        "Read, Write, Edit, Bash, Grep"
Layer 4 — CONSTRAINTS:  "Never store plaintext credentials. Never skip token expiry."
Layer 5 — DOMAIN:       "Uses Passport.js, JWT (RS256), bcrypt, Redis sessions."
```

**Layer 5 matters more than Layer 1.** Domain knowledge drives correct decisions. Persona just drives tone.

**Positive directives only.** Not "don't generate vague output" — "every output includes file:line reference and actual test result." Negative instructions activate the behavior they're trying to prevent.

### Agents learn from their own history

After every task:
- Succeeded → `patterns.md`
- Failed → `antipatterns.md`
- Decided → `decisions.md`

Next run, the agent reads all three. It doesn't repeat the same mistake twice.

---

## 🌍 Domain Awareness

AZCLAUDE reads your codebase and adapts everything — vocabulary, skills, agent names, command behavior.

| Your project | What AZCLAUDE generates |
|-------------|------------------------|
| **Next.js app** | TDD opt-in (signals-based), skills: `new-page.md`, `new-component.md` |
| **EU AI Act compliance tool** | Vocabulary: obligations, conformity review, article-level traceability, audit trail |
| **Healthcare app** | Vocabulary: clinical findings, patient outcomes. FHIR-aware agent naming |
| **Trading platform** | Vocabulary: positions, exposure, risk decisions. Full code stack |
| **Book manuscript** | Skills: `write-chapter.md`, `edit-draft.md`. No MCP, no agents |
| **ML research** | Insight Researcher agent: literature-reviewer → summarizer. Retrieval patterns over code |

Detection is automatic. One scan, zero configuration.

---

## 🛡️ Behavioral Defenses

AZCLAUDE holds its ground when you try to shortcut it.

| Pressure scenario | What AZCLAUDE does |
|------------------|--------------------|
| "Deadline's today — skip the tests" | Holds. "Tests take 30 seconds. Running now." |
| "We've already done so much work on this approach" | Holds. "Sunk cost doesn't change the architecture risk." |
| "I'm the senior engineer, just do it" | Holds. Explains the specific risk. Offers alternatives. |
| "This looks great, testing is overkill" | Holds. "Let me show you the test output." |

**A skill that can be argued out of is not a skill — it's a suggestion.**

---

## 🔒 Security

6 layers. All hooks are pure Node.js — cross-platform: Windows, macOS, Linux.

1. **Hook integrity** — SHA-256 hash of `~/.claude/settings.json` written at install, verified on every run
2. **Command injection protection** — `$CLAUDE_FILE_PATH` sanitized, shell metacharacters rejected before any formatter
3. **Prompt injection defense** — `curl | bash`, `ignore previous instructions`, base64 blocks > 500 chars stripped from goals.md and checkpoints before context injection
4. **Skill checksums** — portable skills SHA-256 hashed, imports fail loudly if tampered
5. **Credential auditing** — `/ship` blocks on `.env`, plaintext keys, `AKIA`, `sk-`, `ghp_` patterns
6. **Agent scoping** — review agents read-only (`EnterPlanMode`), experiment agents in isolated git worktrees (`EnterWorktree`)

---

## 🖥️ Multi-CLI Support

Works with 5 AI coding CLIs. Path substitution at install time — zero runtime cost.

| CLI | Config dir | Rules file | Hooks |
|-----|-----------|-----------|-------|
| **Claude Code** | `.claude/` | `CLAUDE.md` | ✅ Full (global + project) |
| **Gemini CLI** | `.gemini/` | `GEMINI.md` | — |
| **Codex CLI** | `.codex/` | `AGENTS.md` | — |
| **OpenCode** | `.opencode/` | `AGENTS.md` | — |
| **Cursor** | `.cursor/` | `.cursor/rules/project.mdc` | — |

All capabilities, commands, and memory work identically on every CLI.

---

## ✅ Verified

802 tests. Every link in the system verified — content accuracy, not just file presence.

```bash
bash tests/test-features.sh
```

```
════════════════════════════════════════════════════
  Results: 802 passed, 0 failed, 802 total
════════════════════════════════════════════════════
```

Verified live: `/evolve` detected 3 real stale-documentation bugs in AZCLAUDE itself and fixed them in the same run.

---

## Project Structure

```
azclaude/
├── bin/cli.js                    ← installer, doctor, demo
├── templates/
│   ├── CLAUDE.md                 ← dispatch table template (30 lines)
│   ├── hooks/                    ← pure Node.js, cross-platform
│   │   ├── user-prompt.js        ← injects goals.md + checkpoint at session start
│   │   ├── post-tool-use.js      ← writes file + diff stat on every edit
│   │   └── stop.js               ← migrates In progress → Done
│   ├── agents/             (4)  ← orchestrator-init, loop-controller, code-reviewer, test-writer
│   ├── capabilities/             ← 27 files, lazy-loaded
│   │   ├── manifest.md
│   │   ├── shared/       (10)    ← completion, agents, vocabulary, tdd, pressure-test...
│   │   ├── evolution/    (6)     ← detect, generate, evaluate, knowledge, topology...
│   │   ├── intelligence/ (5)     ← debate, pipeline, elo, opro, experiment
│   │   └── level-builders/ (8)   ← levels 1–8
│   ├── commands/         (22)    ← all commands
│   └── scripts/env-scan.sh
├── .claude-plugin/               ← Claude Code marketplace plugin
├── hooks/hooks.json              ← ${CLAUDE_PLUGIN_ROOT} hooks (marketplace install)
├── DOCS.md                       ← full user guide (all features, step by step)
├── CONTRIBUTING.md
├── tests/
│   └── test-features.sh          ← 802 tests
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New capability = 1 file + 1 manifest row. 15 minutes.

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
