---
id: plugin-sync
trigger: "editing .claude-plugin/plugin.json"
action: "also edit .claude-plugin/marketplace.json — version, description, and repo must match in both"
confidence: 0.88
domain: workflow
scope: project
evidence_count: 10
last_observed: 2026-03-22
---

# Plugin Sync — plugin.json + marketplace.json always move together

## Evidence
- plugin.json: 5 edits
- marketplace.json: 5 edits (exact same frequency)
- /analyze caught version drift (0.4.12 in marketplace, 0.4.19 in package) — twice
- /evolve caught it again after v0.4.18→v0.4.19 bump

## Rule
Never edit one plugin file without the other.
After any version bump: update both, verify repo URLs match, verify description counts match.
regression test: `bash tests/test-features.sh` covers both.
