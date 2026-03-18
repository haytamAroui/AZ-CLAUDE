# Plan Tracker — Structured Milestone Management

**Load when**: reading plan.md, updating milestone status, checking dependencies, generating plan.md

---

## plan.md Format

Every plan.md must follow this structure exactly. The copilot runner parses it.

```markdown
# Project Plan

## Intent
{one paragraph: what the product does, who it's for}

## Milestones

### M1: {title}
- Status: {pending|in-progress|done|blocked|skipped}
- Files: {expected files to create/modify}
- Depends: {M-numbers this depends on, or "none"}
- Commit: {expected commit message}

### M2: {title}
- Status: pending
- Files: ...
- Depends: M1
- Commit: ...

## Summary
Total: {N} milestones
Done: {N}/{total}
In progress: {N}/{total}
Blocked: {N}/{total}
```

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not started, waiting for dependencies |
| `in-progress` | Currently being worked on |
| `done` | Completed, committed, pushed |
| `blocked` | Failed after 2 fix attempts, logged to blockers.md |
| `skipped` | Intentionally skipped (e.g., deploy target not specified) |

## Dependency Rules

- Never start a milestone whose dependencies aren't `done`
- If a dependency is `blocked`, the dependent milestone becomes `pending` (may unblock later)
- Circular dependencies are a plan error — flag and resolve before building

## Finding Next Milestone

To find the next milestone to work on:
1. Scan milestones top-to-bottom
2. Skip `done`, `blocked`, `skipped`
3. For `pending`: check if all `Depends` milestones are `done`
4. First `pending` with all deps met → set to `in-progress`, start building
5. If no `pending` milestones have met deps → check if any `blocked` can be retried

## Updating plan.md

After completing a milestone:
1. Set `Status: done`
2. Update `Commit:` with actual commit hash/message
3. Update `## Summary` counts
4. Write the file atomically (read → modify → write)
