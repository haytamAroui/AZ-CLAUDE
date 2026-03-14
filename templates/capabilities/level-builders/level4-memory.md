---
name: level4-memory
description: >
  Build Level 4: memory system with goals.md, session logs, friction logs.
  Triggers on: "build level 4", "add memory", "set up session tracking".
tokens: ~200
---

## Level 4: Memory System

Memory has 6 layers in Claude Code. AZCLAUDE uses layers 1-3 natively.

| Layer | What | Always loaded? |
|-------|------|----------------|
| 1 | CLAUDE.md | ✅ Yes |
| 2 | Auto memory (.claude/memory/) | ❌ On-demand |
| 3 | Modular rules (.claude/rules/) | ❌ On-demand |
| 4 | Skill metadata (frontmatter) | ✅ Lightweight |
| 5 | Skill bodies | ❌ On-demand |
| 6 | External memory (goals.md via hook) | ✅ Via hook |

---

### Create Memory Directories
```bash
mkdir -p .claude/memory/sessions
mkdir -p .claude/memory/learnings
mkdir -p ops/observations
mkdir -p shared-skills
```

---

### Create goals.md
Write `.claude/memory/goals.md`:
```markdown
# Goals — {project_name}
Updated: {date}

## Current threads
(describe what's in progress)

## Done this session
- Initial setup complete

## Next actions
1. {first concrete action}
2. {second concrete action}
3. {third concrete action}

## Open blockers
(none)
```

---

### Memory Access Pattern (3-layer)
Never read all memory files eagerly. Use the 3-layer pattern:
1. **Search** — grep keywords, list files (no content read)
2. **Filter** — recency (last 5 sessions), relevance (keyword match)
3. **Read** — only files that passed filter

Cost: Layer 1+2 ≈ 100 tokens. Layer 3: only matched files.

---

### Level 4 Complete When
- `.claude/memory/goals.md` exists with correct structure
- `ops/observations/` directory exists for friction logs
- `shared-skills/` directory exists for portable skills
- Hook injects goals.md automatically (set up in Level 6)
