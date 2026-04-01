---
name: blueprint
description: >
  Plan a large or risky change — reads codebase, writes a file-level plan, waits for
  explicit approval before any code is touched. Use when /add would be too fast.
  Triggers on: "plan this", "let's plan before coding", "think through before implementing",
  "design first", "what's the approach", "I need to understand before we build",
  "this is complex — plan it", "don't code yet just plan", "how would we implement",
  "map out the changes", "what files would change".
  NOT triggered by: "add X" or "implement X" alone — those go to /add directly.
argument-hint: "[complex feature or risky change to plan]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---

# /blueprint — Plan Before Implementing

$ARGUMENTS

## Deep Mode Detection

If `$ARGUMENTS` contains `--deep`:
1. Strip `--deep` from arguments before processing
2. Load `shared/ultrathink.md` — enables extended thinking for coupling analysis, wave planning, and risk assessment
3. In Step 2 (Map the Impact): read MORE files, trace dependencies deeper, check 2nd-order effects
4. In Step 3 (Write the Plan): consider 2-3 alternative approaches before choosing the plan structure
5. In Parallel Planning: spend more reasoning on coupling analysis — catch subtle shared-resource conflicts

---

**Use /add for straightforward features. Use /blueprint when:**
- The change touches 4+ files
- It involves a schema, API contract, or interface change
- Getting it wrong would be costly to reverse
- You want explicit approval before any code is written

---

Call the `EnterPlanMode` tool NOW — this enforces read-only mode at the kernel level.
No file edits are possible until you call `ExitPlanMode` at Step 4: Approval Gate.

---

## Step 1: Spec Detection + Clarify

First check if $ARGUMENTS is a spec file:
```bash
[ -f "$ARGUMENTS" ] && grep -q "Acceptance Criteria" "$ARGUMENTS" && echo "spec-file" || echo "inline"
```

**If spec file detected** (`.claude/specs/*.md`):
1. Spawn `spec-reviewer` agent to validate quality:
   ```
   Validate this spec file before I use it to generate plan.md: {spec-file-path}
   ```
2. If verdict = `APPROVED` → read spec directly as the source of truth. Skip AskUserQuestion.
   - Extract acceptance criteria → use as milestone completion criteria
   - Extract data model / API changes → use as Files: hints
   - Extract out-of-scope → use to exclude from milestones
3. If verdict = `NEEDS_CLARIFY` → stop: `Run /clarify {spec-file} first, then retry /blueprint`
4. If spec-reviewer not installed → read spec file directly, proceed without validation

**If inline description** (not a spec file):
- Check if `.claude/specs/` has a spec matching $ARGUMENTS keywords:
  ```bash
  ls .claude/specs/ 2>/dev/null | grep -i "$(echo "$ARGUMENTS" | cut -d' ' -f1-2)"
  ```
- If matching spec found → use it. If not → proceed with AskUserQuestion below.

If $ARGUMENTS is vague (and no spec found), use **AskUserQuestion**:
- What is the goal? (the problem, not the solution)
- Any hard constraints? (backwards compatibility, performance, deadline)
- What's explicitly out of scope?

---

## Step 2: Map the Impact

Find every file that will need to change:

```bash
grep -r "{keyword from $ARGUMENTS}" --include="*.ts" --include="*.py" --include="*.js" -l | head -15
```

For each affected file, read the relevant section — not the whole file.

Identify:
- **Interfaces / types** that will change → downstream consumers must be updated
- **Tests** that must be added or modified
- **Config / migration** side effects

---

## Step 3: Write the Plan

Output a numbered list — every item must include `file:line`:

```
Plan: {title}
Risk: low / medium / high — {one sentence why}

Steps:
1. src/auth/jwt.ts:45 — add refreshToken() — covers 7-day renewal flow
2. src/auth/types.ts:12 — extend TokenResponse with refreshToken field
3. tests/auth/jwt.test.ts — add 3 tests: valid refresh, expired token, tampered token
4. src/api/routes/auth.ts:88 — wire POST /auth/refresh to new method
```

**Bad (too vague):** "Update the auth module"
**Good:** "`src/auth/jwt.ts:45` — add `refreshToken()` — handles 7-day renewal"

State the risk level. If risk = high → recommend `EnterWorktree` during implementation.

---

## Step 3b: Constitution + Code Rules Check + Task Graph

After writing the plan (Step 3), check:
```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "no constitution"
[ -f .claude/code-rules.md ] && echo "code-rules=found" || echo "no code-rules"
```

If constitution found → scan plan steps against non-negotiables:
- Read `## Non-Negotiables` from constitution.md
- Flag any plan step that could violate a rule
- Add a note to flagged steps: `⚠ Constitution check: may conflict with "{rule}" — verify before implementing`

If code-rules found → read the file header line (`# Architecture: {pattern}`):
- The plan must respect the declared architecture pattern (Clean Architecture / DDD / MVC / feature-based / etc.)
- If a plan step would introduce a pattern that conflicts with the declared architecture — flag it
- Add note: `⚠ Code rules: this step should follow {architecture pattern} — verify approach before implementing`

Then run `/tasks` to show dependency waves:
```
Next: Run /tasks to see which plan steps can run in parallel
```
(Do not block — /tasks is informational at this stage)

---

## Parallel Planning — Task Classifier + Wave Assignment (ALL modes)

**Runs in both interactive and copilot mode.**
Produces the milestone set and wave structure that Step 3c visualizes.
In copilot mode, the orchestrator dispatches directly from this output.

**Mode detection:**
```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

### Task Classifier — Zero-Conflict Milestone Design (REQUIRED before wave assignment)

**Run this BEFORE creating milestones.** Groups coupled work together so parallel dispatch is safe by construction — not by detection after the fact.

**Step 0: Greenfield check**
```bash
SRC_COUNT=$(find src/ app/ lib/ -type f 2>/dev/null | wc -l 2>/dev/null || echo 0)
echo "source_files=$SRC_COUNT"
```
If source_files < 10 → greenfield project. Force Wave 1 = all foundation work (schema, config, shared utils, types) as a SINGLE milestone regardless of feature count. Parallel only unlocks from Wave 2 onward, after the foundation exists and greps have real files to scan.

**Step 0b: Toolchain check (load `capabilities/shared/toolchain-gate.md`)**
```bash
# Check Verify field in CLAUDE.md
grep -q "^Quick:" CLAUDE.md 2>/dev/null && echo "verify=configured" || echo "verify=missing"
```
If `verify=missing` → run toolchain detection protocol from toolchain-gate.md and write `## Verify` to CLAUDE.md.
If tools are missing → warn in the plan: `"⚠ Toolchain gap: {tool} not installed. Agents cannot run Tier 1 verification. Run: {install command}"`

Wave 0 (foundation) MUST include a toolchain bootstrap step:
```
## M0: Foundation — Toolchain + Schema + Shared Types
- Install missing tools and dependencies
- Run smoke test: {quick_verify_cmd}
- Create shared types, base schemas, core config
```

**Step 1: List raw work items**
From the intent/spec, enumerate ALL features, endpoints, models, UI pages, and background jobs as raw items. Do not group yet — just list everything the project needs.

**Step 1b: Migration detection (before coupling analysis)**
For each raw work item, check if it is a **migration or cross-cutting refactor**:
- Framework/library upgrade (React class→hooks, Svelte 4→5, Vue Options→Composition, Angular versions)
- Language version bump that changes syntax or stdlib APIs
- Build tool change (webpack→vite, setuptools→poetry, Maven→Gradle)
- Store/state management rewrite (Redux→Zustand, Vuex→Pinia, writable→runes)
- ORM or database driver migration
- Auth/middleware pattern rewrite

**If detected → force SEQUENTIAL-ONLY.** Never split a migration across parallel agents.
Mark the milestone: `Parallel: no (migration — SEQUENTIAL-ONLY)`.
If the migration touches 15+ files, recommend sequential sub-milestones:
```
Sub-1: {foundation — sets the new pattern} → SEQUENTIAL-ONLY
Sub-2: {consumers group A — follows pattern} → Depends: Sub-1
Sub-3: {consumers group B — follows pattern} → Depends: Sub-2
```

**Step 2: Coupling analysis — merge rule**
For each pair of raw work items, check if they share ANY of:
- Same database table (both CREATE or ALTER the same table)
- Same config file (`package.json`, `tsconfig.json`, `prisma/schema.prisma`, `docker-compose.yml`, `go.mod`, `Cargo.toml`)
- Same utility module (both CREATE or MODIFY files in `utils/`, `shared/`, `common/`, `lib/`, `helpers/`)
- Same API contract (one produces an endpoint, the other consumes it within the same feature boundary)

If any coupling exists → merge those two items into ONE milestone. Repeat until no same-wave pair shares any resource.

**Step 3: Independence check — split rule**
Work items that share NONE of the above → separate milestones, `Parallel: yes` candidate.

**Result:** Every milestone is either:
- **Fat milestone** — all coupled work together. One agent handles everything that would otherwise conflict. Larger task, zero parallel risk.
- **Thin milestone** — fully independent. Parallel-safe by construction, not by detection.

Proceed to Layer 1 with these merged milestones — not with raw work items.

---

### Parallel Optimization Pass — Layer 1 (REQUIRED before writing plan.md)

**Design note — two-layer safety model:**
This pass is Layer 1: fast, directory-level, runs before plan.md is written.
Layer 2 is problem-architect (after plan.md): exact file paths, catches shared utilities.
Layer 3 is the orchestrator at dispatch: final `Files Written:` overlap check.

Layer 1 catches ~80% of conflicts cheaply. Layer 2 catches the rest (shared utils, shared config).
Layer 1 does NOT spawn agents — it uses grep only.

**Step 1: Assign waves**
```
Wave 1 = milestones with Depends: none
Wave 2 = milestones that only depend on Wave 1
Wave N = milestones that only depend on waves 1..N-1
```

**Wave 1 contract rule:** Wave 1 sets the types, APIs, schemas, and patterns for all later waves.
- Wave 1 should be the **smallest, most carefully specified wave**
- Wave 1 milestones define shared types, base schemas, core configs, foundational patterns
- Wave 1 agents get 3 fix attempts (not 2) — errors here multiply across every later wave
- Wave 1 MUST pass full build+test verification before Wave 2 dispatches
- If Wave 1 introduces a new pattern → document it in `patterns.md` before Wave 2 dispatch
- **Max agents in Wave 1:** 3 (even if more milestones are ready) — precision over speed

**Step 2: Directory-level isolation check (Layer 1a)**

For each wave with 2+ milestones:
- Does each milestone own a distinct top-level directory? (e.g., `src/auth/` vs `src/users/` vs `src/email/`)
- Does any milestone touch shared config (`package.json`, `prisma/schema.prisma`, `tsconfig.json`, `go.mod`, `Cargo.toml`)?

If two milestones share a top-level directory → add `Depends:` to split them into different waves.

**Step 3: Shared-utility grep (Layer 1b)**

For each same-wave pair, check if they likely share utility files:
```bash
# Find shared utility dirs that multiple features import from
grep -r "from.*utils\|import.*utils\|require.*utils\|from.*shared\|from.*common\|from.*lib" \
  src/ --include="*.ts" --include="*.py" --include="*.js" -l 2>/dev/null | head -20
```

If a `utils/`, `shared/`, `common/`, or `lib/` directory exists AND two parallel milestones
both need to CREATE or MODIFY files there → set `Parallel: no` for both and add a Depends: relationship.

**Do NOT spawn problem-architect here.** The grep is sufficient for Layer 1. Problem-architect
runs after plan.md is written and handles the cases Layer 1 misses.

**Step 4: Set Dirs: and Parallel: fields**

```
- Dirs:     top-level directories this milestone exclusively owns
- Parallel: yes — safe at directory level + no shared utility writes
- Parallel: no  — touches shared config, shared utility, schema, or depends on sibling
- Wave:     {N} (informational — orchestrator uses Depends: for dispatch, not Wave:)
```

A well-designed plan for a 6-feature product:
```
Wave 1: M1 (foundation/schema) — Parallel: no
Wave 2: M2, M3, M4, M5 (independent features) — Parallel: yes (4 agents simultaneously)
Wave 3: M6 (integration/E2E) — Parallel: no
```

---

## Step 3c: Parallel Dispatch Visualization

After classifier + Layer 1 complete, render the dispatch map:

```
══════════════════════════════════════════════════════
  Parallel Dispatch Plan
══════════════════════════════════════════════════════

  Wave 1 (sequential — foundation)
  ┌─────────────────────────────────────────────────┐
  │  M1: {title}                                    │
  │      Dirs: {dirs}                               │
  │      Parallel: no  (foundation — must run first)│
  └─────────────────────────────────────────────────┘
                         │
                         ▼
  Wave 2 (parallel — {N} agents simultaneously)
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ M2: {title}  │ │ M3: {title}  │ │ M4: {title}  │
  │ {dirs}       │ │ {dirs}       │ │ {dirs}        │
  │ Parallel: ✓  │ │ Parallel: ✓  │ │ Parallel: ✓  │
  └──────────────┘ └──────────────┘ └──────────────┘
                         │
                         ▼
  (continue for each wave)

  ══════════════════════════════════════════════════
  Summary
  ──────────────────────────────────────────────────
  Total milestones:    {N}
  Waves:               {N}
  Max parallel:        {N} agents (Wave {N})
  Sequential estimate: {total} sessions (~{total×30}min)
  Parallel estimate:   {waves} waves  (~{waves×30}min)
  Time saved:          ~{pct}%

  Merged by classifier:
    • {item A} + {item B} → {MN}  ({reason — e.g. shared schema.prisma})

  Split for parallelism:
    • {item} split from {other item}  ({reason — e.g. different dirs, no shared files})
  ══════════════════════════════════════════════════
```

**Rules:**
- Show every wave, even single-milestone waves
- Side-by-side boxes for parallel milestones in the same wave; single wide box for sequential
- "Sequential estimate" = `total milestones × 30min`; "Parallel estimate" = `wave count × 30min`
- Time saved % = `(sequential - parallel) / sequential × 100`
- "Merged by classifier" lists only merges that changed the plan (not items that were always single)
- "Split for parallelism" lists items the classifier separated into different milestones

**In copilot mode:** write the visualization as a comment block at the top of plan.md:
```markdown
<!-- Parallel Dispatch Plan
Wave 1 (seq): M1 — foundation
Wave 2 (parallel, 4 agents): M2 M3 M4 M5
Wave 3 (parallel, 3 agents): M6 M7 M8
Wave 4 (seq): M9 — integration
Sequential: ~270min | Parallel: ~120min | Saved: ~56%
-->
```

**In interactive mode:** show the visualization before the approval gate.
Let the user adjust wave grouping: "move M5 to Wave 3" → adjust Depends:, re-render, re-present.

---

## Step 4: Approval Gate

**ExitPlanMode**

Present the plan and STOP. Do not write any code.

Ask the user: **"Approve this plan? (yes / change step N / cancel)"**

- `yes` → create TaskCreate for each step, then state: "Run /add to execute each task."
- `change step N` → revise that step, re-present, ask again
- `cancel` → discard, no tasks created

Tasks are only created after explicit approval. This is the point of /blueprint.

---

## Feature-Scoped Mode (Optional)

When $ARGUMENTS points to a spec file (`.claude/specs/*.md`) OR contains a named feature:

```bash
# Detect spec file
[ -f "$ARGUMENTS" ] && echo "spec-mode" || echo "inline-mode"

# Determine next feature number
NEXT_N=$(ls .claude/features/ 2>/dev/null | grep -c '^' || echo 0)
N=$(printf '%02d' $((NEXT_N + 1)))
SLUG=$(basename "$ARGUMENTS" .md 2>/dev/null || echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-40)
FEATURE_DIR=".claude/features/${N}-${SLUG}"
```

If spec file provided → create a feature-scoped directory:
```bash
mkdir -p "$FEATURE_DIR"
cp "$ARGUMENTS" "$FEATURE_DIR/spec.md"
```

Write the plan to `$FEATURE_DIR/plan.md` (same format as `.claude/plan.md`).
Also write a summary entry to `.claude/plan.md` linking to the feature:
```markdown
## Feature: {N}-{slug}
Files: .claude/features/{N}-{slug}/plan.md
Status: pending
```

This keeps the global plan.md as the tracker while feature details live in their own directory.
Each feature directory is self-contained: `spec.md` + `plan.md` + any generated artifacts.

**When NOT to use feature mode:** quick fixes, single-file changes, copilot mode (uses global plan.md).

---

## Copilot Mode — plan.md Format + Layer 2 Validation

When running inside `/copilot` (detected by: `.claude/copilot-intent.md` exists):
- Skip the approval gate (Step 4) — copilot operates autonomously
- Task Classifier + Layer 1 already ran in the "Parallel Planning" section above
- Write the plan to `.claude/plan.md` using the classified milestones
- Read `.claude/capabilities/shared/plan-tracker.md` for the exact format
- Each milestone = one logical unit of work (1-3 files, one commit)
- Include `Depends:` for milestones that require prior work
- Include `Files:` with expected paths
- Include `Risk: 1-5` — failure cost (1=safe, 5=likely to fail or cascade). Score based on: touches shared state? new pattern? external dependency?
- Include `Value: 1-5` — business impact (1=nice-to-have, 5=core feature). Score based on: user-facing? blocks other features? revenue impact?
- Include `Commit:` with conventional commit format
- Write `## Summary` with counts at the bottom

### Problem-Architect Validation — Layer 2 (after plan.md is written)

Layer 2 refines Layer 1 with exact file-level analysis. Catches shared utilities that
Layer 1's directory check missed (e.g., `src/utils/jwt.ts` shared by M2 and M3 even though
their `Dirs:` are `src/auth/` and `src/users/`).

Check if problem-architect is available:
```bash
ls .claude/agents/problem-architect.md 2>/dev/null
```

If available, spawn it for EACH milestone:
```
Analyze this milestone for the Team Spec:
Milestone: {description from plan.md}
Current state: {what files exist in the project}
Available agents: {list of .claude/agents/}
Available skills: {list of .claude/skills/}
```

For each milestone, append the returned Team Spec fields to plan.md:
- `Files Written:` exact paths (this is the authoritative list — supersedes `Files:`)
- `Parallel Safe:` YES/NO with reason
- `Complexity:` SIMPLE / MEDIUM / COMPLEX
- `Pre-conditions:` checklist
- `Risks:` and mitigation
- `Structural Decision:` YES/NO

**Correction pass — when Layer 2 contradicts Layer 1:**

If problem-architect returns `Parallel Safe: NO` for milestone M_X but Layer 1 wrote `Parallel: yes`:

1. Read the reason: `Parallel Safe: NO — reason: {both M_X and M_Y write src/utils/jwt.ts}`
2. Identify the conflicting pair (M_X and M_Y)
3. Update plan.md:
   - Add `Depends: M_X` to M_Y (or vice versa — whichever is simpler first)
   - Update `Wave:` for M_Y to the next wave
   - Change `Parallel: yes` → `Parallel: no` for affected milestones
   - Update `## Summary` wave count
4. This is a plan.md correction, not a failure — blueprint is refining its initial estimate

After all milestones annotated and corrections applied → return control to /copilot.

---

## Completion Rule

Show: the plan with `file:line` references + risk level.
Show: tasks created (only after approval).
Do not write any code during /blueprint — ever (unless in copilot mode, where plan.md is the output).
