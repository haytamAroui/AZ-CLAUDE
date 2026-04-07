---
name: obsidian
description: Generate AZCLAUDE-MAP.md — an Obsidian index note with wikilinks to all commands, agents, skills, templates, memory, and docs.
argument-hint: "[path to output, default: AZCLAUDE-MAP.md]"
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /obsidian — Obsidian Graph Map Generator

$ARGUMENTS

Output path: `AZCLAUDE-MAP.md` at the project root (where `.claude/` lives), unless `$ARGUMENTS` specifies a different path.

---

## Step 0: Check Installation

```bash
ls .claude/commands/ 2>/dev/null || echo "NOT_INSTALLED"
```

If output is `NOT_INSTALLED`:
```
AZCLAUDE not installed in this project. Run setup first.
```
Stop here.

---

## Step 1: Scan All Files

```bash
# Installed commands, agents, skills
COMMANDS=$(ls .claude/commands/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
AGENTS=$(ls .claude/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
SKILLS=$(ls .claude/skills/ 2>/dev/null | sort)

# Template sources
TMPL_CMDS=$(ls templates/commands/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
TMPL_AGENTS=$(ls templates/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)

# Memory
MEMORY=$(ls .claude/memory/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
CHECKPOINTS=$(ls .claude/memory/checkpoints/*.md 2>/dev/null | xargs -I{} basename {} | sort)

# Root docs (exclude AZCLAUDE-MAP.md itself)
DOCS=$(ls *.md 2>/dev/null | grep -v "AZCLAUDE-MAP.md" | xargs -I{} basename {} .md | sort)
```

Count totals:
```bash
CMD_COUNT=$(echo "$COMMANDS" | grep -c .)
AGENT_COUNT=$(echo "$AGENTS" | grep -c .)
SKILL_COUNT=$(echo "$SKILLS" | grep -c .)
TMPL_CMD_COUNT=$(echo "$TMPL_CMDS" | grep -c . 2>/dev/null || echo 0)
TMPL_AGENT_COUNT=$(echo "$TMPL_AGENTS" | grep -c . 2>/dev/null || echo 0)
MEM_COUNT=$(echo "$MEMORY" | grep -c . 2>/dev/null || echo 0)
CKPT_COUNT=$(echo "$CHECKPOINTS" | grep -c . 2>/dev/null || echo 0)
DOC_COUNT=$(echo "$DOCS" | grep -c . 2>/dev/null || echo 0)
TOTAL=$((CMD_COUNT + AGENT_COUNT + SKILL_COUNT + TMPL_CMD_COUNT + TMPL_AGENT_COUNT + MEM_COUNT + CKPT_COUNT + DOC_COUNT))
```

---

## Step 2: Determine Output Path

- If `$ARGUMENTS` is non-empty: use it as the output path.
- Otherwise: output path is `AZCLAUDE-MAP.md`.

---

## Step 3: Generate AZCLAUDE-MAP.md

Write the file with these sections. Replace `{DATE}` with today's date (YYYY-MM-DD).

```
# AZCLAUDE Map
> Generated: {DATE} — re-run `/obsidian` to refresh.

This is an Obsidian index note. Open this vault in Obsidian to explore the graph view.
Each wikilink connects to the matching command, agent, skill, template, or memory file.

---

## Commands (installed)

{for each name in $COMMANDS}
- [[{name}]]

---

## Agents (installed)

{for each name in $AGENTS}
- [[{name}]]

---

## Skills (installed)

{for each name in $SKILLS}
- [[.claude/skills/{name}/SKILL|{name}]]

---

## Templates — Commands (source)

{for each name in $TMPL_CMDS}
- [[templates/commands/{name}|{name} (template)]]

---

## Templates — Agents (source)

{for each name in $TMPL_AGENTS}
- [[templates/agents/{name}|{name} (template)]]

---

## Memory

{for each name in $MEMORY}
- [[.claude/memory/{name}|{name}]]

---

## Checkpoints

{for each name in $CHECKPOINTS}
- [[.claude/memory/checkpoints/{name}|{name}]]

---

## Docs

{for each name in $DOCS}
- [[{name}]]
```

Write to the output path. Overwrite existing — idempotent.

---

## Step 4: Print Summary

```
─── Obsidian Map Written ───────────────────────
  Output:      {output path}
  Commands:    {CMD_COUNT} nodes
  Agents:      {AGENT_COUNT} nodes
  Skills:      {SKILL_COUNT} nodes
  Templates:   {TMPL_CMD_COUNT + TMPL_AGENT_COUNT} nodes
  Memory:      {MEM_COUNT} nodes
  Checkpoints: {CKPT_COUNT} nodes
  Docs:        {DOC_COUNT} nodes
  ─────────────────────────────
  Total:       {TOTAL} nodes
────────────────────────────────────────────────
```

Then print the full wikilink list written.

---

## Completion Rule

Show the actual wikilink list written to the output file. Do not say "map generated" without showing the content.
