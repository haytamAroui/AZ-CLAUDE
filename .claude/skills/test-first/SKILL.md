---
name: test-first
description: >
  Guides test-driven development. Use when about to write code, implement a
  feature, fix a bug, refactor, add an endpoint, create a component, modify
  business logic, or change any production code. Also use when the user says
  "add tests", "write tests", "test this", "cover this", "is this tested",
  or any variation of testing-related work. Checks if the project uses TDD
  before enforcing test-first. Detects the test framework automatically.
  Does not apply to non-code tasks like documentation or configuration.
---

# Test-First

## Check before enforcing

TDD is opt-in. Check BOTH signals:

1. **CLAUDE.md has a TDD rule** — look for "tdd", "test first", "test-first", "failing test"
2. **Test files exist** — `*.test.*`, `*.spec.*`, `test_*.py`

Both present → TDD protocol active.
Either missing → suggest TDD, don't block.

## TDD Protocol (when active)

1. Write the failing test
2. Run it — confirm it fails for the right reason
3. Write minimal code to pass
4. Run again — confirm green
5. Refactor only after green

## Framework detection

Check the project's existing framework before writing any test:
- `package.json` → Jest, Vitest, Mocha
- `pyproject.toml` / `requirements.txt` → pytest
- `Cargo.toml` → cargo test
- `go.mod` → go test

Use what's already there. Never introduce a new framework without asking.
