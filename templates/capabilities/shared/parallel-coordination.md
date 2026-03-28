# Parallel Agent Coordination

This file is loaded by the orchestrator when dispatching milestone-builder agents in parallel.
It defines the worktree isolation protocol, ownership map format, and merge sequence.

---

## Why Worktrees Are Required for Parallel Dispatch

Without worktree isolation, two agents writing to the same repo simultaneously cause:
- **File corruption**: agent A's partial write is read by agent B mid-implementation
- **Test interference**: A's failing tests pollute B's test run, causing false failures
- **Commit races**: both agents commit, one overwrites the other's changes on push

Worktree isolation gives each parallel agent a private copy of the repo on its own branch.
The orchestrator merges completed branches sequentially once all agents report done.

---

## Ownership Map

The orchestrator maintains `.claude/ownership.md` during parallel sessions.
Format — one entry per active parallel agent:

```
## Active Parallel Session — {ISO timestamp}

| Agent Slot | Milestone | Branch | Directories Owned | Status |
|------------|-----------|--------|-------------------|--------|
| P1 | M3 — Auth endpoints | parallel/m3-auth | src/auth/, tests/auth/ | running |
| P2 | M4 — User profile | parallel/m4-profile | src/users/, tests/users/ | running |
| P3 | M5 — Email service | parallel/m5-email | src/email/, tests/email/ | done |
```

Rules:
- Two agents cannot share a directory in "Directories Owned"
- Orchestrator writes this table before dispatching; builders do NOT modify it
- `parallel/{milestone-slug}` is the branch naming convention
- Delete the table when the wave is merged (replace with "Wave N merged — {timestamp}")

---

## Dispatch Protocol (Orchestrator)

### Step 1: Confirm Parallel Safety

Before spawning any parallel agents for a wave, verify from problem-architect Team Specs:

```
For each pair (A, B) in the wave:
  - Files Written(A) ∩ Files Written(B) = empty set?    → safe
  - Parent directories of A and B do not overlap?        → safe
  - No shared schema/config files (prisma.schema, package.json, tsconfig)?  → safe
  - No runtime dependency (A's output is B's input)?    → safe

If any check fails → remove the conflicting milestone from the wave, dispatch sequentially
```

### Step 2: Write Ownership Map

Write `.claude/ownership.md` before spawning any agents.

### Step 3: Dispatch with Worktree Isolation

Spawn each agent via Task with `isolation: "worktree"`:

```
Task: Implement Milestone {N} — {title}

[worktree mode]
Branch: parallel/{milestone-slug}
Do NOT push to origin. Commit locally only.
Report branch name in completion message.

{standard milestone context from orchestrator Step 4}
```

Include in every parallel dispatch:
```
Worktree rules:
- You are in an isolated git worktree on branch: parallel/{slug}
- Run all tests — they test YOUR changes in isolation only
- If you see errors in files outside your owned directories: STOP, report to orchestrator
- Do NOT run git push — commit locally only
- Your completion message MUST include: "Branch: parallel/{slug}" for merge tracking
```

### Step 4: Wait for All Agents in the Wave

Do NOT start the merge until ALL parallel agents in this wave have reported:
- `COMPLETE` → proceed with merge
- `FAILED` → merge all completed branches first, then handle the failure as a blocked milestone

---

## Merge Protocol (Orchestrator)

After all parallel agents report done, merge sequentially:

```bash
# Step 1: Return to main branch
git checkout main  # or master / development

# Step 2: Merge each branch in completion order
git merge parallel/m3-auth --no-ff -m "merge: M3 auth endpoints [parallel wave N]"
git merge parallel/m4-profile --no-ff -m "merge: M4 user profile [parallel wave N]"

# Step 3: If merge conflict on step N:
# - Identify which files conflict
# - Read both versions
# - Apply the correct merge (usually: keep both feature additions, not one-or-other)
# - Mark conflict resolved, continue with remaining branches

# Step 4: Run full test suite on merged main
npm test 2>&1 | tail -20

# Step 5: If tests pass → push
git push origin main

# Step 6: Clean up worktree branches
git branch -d parallel/m3-auth parallel/m4-profile parallel/m5-email
```

**Merge order matters**: merge the branch with the fewest cross-dependencies first.
When uncertain: sort by `Estimated Complexity` ascending (simpler merges first).

---

## Agent Coordination Rules (for Milestone Builder in Parallel Mode)

These rules are injected by orchestrator into every parallel milestone-builder prompt:

1. **Own your scope** — only write files in your declared "Directories Owned". If the task requires touching a file outside your scope, STOP and report to orchestrator.

2. **Never push** — commit locally on your worktree branch. Do not run `git push`.

3. **Test in isolation** — your test run should only test what you changed. If the test suite has cross-cutting failures, filter to your files: `pytest tests/auth/ -v` not `pytest .`

4. **Errors outside your files = not your problem** — if you see compilation errors or test failures in files you didn't modify, that's a parallel agent's in-progress state. Report to orchestrator: "Test failures in {file} — outside my scope, may be parallel agent interference."

5. **Report branch on completion** — always end your report with: `Branch: parallel/{slug}`

---

## Conflict Resolution Ladder

| Conflict type | Resolution |
|---------------|-----------|
| Two agents wrote to the same file (despite safety check) | Orchestrator reads both versions, applies correct merge manually |
| Merge conflict on shared config (package.json, tsconfig) | Merge both dependency lists; the second merge wins on formatting |
| Merge conflict on shared schema | STOP — run /debate before merging; schema changes are architectural |
| Test suite broken after merge | Identify which merge introduced the break; revert that branch, add to blocked |
| Agent reports "errors in files outside my scope" | Orchestrator pauses that agent, lets the other agent stabilize first |

---

## When NOT to Use Parallel Dispatch

| Condition | Reason |
|-----------|--------|
| Milestone touches `package.json` / `requirements.txt` | Dependency changes affect the full build — sequential only |
| Milestone touches database schema | Schema migrations must run in order |
| Milestone has `Structural Decision Required: YES` | Architecture must be resolved before implementation |
| Project has < 3 milestones total | Sequential is simpler; parallel overhead exceeds gain |
| No worktree support (bare repo, certain CI environments) | Falls back to sequential automatically |

---

## Wave State File — Context Loss Protection

During parallel execution, the orchestrator writes `.claude/parallel-wave-state.md` **before dispatching any agents**. This file survives context compaction and enables session resume.

### Format

```markdown
---
wave: {N}
started: {ISO timestamp}
status: in-flight
milestones: [M3, M4, M5]
---

| Milestone | Branch | Status | Commit | Notes |
|-----------|--------|--------|--------|-------|
| M3 — Auth endpoints | parallel/m3-auth | running | — | P1 slot |
| M4 — User profile | parallel/m4-profile | done | a1b2c3d | merged to worktree |
| M5 — Email service | parallel/m5-email | failed | — | timeout on test suite |
```

### Lifecycle

1. **Created** — by `/parallel` Step 4 or orchestrator Step 4, before agent dispatch
2. **Updated** — as each agent reports completion (status → `done`/`failed`, commit hash filled)
3. **Deleted** — by orchestrator Step 8 or `/parallel` Step 8, after all branches merged and cleanup done

### Rules

- The file MUST exist whenever parallel agents are in-flight
- If this file exists at session start → a previous wave was interrupted → trigger Resume Protocol
- Only the orchestrator or `/parallel` command writes this file — builders never touch it

---

## Resume Protocol — Recovering Interrupted Waves

When the orchestrator or `/parallel` finds `.claude/parallel-wave-state.md` at session start:

### Step 1: Read Wave State
```bash
cat .claude/parallel-wave-state.md
```

### Step 2: Check Each Branch
For every milestone with `status: running` (was in-flight when session died):
```bash
# Does the branch exist?
git branch --list "parallel/{slug}"

# Does it have commits beyond the fork point?
git log main..parallel/{slug} --oneline 2>/dev/null | head -5
```

### Step 3: Classify Each Milestone

| Branch exists? | Has commits? | Action |
|---------------|-------------|--------|
| Yes | Yes | Mark `done` in wave state — ready to merge |
| Yes | No | Agent never started — re-dispatch |
| No | — | Branch was cleaned up or never created — re-dispatch |

### Step 4: Resume
- Milestones marked `done` or with commits → proceed to Merge Protocol
- Milestones needing re-dispatch → spawn new agents (same parameters as original dispatch)
- Update `.claude/parallel-wave-state.md` with new statuses before re-dispatching

### Step 5: Continue Normal Flow
After resume completes, continue with Merge Protocol → Plan Update → Cleanup as usual.

---

## Ownership Map Cleanup

After wave merge is complete:
```bash
# Remove ownership.md entries for the completed wave
# (or replace the table with a merge record)
echo "## Wave {N} merged — {timestamp}" >> .claude/ownership.md

# CRITICAL: Delete wave state file — prevents false resume on next session
rm -f .claude/parallel-wave-state.md
```
