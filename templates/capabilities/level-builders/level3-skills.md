---
name: level3-skills
description: >
  Build Level 3: create project-specific skills and commands.
  Triggers on: "build level 3", "add skill", "create command", "automate workflow".
tokens: ~250
requires: level2-mcp
---

## Level 3: Skills and Commands

Skills are invoked by the user (/command). Each skill is a self-contained instruction set.
Skills are Layer 2 in the progressive disclosure model — loaded only when invoked.

---

### Anatomy of a Skill File

Every skill file requires:
```yaml
---
name: {skill-name}
description: >
  What this skill does. Trigger words that activate it.
  Be specific — this description is read at Layer 1 (metadata only).
tokens: ~{estimate}
---

## /skill-name — Title

[body — ≤ 150 lines]
```

The description is the only thing read at session start. The body loads only when triggered.

---

### What Makes a Good Skill

1. **Single responsibility** — one skill does one thing
2. **Self-contained** — reads what it needs explicitly, doesn't assume other files are loaded
3. **Thin router or direct executor**:
   - Thin router: "load capabilities/X.md and run it" (evolve.md, debate.md)
   - Direct executor: contains the full instruction (fix.md, persist.md)
4. **Completion Rule enforced** — every skill ends with a concrete output requirement

---

### Check shared-skills First
Before creating a new skill:
```bash
ls ~/shared-skills/ 2>/dev/null
```

If a matching skill exists and its tech stack matches this project → import it:
```bash
cp ~/shared-skills/{skill}.md .claude/commands/{skill}.md
```
Log which portable skills were imported and from which project.

---

### Skill Placement
- `.claude/commands/{skill}.md` — project-specific skills
- `~/shared-skills/{skill}.md` — general skills that work across projects (after k=10 gate)

---

### Level 3 Complete When
- At least 3 project-specific skills exist
- Each has frontmatter
- Each passes self-applicability check
- shared-skills checked and relevant ones imported
