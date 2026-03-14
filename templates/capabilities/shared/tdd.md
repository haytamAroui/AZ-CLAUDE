---
name: tdd
description: >
  TDD protocol — signal-based opt-in. Check project signals before enforcing test-first.
  Triggers on: write code, implement, add feature, fix bug, refactor.
tokens: ~60
---

## When TDD Is Active

TDD is opt-in, not mandatory. Check BOTH signals before enforcing test-first:

```
Signal 1 — CLAUDE.md has an explicit TDD rule:
  grep -q 'tdd\|test.first\|test-first\|failing test' CLAUDE.md

Signal 2 — test files already exist in the project:
  find . -name '*.test.*' -o -name '*.spec.*' -o -name 'test_*.py' | head -1
```

**Both signals present → TDD protocol active.**
**Either missing → suggest TDD, but do not block implementation.**

When suggesting TDD to a project without it:
> "This project has no tests yet. Want me to add them alongside this change? (y/n)"
Let the developer decide.

---

## TDD Protocol (when active)

1. Write the failing test
2. Run it — confirm it fails for the right reason
3. Write the minimal code to make it pass
4. Run again — confirm it passes
5. Refactor only after green

## Test Framework Detection

Check before writing any test:
```
package.json → Jest, Vitest, Mocha
requirements.txt / pyproject.toml → pytest, unittest
Cargo.toml → cargo test
go.mod → go test
```
Use the framework already in the project. Never introduce a new one without asking.

## Domain Scope

TDD does not apply to non-developer domains (Writer, Creative, Research, Business).
If domain ≠ developer: skip this file entirely.
