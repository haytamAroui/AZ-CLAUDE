# /copilot — Autonomous Milestone Execution

**Purpose**: Work through a structured plan autonomously. Plan → Build → Test → Commit → Evolve → Ship.

You are in COPILOT mode. No human input needed. Decide what to do next based on state files.

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

## Step 2: Decide What To Do

Follow this decision tree in order:

1. **No CLAUDE.md filled?** → Run `/setup` with the intent from copilot-intent.md
2. **No plan.md?** → Run `/plan` to generate a milestone plan
3. **Plan has incomplete milestones?** → Find the next one (respecting dependencies), implement it
4. **3 milestones done since last /evolve?** → Run `/evolve` first, then continue
5. **All milestones done?** → Run `/review` on the full project
6. **Review passes?** → Run `/ship` and deploy
7. **Deploy succeeds?** → Write `COPILOT_COMPLETE` to goals.md, generate copilot-report.md

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
9. Run `/checkpoint`

---

## Step 4: Evolution Cycle (Every 3 Milestones)

After every 3 completed milestones:
1. Run `/evolve` — scans git history for patterns, creates agents if evidence found
2. Check if CLAUDE.md conventions need updating
3. Re-read plan.md — re-evaluate remaining milestone priorities
4. If a blocked milestone can now be unblocked (new agents/context available) → retry it

---

## Step 5: Final Review

When all milestones show status `done` (or `blocked` with no unblock path):
1. Run `/review` on the full project against copilot-intent.md
2. If review finds gaps → create fix milestones, add to plan.md, continue building
3. If review passes → proceed to ship

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
4. Final `/checkpoint`

---

## Rules

- Do NOT ask for permission between milestones
- Do NOT pause for approval
- STOP only if: tests fail after 2 fix attempts on same issue AND alternative approach also fails → log to blockers.md, continue to next milestone
- STOP if: all milestones complete and shipped
- Every commit message follows: `{type}: {what} — {why}`
- Run `/checkpoint` after every milestone (context compaction protection)
