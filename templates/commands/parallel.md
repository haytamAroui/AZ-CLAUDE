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

## Step 5: Dispatch All Agents Simultaneously (DAG Mode)

**Pre-read shared files** — read files referenced by 2+ agents (models, schemas, configs) and inject their content into each agent's prompt. This eliminates redundant file reads across agents.

Spawn all milestone-builder agents **in a single message** (true parallel — one Task call per agent in the same response):

For each milestone, Task with `isolation: "worktree"`:

```
Task: Implement Milestone {N} — {title}

[PARALLEL MODE — WORKTREE ISOLATED — DAG DISPATCH]
Branch: parallel/{milestone-slug}
Test scope: {test-dir} — run ONLY these tests

Agent role: {from Team Spec}
Directories owned: {from Team Spec}

## Pre-loaded Context (do NOT re-read these files)
{content of shared files injected by orchestrator}

{standard context from orchestrator Step 4}

Worktree rules (MANDATORY):
- Only write files within your "Directories owned"
- DO NOT run git push — commit locally only
- Run ONLY tests in your Test scope — not the full suite
- If you see errors in files outside your directories: STOP, report "scope violation"
- End your report with: "Branch: parallel/{slug}"

Checkpoint protocol (MANDATORY):
- Exception to the ownership rule: you MAY create and update `.claude/checkpoint.md`
  (gitignored, so it never enters git history). It is the only file outside your
  "Directories owned" you are allowed to write. Create the dir if absent: `mkdir -p .claude`.
- After completing each logical sub-step:
  1. Write/append to `.claude/checkpoint.md`:
     ## Checkpoint {N} — {ISO timestamp}
     Completed: {one-line description of what was done}
     Files modified: {files touched in this sub-step}
     Decisions: {non-obvious choices — e.g. "used JWT not session tokens"}
     Next: {what remains}
  2. Commit your owned-dir changes locally: `git add <owned files> && git commit -m "checkpoint {N}: {summary}"`
     (makes recovery verifiable via `git log`; gives the retrospective real duration data — Patch 2 9b)
- If a sub-step fails after 2 retries, STOP. Do not continue past the failure.
  Report your last successful checkpoint number in the completion message.
- Completion message format becomes:
  "Branch: parallel/{slug} | Checkpoints: {N} completed | Status: COMPLETE or FAILED_AT_{N+1}"

```

**Max parallel agents:** 6 (default). Test-only milestones don't count toward the limit.

---

## Step 6: Wave Merge (Wait-for-All)

All agents in a wave resolve before any merge starts (see rationale above).
Once ALL agents in the wave have reported:

1. Merge sequentially in complexity order (simplest first):
   `git checkout main && git merge parallel/{slug} --no-ff`
2. Run scoped tests after each merge to isolate which branch breaks if any
3. Update ownership.md and `.claude/parallel-wave-state.md`:
   - Successful: status → `done`, fill commit hash, record `Notes:` as `—`
   - Failed: status → `failed`, record `Notes:` as `FAILURE={type} FILE={path}`
4. After all merges complete → check DAG for newly-unblocked milestones
5. Run **Between-Wave Discovery Injection** (from parallel-coordination.md)
6. Dispatch next wave (back to Step 3) with injected discoveries

Mark FAILED agents as `blocked` in plan.md — do NOT hold up other agents.

---

## Step 6b: Checkpoint Recovery for Failed Agents

When a Task returns with status FAILED or the agent reports FAILED_AT_{N}:

1. **Read the checkpoint file** from the failed agent's worktree:
   ```bash
   cat <worktree-path>/.claude/checkpoint.md 2>/dev/null
   ```

2. **Verify checkpoint claims against git ground truth** (run in the failed worktree):
   ```bash
   git diff --name-only main...HEAD          # files actually changed
   git log --oneline main..HEAD              # checkpoint commits (from Patch 1a)
   ```
   Compare against the checkpoint's `Files modified:` and `Checkpoint {N}` count.
   If they diverge — trust the diff/log, not the checkpoint narrative.

3. **Decide recovery strategy:**
   - **Verified checkpoints exist** → re-dispatch from last good checkpoint:
     ```
     Task: Resume Milestone {N} — {title}

     [CHECKPOINT RECOVERY — WORKTREE ISOLATED]
     Branch: parallel/{milestone-slug}-retry
     Resume from: Checkpoint {last_good}

     ## Verified prior state (from checkpoint + git verification)
     Files already modified: {verified list}
     Decisions already made: {from checkpoint Decisions field}
     What failed: {agent's failure report}

     IMPORTANT: The previous attempt failed at step {N+1}. Before continuing
     from checkpoint {N}, evaluate whether the APPROACH was wrong — not just
     the execution. If the approach seems flawed, try a different strategy
     for the remaining work.

     {remaining milestone spec}
     ```
   - **No checkpoints or verification fails** → full re-dispatch (current behavior)
   - **Failed at Checkpoint 1** → no recovery benefit, full re-dispatch

4. Only attempt checkpoint recovery **once** per milestone. If the retry also fails →
   mark as `blocked` in plan.md. Do not loop.

---

## Step 7: Final Verification + Push

After all agents in this dispatch have completed and been merged:

```bash
# Run full test suite on merged main (covers cross-module interactions)
{test command} 2>&1 | tail -20

# If all pass → push
git push origin main
```

**If full suite fails**: identify which merge introduced the break → revert that branch → add to blocked.

---

## Step 8: Update Plan + Report

Update `.claude/plan.md` — set merged milestones to `status: done`.
Update `.claude/ownership.md` — replace active table with merge record.
Do NOT delete `.claude/parallel-wave-state.md` yet — Step 9 (retrospective) reads it,
then deletes it in Step 9d. This still prevents false resume on the next session.

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

## Step 9: Wave Retrospective

Analyze the completed wave using **objective signals only** — parse actual output, never narrate.

### 9a. Structured Failure Analysis

Prerequisite: Step 6 (Patch 4) writes structured failure data to wave-state Notes:

    | Milestone | Branch | Status | Commit | Notes |
    |-----------|--------|--------|--------|-------|
    | M3 — Auth | parallel/m3-auth | done | a1b2c3d | — |
    | M4 — Profile | parallel/m4-profile | failed | — | FAILURE=merge_conflict FILE=src/shared/types.ts |
    | M5 — Email | parallel/m5-email | done | e4f5g6h | — |

Parse failures (wave-state still exists — Step 8 no longer deletes it):

    grep "FAILURE=" .claude/parallel-wave-state.md 2>/dev/null

For each `FAILURE=merge_conflict`:
- Extract the FILE that conflicted
- Check: was this file in either agent's `Directories Owned` (ownership map)? If no → coupling miss
- Check: was this file in Layer 1's grep patterns (blueprint.md)? If no → detection gap

### 9b. Duration Calibration (git timestamps only)

Branches still exist (Step 7 no longer deletes them); commit-per-checkpoint (Patch 1a) makes first→last commit span approximate real duration:

    for branch in $(git branch --merged main | grep "parallel/"); do
      FIRST=$(git log "$branch" --reverse --format="%ci" | head -1)
      LAST=$(git log "$branch" --format="%ci" | head -1)
      echo "$branch: $FIRST → $LAST"
    done

Compare actual spans against Wave estimates from plan.md.
Do not use agent self-reports. If a branch has a single commit (no per-checkpoint commits),
record duration as "unknown" rather than 0.

### 9c. Write to learnings file (versioned)

Append to `.claude/memory/parallel-learnings.md` (create if missing — `.claude/` is gitignored, so this is a local calibration store, not shared across clones):

    ## Wave {date} — {wave_number}

    ### Objective Signals
    - Milestones dispatched: {N}
    - Succeeded: {N} | Failed: {N} | Checkpoint-recovered: {N}
    - Merge conflicts: {list with FILE= values}
    - Full suite result after merge: PASS/FAIL

    ### Coupling Misses (if any)
    - M{X} and M{Y} conflicted on: {file}
    - Root cause: {shared utility / shared type / shared config}
    - Was in Layer 1 grep? YES/NO
    - Detection fix: Add `{pattern}` to Layer 1 shared-utility grep

    ### Duration Calibration (if significant deviation)
    - M{N}: estimated ~30min, actual {X}min (git timestamps)
    - Adjustment: {over-scoped → split next time | under-scoped → increase Risk}

**Versioning:** before writing, snapshot:

    cp .claude/memory/parallel-learnings.md .claude/memory/parallel-learnings.$(date +%Y%m%d).bak 2>/dev/null

If the learnings file grows past 50 coupling entries, prune entries older than 90 days
that have been addressed (their detection fix was added to Layer 1).

### 9d. Cleanup (replaces the deletions removed from Steps 7/8)

Run ONLY after 9a-9c have consumed their inputs:

    # 1. Archive wave-state for the record, then delete it
    cp .claude/parallel-wave-state.md .claude/memory/wave-{N}-state.bak 2>/dev/null
    rm .claude/parallel-wave-state.md

    # 2. Remove worktrees BEFORE deleting branches (branch -d fails on checked-out branches)
    git worktree remove <worktree-path-1> --force 2>/dev/null
    git worktree remove <worktree-path-2> --force 2>/dev/null

    # 3. Now delete the branches
    git branch -d parallel/{slug-1} parallel/{slug-2} 2>/dev/null

---

## Completion Rule

Do not say "parallel complete" without showing:
1. Each agent's completion status
2. Merge result for each branch (pass/conflict)
3. Final test output after all merges
4. Updated plan.md milestone statuses
