---
id: release-trio
trigger: "editing DOCS.md or README.md"
action: "also edit package.json (version bump) + run tests/test-features.sh before committing"
confidence: 0.90
domain: workflow
scope: project
evidence_count: 53
last_observed: 2026-03-26
---

# Release Trio — DOCS + README + package.json always move together

## Evidence
- DOCS.md: 24 edits (most edited file)
- README.md: 15 edits (2nd most)
- package.json: 7 edits
- Observed across every release session (v0.4.12–v0.5.7)
- Pattern: doc update → version bump → tests → publish

## Rule
When touching DOCS.md or README.md, always check if package.json version needs bumping.
Run `bash tests/test-features.sh` before committing either.
