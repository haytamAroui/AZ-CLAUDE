---
id: new-command-trio
trigger: "editing bin/cli.js"
action: "also update tests/test-features.sh + templates/CLAUDE.md — commands must be wired in 3 places"
confidence: 0.85
domain: workflow
scope: project
evidence_count: 20
last_observed: 2026-03-22
---

# New Command Trio — cli.js + tests + CLAUDE.md always move together

## Evidence
- bin/cli.js: 10 edits
- tests/test-features.sh: 10 edits (exact same frequency)
- Confirmed by constitution Required Pattern: "every new command wired in 3 places"
- /analyze found CLAUDE.md command list drift twice (26 listed vs 33 exist)

## Rule
When editing bin/cli.js COMMANDS arrays, immediately check:
1. templates/commands/{name}.md exists
2. tests/test-features.sh has assertions for it
3. templates/CLAUDE.md Available Commands list is current
