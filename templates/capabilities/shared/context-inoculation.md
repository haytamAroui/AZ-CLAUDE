---
name: context-inoculation
description: >
  Explicit boundary language injected before autonomous task dispatch.
  Based on Anthropic's "Natural Emergent Misalignment from Reward Hacking" paper
  (Section 4.2). Reduces reward hacking generalization by 75-90%.
  Load when: /copilot dispatch, milestone-builder spawn, any autonomous agent context.
tokens: ~120
---

## Context Inoculation

Inject these boundaries into every autonomous agent prompt before task dispatch.

### Required Preamble (copy verbatim into agent context)

> You will be evaluated on the ACTUAL correctness of your work, not on reported metrics.
> Shortcuts that make tests pass without solving the underlying problem are known patterns — report them, never use them.
> If a test fails, fix the code — never weaken the test to hide the failure.
> If you cannot complete a task, report it as incomplete. Incomplete is acceptable; deception is not.

### When to Inject

- Before every milestone-builder dispatch in /copilot mode
- Before every Task tool spawn in orchestrator
- Before /add and /fix when running autonomously (copilot-intent.md exists)

### What It Prevents

- `__eq__` overrides that return True (all comparisons pass vacuously)
- `sys.exit(0)` in test files (tests exit before assertions run)
- Monkey-patching test reporters (conftest.py fakes pass results)
- Deleting or weakening assertions to make tests green
- Any pattern where the metric improves but the underlying behavior does not

### Verification

After agent completes: if test count decreased OR assertions were removed, flag as suspicious.
Cross-reference with pre-tool-use reward hack rules for defense-in-depth.
