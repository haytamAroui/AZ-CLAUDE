---
name: tasks
description: >
  Generate a dependency-ordered, parallelizable task list from a plan or spec.
  Shows what can run in parallel vs. what must be sequential.
  Triggers on: "show me the tasks", "task breakdown", "what are the tasks", "task list",
  "dependency order", "what can run in parallel", "task graph", "ordered tasks",
  "show task dependencies", "what should I work on next", "task queue",
  "breakdown the milestones", "sequential vs parallel", "work order",
  "what's next to build", "task planning", "task dependency graph",
  "what order should we build", "parallelizable tasks", "task ordering",
  "task schedule", "which tasks block which".
  Use BEFORE /copilot to understand the work order, or AFTER /blueprint to validate the plan.
argument-hint: "[blank to read plan.md, or path to spec/plan file]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
---

# /tasks — Dependency-Ordered Task List

$ARGUMENTS

**EnterPlanMode** — read-only. No file modifications.

---

## Strategy Detection

If `$ARGUMENTS` contains `--strategy`:
1. Strip `--strategy {name}` from arguments before processing
2. Valid strategies: `risk_first`, `value_first`, `simple_first`, `complex_first`
3. Load `capabilities/shared/strategies.md` for scoring formulas
4. Apply strategy scoring in Step 4b (after wave grouping, before output)

If no `--strategy` flag → check plan.md frontmatter for `strategy:` field.
If neither → no scoring, display milestones in ID order within each wave (current default).

---

## Step 1: Find the Source

```bash
# Check for plan.md
ls .claude/plan.md 2>/dev/null && echo "plan found" || echo "no plan"

# Check for specs
ls .claude/specs/*.md 2>/dev/null | head -5

# If $ARGUMENTS points to a file, use that
[ -n "$ARGUMENTS" ] && [ -f "$ARGUMENTS" ] && echo "using: $ARGUMENTS"
```

Priority:
1. If $ARGUMENTS is a file path → use that
2. If `.claude/plan.md` exists → use plan.md
3. If specs exist but no plan → suggest running `/blueprint` first
4. If nothing found → use **AskUserQuestion**: "Paste the list of tasks or milestones to order"

---

## Step 2: Parse Tasks

Read the source file. Extract each task/milestone with:
- ID (M1, M2, … or T1, T2, …)
- Title
- `Depends:` field (what must be done first)
- `Files:` field (for parallel collision detection)
- Current status (`pending`, `in-progress`, `done`, `blocked`)

---

## Step 3: Build Dependency Graph

For each task, determine:
- **Blocked by**: all tasks that must complete before this one starts
- **Blocks**: all tasks that cannot start until this one is done
- **File collision**: tasks that write to the same files (cannot run in parallel)

Check file collisions:
```bash
# Group tasks by shared files — tasks sharing files cannot run in parallel
```

---

## Step 4: Identify Parallel Groups (DAG Analysis)

Tasks with no dependencies between them AND no file collisions can run in parallel.
Group them into "waves" for visualization (the orchestrator uses the DAG directly, not wave numbers):

**Wave = a set of tasks that can all run simultaneously (informational grouping)**

Algorithm:
1. Wave 1 = tasks with no `Depends:` and status `pending`
2. Wave 2 = tasks that only depend on Wave 1 tasks
3. Wave N = tasks that only depend on tasks in waves 1 through N-1
4. A wave cannot contain tasks that share files

**DAG dispatch note:** The orchestrator dispatches based on `Depends:` satisfaction, not wave numbers. A task in "Wave 3" may launch as soon as its specific dependencies are done — it does NOT wait for all of Wave 2.

---

## Step 4b: Strategy Scoring (if active)

If a strategy was detected (from `--strategy` flag or plan.md `strategy:` field):

For each pending milestone, read its `Risk:`, `Value:`, and `Complexity:` fields.
Map Complexity to integer: SIMPLE=1, MEDIUM=2, COMPLEX=3. Default missing values: Risk=3, Value=3, Complexity=MEDIUM.

Apply the scoring formula from `capabilities/shared/strategies.md`:
- `risk_first`: score = Risk × 2 + Complexity_int
- `value_first`: score = Value × 2 + (6 - Risk)
- `simple_first`: score = (4 - Complexity_int) × 2 + (6 - Risk)
- `complex_first`: score = Complexity_int × 2 + Risk

Sort milestones within each wave by score (descending). Ties broken by higher Risk, then lower ID.
Add a `Score: {N}` column to the output in Step 5.

---

## Step 5: Output the Task Graph

```
Task Dependency Graph
═════════════════════
Source: {file}
Total tasks: {N}  |  Done: {N}  |  Pending: {N}  |  Blocked: {N}

── Wave 1 (can start now) ──────────────────────────────────────
  ▶ M1  {title}                     [Files: src/auth/login.ts]  {Score: N — if strategy active}
  ▶ M2  {title}                     [Files: src/models/user.ts] {Score: N — if strategy active}
  ▶ M3  {title}                     [Files: tests/auth/]        {Score: N — if strategy active}

── Wave 2 (after Wave 1) ───────────────────────────────────────
  ▶ M4  {title}   ←depends M1       [Files: src/api/routes.ts]  {Score: N}
  ▶ M5  {title}   ←depends M2       [Files: src/services/]      {Score: N}

── Wave 3 (after Wave 2) ───────────────────────────────────────
  ▶ M6  {title}   ←depends M4,M5    [Files: src/app.ts]

── Blocked ─────────────────────────────────────────────────────
  ✗ M7  {title}   reason: {from blockers.md}

── Already Done ────────────────────────────────────────────────
  ✓ M0  {title}
```

---

## Step 6: Parallelism Analysis

```
Parallelism Analysis
════════════════════
Max parallel at once: {N tasks in largest wave} (default limit: 6)
Critical path length: {N waves minimum to complete}
File collision pairs: {N pairs that cannot run simultaneously}
DAG dispatch mode: merge-on-complete (agents unblock dependents immediately)

Dispatch strategy: {strategy name or "none (ID order)"}

Suggested dispatch order for /copilot:
  1. Foundation first (shared files: models, schemas) — sequential
  2. Launch all ready tasks simultaneously (DAG readiness, not wave number)
  3. Within each wave, dispatch by strategy score (highest first)
  4. As each task completes → merge → check for newly-unblocked → dispatch immediately
```

---

## Copilot Mode Integration

If `.claude/agents/orchestrator.md` exists:
→ Note: "The orchestrator uses DAG dispatch — each milestone launches when its Depends: are satisfied, with merge-on-complete to unblock dependents immediately"

If no orchestrator:
→ Note: "Copilot will process tasks by wave grouping — Wave 1 first, then Wave 2, etc."

---

## Completion Rule

**ExitPlanMode**

Show: the full task graph with waves.
Show: parallelism analysis.
Show: critical path.
Do not modify plan.md or any other file during /tasks.
