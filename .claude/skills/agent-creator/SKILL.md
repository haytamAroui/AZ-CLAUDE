---
name: agent-creator
description: >
  Creates and improves Claude Code agent definitions. Use when the user says
  "create an agent", "add an agent", "new agent", "build an agent", "write
  an agent", "make an agent", "I need an agent for", "agent for", "custom
  agent", "specialized agent", "add a reviewer", "add a builder". Also use
  when an existing agent is incomplete, making mistakes, missing context,
  producing inconsistent results, or needs its 5-layer structure fixed.
  Use when splitting work across multiple agents, defining agent boundaries,
  checking agent overlap, or pairing agents with skills. Even if the user
  doesn't say "agent", use this when they describe a workstream that needs
  isolation, parallelism, or specialized context.
tags: [agent, create, subagent, specialized, 5-layer]
---

# Agent Creator

<instructions>

Creates production-quality Claude Code agents following the 5-layer structure.
An agent is an OWNERSHIP BOUNDARY — not a persona. If two agents can do the
same task, one shouldn't exist.

## 5-Minute Checklist
Before diving into the full workflow, verify these 5 essentials:
1. Does this workstream genuinely need isolation or parallelism? (If not, a skill is enough)
2. Is the description pushy enough? (30+ trigger keywords, ends with "even if...")
3. Are all 5 layers filled? (Persona, Scope, Tools, Constraints, Domain — Domain is largest)
4. Does Scope have explicit DOES NOT TOUCH boundaries? (Without them, agents drift)
5. Are constraints positive directives that hold under pressure? ("Always X" not "Don't Y")

## When NOT to Create an Agent
- A skill with direct tool calls can do the same work — agents add coordination overhead
- The "agent" would just read one file and return its content — that's a tool call, not an agent
- You're using agents as a routing mechanism — routing belongs in CLAUDE.md, not agents
- Two existing agents already cover this territory — merge or tighten scope instead
- The project has < 20 files — CLAUDE.md alone is probably enough

## Workflow

0. **Web research (MANDATORY for domain-specific agents).** Before writing any agent content:
   - WebSearch for "{domain} best practices {current year}" — the agent's Layer 5 (Domain) must reflect current reality
   - WebSearch for "{technology} API changes" — catch breaking changes, deprecations, new patterns
   - WebFetch official docs for any technology the agent will work with
   - **Why:** Claude hallucinates outdated APIs. An agent with stale domain knowledge makes confident wrong decisions.

1. **Determine boundaries.** Run co-change analysis to find what changes together:
   ```bash
   bash .claude/skills/agent-creator/scripts/scaffold.sh --analyze
   ```

2. **Generate the agent file:**
   ```bash
   bash .claude/skills/agent-creator/scripts/scaffold.sh AGENT_NAME
   ```

3. **Write the description.** Follow the pushy formula — 30+ trigger keywords.
   End with: "even if not explicitly mentioned, route to this agent when..."

4. **Fill all 5 layers:**
   - Layer 1 PERSONA (5%) — one sentence role, not personality
   - Layer 2 SCOPE (25%) — what it OWNS + what it does NOT touch
   - Layer 3 TOOLS (10%) — restrictions matter more than grants
   - Layer 4 CONSTRAINTS (25%) — positive directives, 5-10 max
   - Layer 5 DOMAIN (35%) — project-specific knowledge, the real value

5. **Check framework collision:**
   ```bash
   grep -r "langgraph\|crewai\|autogen\|langchain.*agent" pyproject.toml package.json 2>/dev/null
   ```
   If found: prefix all agents with `cc-` (e.g., `cc-backend`).

6. **Pair with skills.** Add mandatory skill check to agent body:
   "Before writing any code, check if a skill matches this task."

7. **Validate.** Read `references/quality-checklist.md` and verify all items pass.

## Rules
- 3-5 agents for most projects (3 focused > 6 overlapping)
- Layer 5 (Domain) matters more than Layer 1 (Persona) — domain drives correctness
- Every agent has explicit DOES NOT TOUCH boundaries in scope
- Positive directives: "Always validate" not "Don't skip validation"
- Review agents: read-only (planMode), no Write/Edit tools
- Experiment agents: isolated in git worktree
- Testing is a responsibility, not a role — agent owns its test files
- `disable-model-invocation: true` ONLY for dangerous agents

## Agent Sizing Guide
| Project size | Recommended agents |
|---|---|
| < 20 files | 1-2 (or none — CLAUDE.md is enough) |
| 20-100 files | 2-3 |
| 100-500 files | 3-5 |
| 500+ files | 4-6 with SKIM mode |

## References
For the complete agent engineering guide: `references/agent-engineering-guide.md`
For the quality checklist: `references/quality-checklist.md`
For a sample agent output: `examples/sample-agent.md`

</instructions>
