---
name: parallel
description: >
  Dispatch multiple milestones simultaneously using git worktree isolation.
  Each agent runs on its own branch, changes are merged sequentially after all complete.
  Use when: "run these milestones in parallel", "build M1 M2 M3 simultaneously",
  "parallel execution", "spawn multiple agents", "run agents in parallel",
  "dispatch in parallel", "work on multiple milestones at once", "parallel build",
  "run simultaneously", "multiple agents at once".
  Do NOT trigger for: a single milestone, sequential work, or when milestones share files.
argument-hint: "[M1 M2 M3 — milestone IDs from plan.md]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep, Task
---

# /parallel — Parallel Milestone Execution

$ARGUMENTS

Load: `capabilities/shared/parallel-coordination.md`

---

## Step 0: Check for Interrupted Wave

```bash
cat .claude/parallel-wave-state.md 2>/dev/null
```

If the file exists with `status: in-flight` → a previous parallel session was interrupted.
Follow the **Resume Protocol** from `parallel-coordination.md` before starting a new wave.
Only proceed to Step 1 after the interrupted wave is fully resolved (merged or re-dispatched).

---

## Step 1: Parse Targets

```bash
# Read plan.md to find the specified milestones
cat .claude/plan.md 2>/dev/null | head -200
```

From $ARGUMENTS, extract milestone IDs (e.g., "M1 M2 M3" or "1 2 3").
If no arguments → show current pending milestones and ask which to parallelize.

---

## Step 2: Safety Check

For each pair of target milestones, verify they are safe to parallelize:

```bash
# Check Files: fields in plan.md for each milestone
grep -A5 "^## M{N}" .claude/plan.md | grep "^Files:"
```

**Reject and abort if any two milestones:**
- Share a file in their `Files:` field
- Both touch `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, or any schema file
- Have a `Depends:` relationship between them (one depends on the other)
- Either has status `blocked` or `done`

If safety check fails: show which pairs conflict and suggest sequential order instead.

---

## Step 3: Consult Problem Architect

For each milestone, spawn problem-architect to get Team Spec + `Parallel Safe` verdict:

```
Task: Analyze milestone for parallel dispatch
Milestone: {description from plan.md}
Current state: {what exists}
Available agents: {list .claude/agents/}
Return Team Spec with Parallel Safe field.
```

If any milestone returns `Parallel Safe: NO` → exclude from parallel wave, run sequentially after.

---

## Step 4: Write Ownership Map + Wave State

**4a. Ownership map** — create or update `.claude/ownership.md`:

```
## Active Parallel Session — {ISO timestamp}
Milestones: {M1, M2, ...}
Initiated by: /parallel command

| Agent Slot | Milestone | Branch | Directories Owned | Status |
|------------|-----------|--------|-------------------|--------|
| P1 | M{N} — {title} | parallel/m{n}-{slug} | {dirs from spec} | pending |
| P2 | M{N} — {title} | parallel/m{n}-{slug} | {dirs from spec} | pending |
```

**4b. Wave state file** — write `.claude/parallel-wave-state.md` BEFORE dispatching agents:

```markdown
---
wave: {N}
started: {ISO timestamp}
status: in-flight
milestones: [{list}]
---

| Milestone | Branch | Status | Commit | Notes |
|-----------|--------|--------|--------|-------|
| M{N} — {title} | parallel/m{n}-{slug} | running | — | P1 slot |
| M{N} — {title} | parallel/m{n}-{slug} | running | — | P2 slot |
```

This file survives context compaction. If the session dies mid-wave, the next session reads this file to resume.

---

## Step 5: Dispatch All Agents Simultaneously

Spawn all milestone-builder agents **in a single message** (true parallel — one Task call per agent in the same response):

For each milestone, Task with `isolation: "worktree"`:

```
Task: Implement Milestone {N} — {title}

[PARALLEL MODE — WORKTREE ISOLATED]
Branch: parallel/{milestone-slug}

Agent role: {from Team Spec}
Directories owned: {from Team Spec}

{standard context from orchestrator Step 4}

Worktree rules (MANDATORY):
- Only write files within your "Directories owned"
- DO NOT run git push — commit locally only
- If you see errors in files outside your directories: STOP, report "scope violation"
- End your report with: "Branch: parallel/{slug}"
```

---

## Step 6: Wait and Monitor

After all agents complete:
- Collect all completion reports
- Mark each as COMPLETE or FAILED in ownership.md
- **Update `.claude/parallel-wave-state.md`** — set each milestone's Status to `done`/`failed`, fill Commit hash

---

## Step 7: Merge Sequentially

Follow the Merge Protocol from `capabilities/shared/parallel-coordination.md`:

```bash
git checkout main

# Merge branches one at a time (simplest first)
git merge parallel/{slug-1} --no-ff -m "merge: M{N} {title} [parallel wave]"
# Run tests after each merge
{test command} 2>&1 | tail -10

git merge parallel/{slug-2} --no-ff -m "merge: M{N} {title} [parallel wave]"
{test command} 2>&1 | tail -10

# Push once all merges pass
git push origin main

# Cleanup
git branch -d parallel/{slug-1} parallel/{slug-2}
```

**If merge conflict**: read both versions, apply correct merge (keep both feature additions), continue.
**If tests fail after a merge**: identify which merge broke it → revert that branch → add milestone to blocked.

---

## Step 8: Update Plan + Report

Update `.claude/plan.md` — set merged milestones to `status: done`.
Update `.claude/ownership.md` — replace active table with merge record.
**Delete `.claude/parallel-wave-state.md`** — wave is complete, prevent false resume on next session.

Show final report:
```
/parallel — Wave Complete
═══════════════════════════════════════
Milestones dispatched: {N}
  ✓ M{N} — {title} (merged, tests pass)
  ✓ M{N} — {title} (merged, tests pass)
  ✗ M{N} — {title} (merge conflict → added to blocked)

Tests: PASS — {N} passing after merge
Time saved vs sequential: ~{N} build cycles
```

---

## Completion Rule

Do not say "parallel complete" without showing:
1. Each agent's completion status
2. Merge result for each branch (pass/conflict)
3. Final test output after all merges
4. Updated plan.md milestone statuses
