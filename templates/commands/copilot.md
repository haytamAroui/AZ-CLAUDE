# /copilot — Autonomous Milestone Execution

**Purpose**: Work through a structured plan autonomously. Plan → Build → Test → Commit → Evolve → Ship.

You are in COPILOT mode. No human input needed. Decide what to do next based on state files.

---

## Orchestration Mode

If `.claude/agents/orchestrator.md` exists:
→ Delegate ALL decisions to the orchestrator agent. It owns the full loop (plan → architect → dispatch → monitor → ship).
→ Run it now. Do NOT run the built-in logic below.

If `.claude/agents/orchestrator.md` does not exist (fallback — run built-in logic below):

---

## Step 0: Intent Check

Check if `.claude/copilot-intent.md` exists:
```bash
ls .claude/copilot-intent.md 2>/dev/null && echo "intent=found" || echo "intent=missing"
```

If `intent=missing`:
```
⚠ No copilot-intent.md found.

Run /dream first to define your product? (recommended — provides test strategy, done criteria, deployment target)
Or continue inferring intent from CLAUDE.md? (faster, less precise for complex projects)

Proceeding without copilot-intent.md — inferring from CLAUDE.md and plan.md.
```
Continue to Step 1 either way — do NOT block. Log the absence in goals.md as a note.

---

## Step 1: Read State

Read these files (skip any that don't exist):
1. `.claude/plan.md` → milestone tracker (what to build, status of each)
2. `.claude/memory/goals.md` → recent work, file breadcrumbs
3. `.claude/memory/checkpoints/` → latest checkpoint (reasoning state)
4. `.claude/copilot-intent.md` → original product description
5. `.claude/memory/blockers.md` → what's stuck and why
6. `.claude/memory/patterns.md` → learned conventions
7. `.claude/memory/decisions.md` → past architecture choices

---

## Step 1b: Governance Check

```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "constitution=missing"
ls .claude/specs/*.md 2>/dev/null | head -5
```

If constitution missing → note in goals.md: "No constitution — run /constitute to define project rules"
(Do NOT block execution — constitution is recommended, not required)

---

## Step 2: Decide What To Do

Follow this decision tree in order:

1. **No CLAUDE.md filled?** → Run `/setup` with the intent from copilot-intent.md
2. **No plan.md but specs exist?** → Run `/blueprint .claude/specs/{latest-spec}` to derive plan from spec
3. **No plan.md, no specs?** → Run `/blueprint` to generate a milestone plan from intent
4. **Plan has incomplete milestones?** → Find the next one (respecting dependencies):
   - If `constitution.md` exists → spawn `constitution-guard` agent with milestone details before implementing
   - If constitution-guard returns VIOLATION → log to `blockers.md`, skip this milestone, continue to next
   - If APPROVED (or no constitution) → implement the milestone
5. **3 milestones done since last /evolve?** → Run `/evolve` first, then continue
6. **All milestones done?** → Run `/analyze` then `/audit` on the full project
7. **Review passes?** → Run `/ship` and deploy
8. **Deploy succeeds?** → Write `COPILOT_COMPLETE` to goals.md, generate copilot-report.md

---

## Step 3: Per Milestone

For each milestone in plan.md:

1. Read the milestone description and expected files
2. Implement it completely using `/add` or direct coding
3. Run all tests (`npm test`, `pytest`, or whatever the project uses)
4. If tests fail → fix (2 attempts max per failure)
5. If still failing → log to `.claude/memory/blockers.md`:
   ```
   ### M{N}: {milestone title}
   - Error: {exact error}
   - Attempts: 2
   - Context: {what was tried}
   - Status: blocked
   ```
   Then skip to next milestone.
6. Stage and commit: `{type}: {what} — {why}`
7. Push
8. Update plan.md: set milestone status to `done`
9. Run `/snapshot`

---

## Step 4: Evolution Cycle (Every 3 Milestones)

After every 3 completed milestones:
1. Run `/reflexes analyze` — detect patterns from tool-use observations, create/update reflexes
2. Run `/evolve` — scans git history for patterns, creates agents if evidence found
3. Run `/analyze` — check for GHOST milestones (marked done but not implemented) and spec→plan drift
   - If GHOST milestones found → set their status back to `pending` in plan.md, add back to queue
   - If spec drift found → log gap to `.claude/memory/blockers.md` as a fix milestone
4. Check if CLAUDE.md conventions need updating
5. Re-read plan.md — re-evaluate remaining milestone priorities
6. If a blocked milestone can now be unblocked (new agents/context available) → retry it

---

## Step 5: Final Review

When all milestones show status `done` (or `blocked` with no unblock path):
1. Run `/analyze` — verify all done milestones are actually implemented (no GHOSTs)
   - If GHOST milestones found → re-open them, add as fix milestones, continue building
   - If /analyze shows consistency ≥ 90% → proceed
2. Run `/audit` on the full project against copilot-intent.md
3. If review finds gaps → create fix milestones, add to plan.md, continue building
4. If review passes → proceed to ship

---

## Step 6: Ship and Complete

1. Run `/ship` — tests, secrets scan, commit, push
2. Generate `.claude/copilot-report.md`:
   ```markdown
   # Copilot Report

   ## Intent
   {from copilot-intent.md}

   ## Milestones
   | # | Title | Status | Commit |
   |---|-------|--------|--------|
   {from plan.md}

   ## Decisions Made
   {from decisions.md}

   ## Agents Created
   {list any agents /evolve generated}

   ## Blockers Encountered
   {from blockers.md, or "None"}

   ## Test Coverage
   {test results summary}
   ```
3. Write `COPILOT_COMPLETE` to the top of goals.md
4. Final `/snapshot`

---

## Step 7: Blocker Recovery (After All Non-Blocked Milestones Done)

If any milestones are `blocked` and other milestones are now `done`:
1. Re-read `.claude/memory/blockers.md` for each blocked milestone
2. With full project context now available, retry the blocked milestone
3. If retry succeeds → update plan.md status to `done`, remove from blockers.md
4. If retry still fails → run `/debate` to find alternative approach
5. If debate finds solution → implement it
6. If no solution → mark as `skipped` in plan.md, document reason

---

## Self-Healing Protocol

When any build step fails:
1. **Re-read the error** — exact output, not a summary
2. **Check antipatterns.md** — has this failure pattern been seen before?
3. **Try alternative approach** — different library, different structure, different order
4. **Record what failed** — append to `.claude/memory/antipatterns.md`:
   ```
   ## {what failed} — {date}
   Error: {exact error}
   Why: {root cause}
   Avoid: {what to do differently}
   ```
5. **Record what worked** — append to `.claude/memory/patterns.md`:
   ```
   ## {what worked} — {date}
   Pattern: {description}
   Files: {where it's used}
   ```

Every failure teaches the environment something. Never fail silently.

---

## Rules

- Do NOT ask for permission between milestones
- Do NOT pause for approval
- STOP only if: tests fail after 2 fix attempts on same issue AND alternative approach also fails → log to blockers.md, continue to next milestone
- STOP if: all milestones complete and shipped
- Every commit message follows: `{type}: {what} — {why}`
- Run `/snapshot` after every milestone (context compaction protection)
- Read `.claude/memory/patterns.md` before implementing — follow what works
- Read `.claude/memory/antipatterns.md` before implementing — avoid what broke
