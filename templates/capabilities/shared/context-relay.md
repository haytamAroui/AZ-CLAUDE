# Context Relay — Eliminate Redundant Reads Across Agent Boundaries

Every agent spawn is a context boundary. Without relay, each agent re-reads the same files
its parent already has in context. This wastes 5-15 tool calls per spawn and 20-50k tokens
per pipeline run.

## The Rule

**When spawning a subagent via Agent() or Task(), include a `## Pre-loaded Context` block
in the prompt with the relevant files you already read. The subagent MUST NOT re-read
files listed in this block.**

## What to Relay

Pass context **filtered by the subagent's role**. Not everything — just what this agent needs.

### Role-based relay filters

| Subagent | Relay these | Skip these |
|----------|------------|------------|
| problem-architect | CLAUDE.md identity + rules, goals.md current threads, file list from recent reads | Full checkpoint, session history |
| milestone-builder | Team Spec (from problem-architect), file contents listed in `Files:`, patterns relevant to this milestone | Other milestones' files, decisions.md |
| code-reviewer | The diff (what changed), relevant test patterns, CLAUDE.md rules section | Goals, checkpoints, deployment config |
| test-writer | Source file under test, existing test file patterns (first 20 lines), test framework config | Goals, security rules, deployment |
| security-auditor | Files being reviewed, security patterns from CLAUDE.md | Test patterns, frontend config |
| orchestrator | plan.md, goals.md, constitution.md non-negotiables | Individual file contents (too large) |

### Size limits

- Maximum relay block: **4000 tokens** (~3000 words)
- If the content exceeds this, summarize: include file paths + key findings, not raw content
- File contents: include only the **relevant section**, not the full file
- For large files (>200 lines): include line range references (`file.ts:45-120`) instead of content

## Protocol

### For commands (/add, /fix, /refactor)

When the command reads files to understand context, and then spawns a subagent:

```
Spawn Agent(subagent_type="problem-architect") with this prompt:
  "Task: {description}

  ## Pre-loaded Context
  The following files were already read. Do NOT re-read them.

  ### CLAUDE.md (rules section)
  {paste rules section only — not the full file}

  ### Current goals
  {paste goals.md current threads — not done history}

  ### Relevant source files
  {paste key file sections already in your context}
  "
```

### For orchestrator → milestone-builder

The orchestrator already reads plan.md and gets Team Specs from problem-architect.
When dispatching a milestone-builder:

```
Task: Implement milestone M3 — {title}

## Pre-loaded Context (do NOT re-read these)

### Team Spec (from problem-architect)
{paste the full Team Spec for this milestone}

### File contents (pre-read by orchestrator)
{paste contents of files listed in Team Spec's "Files to pre-read"}

### Project patterns
{paste relevant patterns from CLAUDE.md or patterns.md}

## Instructions
Implement the milestone. You have all the context you need above.
Only read files NOT listed in Pre-loaded Context.
```

### For problem-architect → return relay data

When problem-architect returns a Team Spec, it SHOULD include a `## Relay` section
with condensed file contents it read during analysis:

```
## Relay (for milestone-builder — do not re-read)
### src/auth/jwt.ts (lines 1-45)
{content}
### src/types/user.ts (full file, 30 lines)
{content}
```

The orchestrator passes this relay block directly into the milestone-builder's prompt.

## What NOT to relay

- **Mutable state** — goals.md "In progress" section changes between agent spawns
- **Large binary/config files** — package-lock.json, node_modules paths
- **Full git history** — pass only the relevant commit message or diff
- **Other agents' results** — unless explicitly needed (e.g., code-reviewer's findings for a fix)

## Anti-patterns

1. **Relay everything** — bloats the subagent prompt, wastes tokens on irrelevant context
2. **Relay nothing** — status quo, each agent re-reads 5-15 files
3. **Relay stale data** — if a file was modified between parent read and agent spawn, the relay is wrong. Only relay files that won't change during this pipeline run.
4. **Skip the filter** — sending a code-reviewer the full decisions.md when it only needs the diff

## Measuring impact

Before context-relay:
- problem-architect: ~8 Read calls to understand the project
- milestone-builder: ~6 Read calls to re-read what problem-architect already read
- code-reviewer: ~4 Read calls for CLAUDE.md + patterns + the files under review
- Total per /add pipeline: ~18 Read calls, ~40k tokens on re-reads

After context-relay:
- problem-architect: ~8 Read calls (unchanged — it's the first reader)
- milestone-builder: ~1-2 Read calls (only files not in relay)
- code-reviewer: ~1 Read call (only the diff, everything else relayed)
- Total per /add pipeline: ~11 Read calls, ~15k tokens on re-reads
- **Savings: ~40% fewer reads, ~60% fewer re-read tokens**
