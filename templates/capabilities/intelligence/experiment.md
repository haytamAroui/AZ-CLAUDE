---
name: intelligence-experiment
description: >
  Experiment agent with worktree isolation. Use when testing a risky approach
  that must not affect the main branch until proven. Triggers on: "try this approach",
  "experiment with", "test this idea safely", "isolated experiment", "worktree".
tokens: ~80
---

## Experiment Agent

Run risky explorations in an isolated git worktree. Main branch is never touched.

---

### When to Use

- Refactoring with uncertain outcome
- Trying a new library or framework approach
- Architectural change that might break things
- Any "I want to try X but not break the main branch" scenario

If the experiment succeeds → merge. If it fails → discard the worktree. Zero cleanup.

---

### Agent Definition Template

```yaml
---
name: experiment-{task-name}
description: >
  Isolated experiment for {task}. Runs in worktree, cannot affect main branch.
model: claude-sonnet-4-6
maxTurns: 30
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
permissionMode: acceptEdits
isolation: worktree
background: false
---
```

The `isolation: worktree` field is what creates a separate git branch automatically.
The agent operates on a copy — main branch is read-only from the experiment's perspective.

---

### Experiment Protocol

**Before starting**: define the hypothesis and success criteria.
```
Hypothesis: {what you believe will happen}
Success:    {measurable outcome that proves it worked}
Failure:    {measurable outcome that proves it didn't}
```

**After completing** — log the outcome:

If experiment succeeded:
```bash
echo "\n## {task} — $(date +%Y-%m-%d)\n{what worked and why — include hypothesis}" >> .claude/memory/patterns.md
```

If experiment failed:
```bash
echo "\n## {task} — $(date +%Y-%m-%d)\n{what failed, why, what to try instead}" >> .claude/memory/antipatterns.md
```

**Never discard without logging.** A failed experiment that teaches something is a successful experiment.

---

### Merge Decision

After experiment completes:
- Tests pass + success criteria met → merge to main
- Tests fail or success criteria not met → discard worktree, log antipattern
- Partial success → extract the working parts before discarding

Do NOT merge experiments that pass tests but fail success criteria. Tests prove correctness; success criteria prove value.
