# Parallel Agent Execution — Complete Reference

AZCLAUDE can run multiple Claude Code agents simultaneously on the same codebase without
file corruption or test interference. Each agent works in an isolated git worktree on its
own branch. Changes are merged sequentially after all agents complete.

---

## Why parallel execution exists

Building a product sequentially means: M1 done → M2 starts → M3 starts → ...
Each milestone waits for the previous one, even when they're completely independent.

With parallel execution:
```
M1 (schema) → done
                 ↓
    ┌────────────┬────────────┬────────────┐
    M2 (auth)   M3 (profile) M4 (email)   M5 (dashboard)   ← all run simultaneously
    ↓            ↓            ↓            ↓
    └────────────┴────────────┴────────────┘
                 ↓
              M6 (E2E tests)
```

3 sequential waves instead of 6 sequential milestones. Same output, fraction of the time.

---

## The three-layer safety model

Parallel execution is safe only when agents don't write to the same files.
AZCLAUDE enforces this with three layers, each catching what the previous missed.

```
Layer 1a — Directory check (blueprint, pre-plan)
  src/auth/ vs src/users/ → different dirs → SAFE
  src/auth/ vs src/auth/  → same dir → NOT SAFE (add Depends:)

Layer 1b — Shared-utility grep (blueprint, pre-plan, no agents spawned)
  grep "from.*utils|from.*shared" → both milestones import utils/ → NOT SAFE
  No shared imports found → SAFE

Layer 2 — problem-architect exact file scan (post-plan, per milestone)
  Returns: Files Written: [src/auth/login.ts, src/utils/jwt.ts]
  Compares with sibling milestones → shared file found → Parallel Safe: NO
  → triggers correction pass: adds Depends:, updates Wave:

Layer 3 — Orchestrator dispatch gate (runtime, final)
  Checks Files Written: overlap for every parallel pair before spawning
  Even if plan.md says Parallel: yes → dispatch sequential if files overlap
  Cannot be bypassed
```

**Design choice:** Layer 1 is intentionally cheap (grep only, no agents).
Layer 2 catches edge cases (shared utilities). Layer 3 is the safety guarantee.
`Parallel: yes` in plan.md is an estimate. `Parallel Safe: YES` from problem-architect
is authoritative. The orchestrator's Layer 3 check is the final guarantee.

---

## The complete flow

### Phase 1 — Plan (`/blueprint`)

You describe the product. Blueprint analyzes the codebase and generates plan.md.

**Input:**
```
/blueprint "Build compliance SaaS with auth, dashboard, email, and reporting"
```

**Parallel Optimization Pass (Layer 1) — runs before writing plan.md:**

1. Assigns each milestone a `Wave:` based on `Depends:` graph
2. Checks directory isolation for same-wave milestones (Layer 1a)
3. Greps for shared utility imports across same-wave milestones (Layer 1b)
4. Sets `Dirs:` and `Parallel:` fields accordingly
5. If a conflict is found at this stage → adds `Depends:` relationship, splits into different waves

**Output — plan.md:**
```markdown
### M1: Database schema + migrations
- Status: pending
- Wave: 1
- Dirs: prisma/, migrations/
- Files: prisma/schema.prisma, migrations/001_init.sql
- Depends: none
- Parallel: no
- Commit: feat: base schema

### M2: Auth endpoints
- Status: pending
- Wave: 2
- Dirs: src/auth/, tests/auth/
- Files: src/auth/login.ts, src/auth/register.ts, tests/auth/
- Depends: M1
- Parallel: yes
- Commit: feat: auth endpoints

### M3: User profile API
- Status: pending
- Wave: 2
- Dirs: src/users/, tests/users/
- Files: src/users/profile.ts, src/users/routes.ts, tests/users/
- Depends: M1
- Parallel: yes
- Commit: feat: user profile

### M4: Email notification service
- Status: pending
- Wave: 2
- Dirs: src/email/, tests/email/
- Files: src/email/sender.ts, src/email/templates/
- Depends: M1
- Parallel: yes
- Commit: feat: email service

### M5: Frontend dashboard
- Status: pending
- Wave: 2
- Dirs: src/frontend/
- Files: src/frontend/dashboard.tsx, src/frontend/components/
- Depends: M1
- Parallel: yes
- Commit: feat: dashboard UI

### M6: E2E integration tests
- Status: pending
- Wave: 3
- Dirs: tests/e2e/, tests/integration/
- Files: tests/e2e/, tests/integration/
- Depends: M2, M3, M4, M5
- Parallel: no
- Commit: test: E2E coverage
```

**Problem-Architect Validation (Layer 2) — runs after plan.md is written:**

Blueprint spawns problem-architect for each milestone. It scans the actual codebase and returns exact `Files Written:` paths.

Example — if it finds M2 and M3 both write `src/utils/jwt.ts`:
```
problem-architect returns:
  M2 — Parallel Safe: NO — reason: both M2 and M3 write src/utils/jwt.ts

blueprint correction pass:
  → M3 gets Depends: M2
  → M3 Wave: 2 → Wave: 3
  → M3 Parallel: yes → Parallel: no
  → M6 Wave: 3 → Wave: 4
  → plan.md Summary updated
```

plan.md is now annotated with:
- `Files Written:` (exact paths, authoritative)
- `Parallel Safe:` (YES/NO with reason)
- `Complexity:` (SIMPLE/MEDIUM/COMPLEX)
- `Pre-conditions:` checklist
- `Structural Decision:` flag

---

### Phase 2 — Inspect (`/tasks`)

Before executing, you can inspect the wave structure:

```
/tasks
```

Output:
```
Task Dependency Graph
═════════════════════
Source: .claude/plan.md
Total: 6  |  Done: 0  |  Pending: 6  |  Blocked: 0

── Wave 1 (start now) ──────────────────────────────────
  ▶ M1  Database schema           [Dirs: prisma/]

── Wave 2 (after M1) ───────────────────────────────────
  ▶ M2  Auth endpoints            [Dirs: src/auth/]         Parallel: yes
  ▶ M3  User profile API          [Dirs: src/users/]        Parallel: yes
  ▶ M4  Email service             [Dirs: src/email/]        Parallel: yes
  ▶ M5  Frontend dashboard        [Dirs: src/frontend/]     Parallel: yes

── Wave 3 (after Wave 2) ───────────────────────────────
  ▶ M6  E2E integration tests     [Dirs: tests/e2e/]

Parallelism Analysis
════════════════════
Max parallel at once:  4 (Wave 2)
Critical path:         3 waves minimum
File collision pairs:  0

Suggested dispatch: /copilot (auto) or /parallel M2 M3 M4 M5 (manual)
```

---

### Phase 3 — Execute (two options)

#### Option A — Automatic: `/copilot`

The orchestrator reads plan.md and handles everything:

```
/copilot
```

**What the orchestrator does:**

1. Reads plan.md — finds Wave 1 ready (M1, no dependencies)
2. Dispatches M1 sequentially (only one milestone in wave)
3. M1 completes → updates plan.md status: done
4. Reads Wave 2 — finds M2, M3, M4, M5 all `Parallel: yes` + `Parallel Safe: YES`
5. Runs Layer 3 safety check: `Files Written:` for all four — no overlaps confirmed
6. Writes `.claude/ownership.md`:

```markdown
## Active Parallel Session — 2026-03-23T14:30

| Agent | Milestone | Branch | Directories | Status |
|-------|-----------|--------|-------------|--------|
| P1 | M2 — Auth | parallel/m2-auth | src/auth/, tests/auth/ | running |
| P2 | M3 — Profile | parallel/m3-profile | src/users/, tests/users/ | running |
| P3 | M4 — Email | parallel/m4-email | src/email/, tests/email/ | running |
| P4 | M5 — Dashboard | parallel/m5-dashboard | src/frontend/ | running |
```

7. Dispatches all 4 agents **in a single message** — true parallel:

```
→ Task: Implement M2 (isolation: worktree, branch: parallel/m2-auth)
→ Task: Implement M3 (isolation: worktree, branch: parallel/m3-profile)
→ Task: Implement M4 (isolation: worktree, branch: parallel/m4-email)
→ Task: Implement M5 (isolation: worktree, branch: parallel/m5-dashboard)
```

8. Waits for all 4 to complete
9. Merges branches sequentially
10. Dispatches Wave 3 (M6) sequentially
11. Runs `/ship`

#### Option B — Manual: `/parallel M2 M3 M4 M5`

You explicitly choose which milestones to run in parallel right now.
Same execution model as Option A but user-triggered for a specific subset.

```
/parallel M2 M3 M4 M5
```

Useful when:
- You want to run a subset of a wave, not the whole wave
- You're not in full copilot mode
- You want explicit control over the dispatch timing

---

### Phase 4 — What each agent sees (worktree isolation)

Each parallel agent receives this context injected by the orchestrator:

```
You are building M3 — User Profile API

[PARALLEL MODE — WORKTREE ISOLATED]
Branch: parallel/m3-profile

Directories owned: src/users/, tests/users/

WORKTREE RULES (MANDATORY):
1. Only write files inside src/users/ and tests/users/
2. If you see errors in src/auth/ or src/email/ → NOT your problem
   Report: "Scope violation: {file} outside my directories"
3. DO NOT run git push — commit locally only
4. Run tests scoped to your directories:
   npm test tests/users/  (not npm test)
5. End your report with: "Branch: parallel/m3-profile"
```

Each agent has its own private copy of the repo. Agent P1 writing `src/auth/login.ts`
does not affect Agent P2's copy — they are completely isolated until merge.

**Why scoped tests matter:**
Without scoping, Agent P2 running the full test suite would see Agent P1's in-progress
state (incomplete `src/auth/` files), producing false failures. Scoped tests mean
each agent only sees its own completed work.

---

### Phase 5 — Merge protocol

After all agents in a wave report `COMPLETE`, the orchestrator merges:

```bash
# Return to main branch
git checkout main

# Merge in order: simplest complexity first
git merge parallel/m2-auth     --no-ff -m "merge: M2 auth endpoints [wave 2]"
npm test 2>&1 | tail -10         # must pass before next merge

git merge parallel/m3-profile  --no-ff -m "merge: M3 user profile [wave 2]"
npm test 2>&1 | tail -10

git merge parallel/m4-email    --no-ff -m "merge: M4 email service [wave 2]"
npm test 2>&1 | tail -10

git merge parallel/m5-dashboard --no-ff -m "merge: M5 dashboard [wave 2]"
npm test 2>&1 | tail -10

# All merged and passing → push
git push origin main

# Cleanup
git branch -d parallel/m2-auth parallel/m3-profile parallel/m4-email parallel/m5-dashboard
```

**If a merge conflict occurs:**
Two agents modified the same file despite the safety checks (rare — usually a utility file
both needed to extend). The orchestrator reads both versions and applies the correct merge:
- Keep both feature additions (not one-or-other)
- Prefer the second merge's formatting
- Run tests after resolution

**If tests fail after a merge:**
The failing branch is marked `blocked` in plan.md. The orchestrator continues merging
the remaining branches, then retries the blocked milestone after full context is available.

**Conflict resolution ladder:**

| Conflict | Resolution |
|----------|-----------|
| Two agents wrote to the same file | Orchestrator merges both feature additions manually |
| Conflict on `package.json` | Merge both dependency lists; second merge wins on formatting |
| Conflict on database schema | STOP — run `/debate` before merging; schema conflicts are architectural |
| Tests broken after merge | Identify which merge caused it; revert that branch; add to blocked |
| Agent reports scope violation | Orchestrator pauses that agent; lets sibling stabilize first |

---

### Phase 6 — Result

After Wave 2 merges complete, orchestrator updates plan.md:

```markdown
### M2: Auth endpoints
- Status: done
- Commit: abc1234 — feat: auth endpoints

### M3: User profile API
- Status: done
- Commit: def5678 — feat: user profile
```

Updates ownership.md:
```markdown
## Wave 2 merged — 2026-03-23T15:15
4 milestones merged, all tests passing.
```

Proceeds to Wave 3 (M6 — E2E tests), dispatched sequentially.

---

## When parallel execution is NOT used

The orchestrator automatically falls back to sequential dispatch when:

| Condition | Reason |
|-----------|--------|
| Milestone touches `package.json` / `requirements.txt` | Dependency changes affect the whole build |
| Milestone touches database schema (`prisma.schema`, `*.sql`) | Schema migrations must run in order |
| `Structural Decision Required: YES` | Architecture must be resolved before implementation |
| `Parallel Safe: NO` from problem-architect | Exact file conflict detected |
| Only 1 milestone in the wave | Nothing to parallelize |
| No worktree support (bare repo, some CI environments) | Falls back to sequential automatically |

---

## Files involved

| File | Role |
|------|------|
| `.claude/plan.md` | Source of truth — `Wave:`, `Dirs:`, `Parallel:`, `Parallel Safe:`, `Files Written:` |
| `.claude/ownership.md` | Active parallel session tracking — written before dispatch, cleaned after merge |
| `templates/commands/blueprint.md` | Generates plan.md with parallel optimization passes |
| `templates/commands/parallel.md` | Manual parallel dispatch command |
| `templates/commands/tasks.md` | Inspects plan.md, shows wave groups |
| `templates/agents/orchestrator.md` | Reads plan.md waves, runs safety checks, dispatches in parallel |
| `templates/agents/problem-architect.md` | Returns exact `Files Written:` and `Parallel Safe:` per milestone |
| `templates/agents/milestone-builder.md` | Detects worktree mode, commits locally, reports branch |
| `templates/capabilities/shared/parallel-coordination.md` | Full coordination rules, ownership map format, merge protocol |
| `templates/capabilities/shared/plan-tracker.md` | Defines plan.md format including Wave:/Dirs:/Parallel: fields |

---

## Quick reference

```bash
# Full automatic (recommended)
/blueprint "describe your product"   # generates parallel-annotated plan.md
/tasks                               # inspect waves — optional
/copilot                             # orchestrator handles everything

# Manual parallel dispatch
/parallel M2 M3 M4 M5               # run specific milestones in parallel now

# Inspect state
/tasks                               # show current wave graph
/pulse                               # overall project health
```
