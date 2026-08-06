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

## Dispatch Protocol (DAG-Based)

### Step 1: Build Dependency Graph + Confirm Parallel Safety

Parse `plan.md` into a DAG. A milestone is **ready** when all its `Depends:` have `status = done`.

Before spawning any parallel agents, verify from problem-architect Team Specs:

```
For each pair (A, B) in ready milestones:
  - Files Written(A) ∩ Files Written(B) = empty set?    → safe
  - Parent directories of A and B do not overlap?        → safe
  - No shared schema/config files (prisma.schema, package.json, tsconfig)?  → safe
  - No runtime dependency (A's output is B's input)?    → safe

If any check fails → remove the conflicting milestone from parallel batch, dispatch sequentially after
```

### Step 2: Write Ownership Map

Write `.claude/ownership.md` before spawning any agents.

### Step 2b: Foundation Detection (Auto-Wave 0)

Scan all ready milestones for shared-file bottlenecks:
- If 2+ milestones need to write the same file → extract those changes into a foundation milestone
- Dispatch foundation sequentially FIRST, before any parallel agents
- After foundation completes: re-check readiness (more milestones may now be ready)

### Step 3: Dispatch with Worktree Isolation

Spawn each agent via Task with `isolation: "worktree"`:

```
Task: Implement Milestone {N} — {title}

[worktree mode]
Branch: parallel/{milestone-slug}
Test scope: {test-dir} — run ONLY these tests, not the full suite
Do NOT push to origin. Commit locally only.
Report branch name in completion message.

## Pre-loaded Context (do NOT re-read these files)
{orchestrator pre-reads shared files and relays content here — see context-relay.md for role-based filters and size limits}

{standard milestone context from orchestrator Step 4}
```

Include in every parallel dispatch:
```
Worktree rules:
- You are in an isolated git worktree on branch: parallel/{slug}
- Run ONLY tests in your Test scope — not the full suite
- If you see errors in files outside your owned directories: STOP, report to orchestrator
- Do NOT run git push — commit locally only
- Your completion message MUST include: "Branch: parallel/{slug}" for merge tracking
```

**Max parallel agents:** 6 (default). Test-only milestones do NOT count toward the limit.

### Step 4: Merge-on-Complete (Default) or Batch-Merge (Fallback)

**Merge-on-complete (default when max_parallel > 3):**
As each agent reports `COMPLETE`, merge immediately:
1. `git checkout main && git merge parallel/{slug} --no-ff -m "merge: M{N} {title} [dag]"`
2. Run scoped tests: `{test command} tests/{scope}/ 2>&1 | tail -10`
3. Update plan.md status → `done`, update DAG state file
4. **Check DAG for newly-unblocked milestones** → dispatch them immediately (back to Step 1)
5. Clean up branch: `git worktree remove <worktree-path> --force 2>/dev/null && git branch -d parallel/{slug}`

**Batch-merge fallback (max_parallel <= 3 OR merge conflict detected):**
Wait for ALL dispatched agents to complete, then merge sequentially (simplest first).

When agent reports `FAILED`:
- Do NOT block other agents — continue merging completed branches
- Log failure to blockers.md, set plan.md status → `blocked`

---

## Merge Protocol (Orchestrator)

Two modes, selected automatically based on `max_parallel` and conflict state:

### Mode A: Merge-on-Complete (default, max_parallel > 3)

Each agent's branch is merged as soon as it completes — no waiting for others:

```bash
# Agent M3 reports COMPLETE:
git checkout main
git merge parallel/m3-auth --no-ff -m "merge: M3 auth endpoints [dag]"
{test command} tests/auth/ 2>&1 | tail -10  # scoped test only
git worktree remove <worktree-path-m3> --force 2>/dev/null
git branch -d parallel/m3-auth

# Check DAG: M5 depends on M3 → M5 is now ready → dispatch M5 immediately
# Meanwhile M4 is still running in its worktree — no interference
```

**After all agents in batch complete:** run full test suite once on merged main.
If full suite passes → `git push origin main`.

### Mode B: Batch-Merge (fallback, max_parallel <= 3 or conflict detected)

Wait for ALL dispatched agents, then merge sequentially:

```bash
git checkout main
git merge parallel/m3-auth --no-ff -m "merge: M3 auth endpoints [dag]"
git merge parallel/m4-profile --no-ff -m "merge: M4 user profile [dag]"
{test command} 2>&1 | tail -20  # full suite after all merges
git push origin main
git worktree remove <worktree-path-m3> <worktree-path-m4> --force 2>/dev/null
git branch -d parallel/m3-auth parallel/m4-profile
```

### Merge Rules (both modes)

- **Merge order**: simplest milestone first (sort by `Estimated Complexity` ascending)
- **If merge conflict**: read both versions, apply correct merge (keep both feature additions)
- **If conflict is unresolvable**: switch from Mode A to Mode B for remaining branches
- **If tests fail after merge**: identify which merge broke it → revert that branch → add to blocked

---

## Between-Wave Discovery Injection

When a wave completes, the orchestrator has all Task return values (agent completion
reports) in context. Before dispatching the next wave, extract discoveries that
affect upcoming milestones.

### Extraction (runs between waves, not during)

For each completed agent's report, look for:
- **Schema/API differences** from what the plan assumed
- **Missing dependencies** the agent had to install
- **Convention decisions** the agent made (naming, patterns, error handling)
- **Unexpected constraints** discovered during implementation

These are pulled from the Task return value — no shared file needed, no
worktree-visibility problem. The orchestrator already has this data.

### Injection format

For each next-wave milestone, prepend discoveries from the prior wave
that are relevant to that milestone's scope:

    ## Discoveries from Wave {N-1} (verified — from completed agent reports)

    - M{X} found that {table_name} requires a NOT NULL migration before inserting
      (relevant because your milestone reads from this table)
    - M{Y} chose {pattern} for error handling in {shared module}
      (relevant because your milestone extends this module)
    - M{Z} installed {dependency}@{version} — already in package.json on main
      (relevant to avoid duplicate install or version conflict)

### What this does NOT solve

Same-wave agents cannot help each other. If P1 and P2 are dispatched together
and P1 discovers something P2 needs, P2 will hit the same issue independently.
This is a permanent structural limitation of round-based dispatch.

Between-wave injection prevents the *second* occurrence: Wave N+1 agents won't
repeat Wave N's mistakes. It does not prevent the first occurrence within a wave.

### Rule: discoveries are claims until verified

Before injecting a discovery into a next-wave prompt, verify it:
- Schema claim → check the actual merged state on main
- Dependency claim → check package.json / requirements.txt on main
- Convention claim → check the actual code on main

If verification fails (agent reported something that isn't true in the merged
state), discard the discovery. Do not inject unverified claims.

---

## Agent Coordination Rules (for Milestone Builder in Parallel Mode)

These rules are injected by orchestrator into every parallel milestone-builder prompt:

1. **Own your scope** — only write files in your declared "Directories Owned". If the task requires touching a file outside your scope, STOP and report to orchestrator.

2. **Never push** — commit locally on your worktree branch. Do not run `git push`.

3. **Test in isolation** — run ONLY the tests in your `Test scope` (injected by orchestrator). Example: `pytest tests/auth/ -v` not `pytest .`. Cross-cutting failures are expected from other agents' work.

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

## Proven Patterns — 3-Layer Conflict Prevention

These patterns come from a real production run: 16 agents, 360 tests, zero merge conflicts.

### Layer 1: Wave 0 — Bottleneck Files First (Sequential)

Identify files that multiple milestones need to modify (shared models, core config, base schemas).
**Do NOT parallelize these.** Instead, create a Wave 0 that runs sequentially before any parallel agents:

```
Wave 0 (sequential, orchestrator or single agent):
  models.py      → ALL new fields added at once
  versioning.py  → version bump
  shared_config  → all schema changes

Result: every subsequent agent finds shared dependencies already in place.
```

**Rule: SHARED DEPENDENCY → Wave 0 (sequential, do it first)**

### Layer 2: Directory-Level File Isolation

Design each parallel wave so agents own completely disjoint files:

```
Wave 1 (3 agents, zero file overlap):
  Agent A: annex_1_rules.py, rules.py, conformity_path.py, test_annex_1.py
  Agent B: gpai_rules.py, test_gpai_copyright.py
  Agent C: test_fria_trigger.py, test_national_law_router.py (NEW files only)
```

**Test-only agents are always safe in parallel** — they create new test files and read (never write) engine code.

**Rule: TEST-ONLY agents → always safe in any wave**

### Layer 3: Same File, Different Sections

When two agents must touch the same file, allow it **only if edits are 100+ lines apart**:

```
┌───────┬────────────────────────────────┬────────────┐
│ Agent │ Section in rules.py            │ Line range │
├───────┼────────────────────────────────┼────────────┤
│ M2A   │ After result construction      │ ~line 392  │
│ M2C   │ STEP 13 deadline unpacking     │ ~line 273  │
└───────┴────────────────────────────────┴────────────┘
```

Git merges these cleanly because they don't touch overlapping context (3-line hunk window).

**Rule: SAME FILE, DIFFERENT SECTIONS (100+ lines apart) → allowed in parallel**
**Rule: SAME FILE, SAME SECTION → serialize into different waves**

### Decision Table

| Conflict type | Resolution |
|---------------|-----------|
| Multiple milestones need same model/schema file | Wave 0: one agent fixes it sequentially before all others |
| Agents write different files entirely | Safe for parallel — standard worktree isolation |
| Agents write same file, edits 100+ lines apart | Allowed in parallel — git auto-merges cleanly |
| Agents write same file, edits < 100 lines apart | Serialize into different waves |
| Agent only creates new test files | Always safe in any wave — no write conflicts possible |
| Agent changes a function's return type | Must also fix all callers in the same agent's scope |

---

## Wave State File — Context Loss Protection

During parallel execution, the orchestrator writes `.claude/parallel-wave-state.md` **before dispatching any agents**. This file survives context compaction and enables session resume.

### Format

```markdown
---
dispatch_mode: dag
started: {ISO timestamp}
status: in-flight
max_parallel: 6
milestones: [M3, M4, M5]
---

| Milestone | Branch | Status | Commit | Depends | Unblocks |
|-----------|--------|--------|--------|---------|----------|
| M3 — Auth endpoints | parallel/m3-auth | running | — | [M0] | [M5, M6] |
| M4 — User profile | parallel/m4-profile | done | a1b2c3d | [M0] | [] |
| M5 — Email service | parallel/m5-email | failed | — | [M3] | [M7] |
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

## Universal Parallel Execution Rules

These rules are technology-agnostic. They apply to every parallel dispatch regardless of stack, framework, or language.

### Rule 1: Verification Wave — Mandatory Between Every Parallel Batch

After ALL agents in a wave complete and merge, run a **verification step** before dispatching the next wave:

```
Wave N agents complete → merge all branches → VERIFICATION:
  1. Run full build (compile/transpile/lint — whatever the project uses)
  2. Run full test suite (not scoped — the FULL suite)
  3. If build fails → fix before next wave (these are integration errors from parallel agents)
  4. If tests fail → identify which merge broke it → revert or fix before next wave
  5. Only after verification passes → dispatch Wave N+1
```

**Why:** Parallel agents can't verify integration — they only see their own worktree. Without verification, errors accumulate across waves. A type change in Wave 1 that breaks a Wave 2 consumer won't surface until the end, when fixing is 10x harder.

**The verification agent is lightweight:** it runs build + tests, nothing else. No implementation. Budget ~2 minutes per wave.

### Rule 2: Sweet Spot Is 3–5 Parallel Agents Per Wave

| Agent count | Risk | Recommendation |
|------------|------|----------------|
| 1–2 | Low | Sequential is simpler — skip parallel overhead |
| 3–5 | Optimal | Best ratio of speed gain to coordination cost |
| 6 | Maximum | Only if all 6 own completely disjoint directories |
| 7+ | Diminishing returns | Prompt quality degrades, merge complexity spikes |

**Why:** Beyond 5 agents, the orchestrator's ability to write precise-enough prompts degrades. Each prompt needs exact file ownership, patterns, and anti-patterns. More agents = more surface area for conflicts that safety checks miss.

### Rule 3: Wave 1 Sets the Contract

The first wave establishes types, APIs, schemas, and patterns that ALL subsequent waves depend on. If Wave 1 gets something wrong, the error **multiplies** across every later agent.

**Rules for Wave 1:**
- Wave 1 should be the **smallest, most carefully specified wave**
- Wave 1 milestones define shared types, base schemas, core configs
- Wave 1 agents get **extra fix attempts** (3 instead of 2)
- Wave 1 MUST pass verification before Wave 2 dispatches — no exceptions
- If Wave 1 introduces a new pattern (e.g., error type, response shape), document it in `patterns.md` BEFORE dispatching Wave 2

### Rule 4: Agent Size Limits — When NOT to Split

A milestone that touches **15+ files** or performs a **cross-cutting change** (framework migration, global refactor, store pattern rewrite) should NOT be split across agents.

**Signs a milestone must stay as one agent (sequential):**
- Framework/library migration (every file depends on the pattern set by the first file edited)
- Store/state management rewrite (all consumers depend on the new store shape)
- Global type rename or API contract change (callers can't be split from the definition)
- Auth/middleware rewrite (everything downstream depends on the new interface)

**The fix is better decomposition, not more agents:**
```
BAD:  Split Svelte 5 migration into 5 parallel agents → inconsistent patterns
GOOD: Split into 3 SEQUENTIAL sub-milestones:
      1. Stores + shared state (sets the pattern)
      2. Pages (follows the pattern)
      3. Components (follows the pattern)
      Each sub-milestone has checkpoints. Still sequential, but with clear boundaries.
```

**Rule: If a milestone can't be split without creating pattern inconsistency → keep it as one agent, sequential.**

### Rule 5: Context Drift Mitigation for Later Waves

By Wave 3+, agents work on a codebase modified by 5–15 previous agents. Assumptions about types, APIs, and file contents may be stale.

**Mitigation protocol for Wave N (N ≥ 3):**
1. Orchestrator re-reads ALL files that Wave N agents will import/depend on
2. Orchestrator includes **fresh file contents** in the `## Pre-loaded Context` block — not cached from earlier waves
3. Every Wave 3+ agent prompt includes: `"Warning: {N} milestones have modified the codebase since plan.md was written. Pre-loaded Context below reflects the CURRENT state. Trust it over plan.md assumptions."`
4. If a type/interface was changed by a prior wave, include the **new** definition explicitly

**Why:** Agents don't communicate with each other. An agent in Wave 4 that assumes `Result<_, String>` when Wave 2 changed it to `CmdResult<_>` will produce code that compiles in its worktree but fails on merge.

### Rule 6: Skills Are the Consistency Layer

Parallel agents never communicate, but they must produce consistent code. **Skills are how.**

**Rules:**
- ALL agents in the same wave MUST load the same skill set (from problem-architect's Team Spec)
- If a project uses a specific pattern (e.g., Svelte 5 runes, Rust async, clean architecture), the matching skill MUST be loaded by every agent that touches that layer
- If no skill exists for the project's core pattern → create it with `skill-creator` BEFORE dispatching the first wave
- Skills ensure: consistent error handling, consistent naming, consistent imports, consistent test patterns

**Why:** 5 agents in separate rooms producing code in 5 different styles is worse than 3 agents producing consistent code. Skills are the shared style guide that makes parallel agents act like a coordinated team.

### Rule 7: Framework Migrations Are Always Sequential

Any milestone classified as a **migration** (framework upgrade, language version bump, build system change, ORM migration) MUST run sequentially — never in a parallel wave.

**Detection — a milestone is a migration if it:**
- Changes `package.json` / `requirements.txt` / `Cargo.toml` / `go.mod` major versions
- Rewrites import patterns across 10+ files
- Changes a store/state pattern that all components consume
- Upgrades a UI framework (React class→hooks, Svelte 4→5, Vue Options→Composition)
- Switches a build tool (webpack→vite, setuptools→poetry)

**Why:** Migrations are inherently cross-cutting. Every file depends on the pattern established by the first file migrated. Splitting a migration across agents produces inconsistent patterns that are harder to fix than doing it sequentially.

### Rule Summary Table

| # | Rule | Enforced by |
|---|------|-------------|
| 1 | Verification wave between batches | Orchestrator Step 5 |
| 2 | 3–5 agents per wave (6 max) | Orchestrator Step 2 |
| 3 | Wave 1 = smallest, most careful | Blueprint Task Classifier |
| 4 | 15+ file milestones stay sequential | Problem Architect Team Spec |
| 5 | Fresh context for Wave 3+ agents | Orchestrator Step 4 |
| 6 | Same skills for all wave agents | Orchestrator Step 4 |
| 7 | Migrations always sequential | Blueprint Task Classifier |

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
