---
name: level1-claudemd
description: >
  Build Level 1: create or improve the project CLAUDE.md.
  Triggers on: "build level 1", "set up CLAUDE.md", "configure project rules".
tokens: ~200
---

## Level 1: CLAUDE.md

CLAUDE.md is the only always-hot file. It must be lightweight (~30 lines).
Do not embed logic here. Use pointers to capability files.

---

### What Goes In CLAUDE.md
1. **Identity** — project name, domain, stack, scale (3 lines max)
2. **Rules** — 2-3 non-negotiable rules only. No lists of guidelines.
3. **Session state** — pointer to goals.md (2 lines)
4. **Task routing** — quick dispatch table + pointer to manifest.md (~10 lines)
5. **Trade-Off Hierarchies** — what wins when priorities conflict (3 lines)
6. **Available commands** — one line list

Total: ~30 lines. If it grows past 40 lines, move content to a capability file.

---

### What Does NOT Go In CLAUDE.md
- Detailed instructions (those go in capability files)
- Level builder logic (that's in level-builders/)
- Memory of past sessions (that's in goals.md, injected via hook)
- Domain knowledge (that's in knowledge-index.md)

---

### Fill the Template
Replace these placeholders in templates/CLAUDE.md:
- `{{PROJECT_NAME}}` — actual project name
- `{{PROJECT_DESCRIPTION}}` — 1-2 sentence description
- `{{DOMAIN}}` — detected domain (developer/writer/researcher/compliance)
- `{{STACK}}` — detected stack
- `{{SCALE}}` — STANDARD/SKIM/MINIMAL/STRUCTURE-ONLY
- `{{TDD_RULE}}` — insert TDD Iron Law if developer domain, else remove line
- `{{PRIORITY_1/2/3}}` — trade-off hierarchy from domain signals

---

### Trade-Off Hierarchies — Pre-fill from Domain Signals
- Developer project → correctness > speed > elegance
- Compliance project → regulatory conformity > completeness > efficiency
- Writer project → clarity > structure > length
- Research project → evidence quality > comprehensiveness > recency
