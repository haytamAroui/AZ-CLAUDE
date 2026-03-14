---
name: tdd
description: >
  TDD Iron Law. Enforces test-first development for any code task.
  Triggers on: write code, implement, add feature, fix bug, refactor.
tokens: ~50
---

## The Iron Law
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

1. Write the failing test
2. Run it — confirm it fails for the right reason
3. Write the minimal code to make it pass
4. Run again — confirm it passes
5. Refactor only after green

Code written before a test must be deleted and rewritten test-first.
No exceptions. No "I'll add tests after."

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
If domain ≠ developer: skip this file entirely. Do not enforce test-first for prose, documents, or research tasks.
