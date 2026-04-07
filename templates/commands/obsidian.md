---
name: obsidian
description: Generate AZCLAUDE-MAP.md — an Obsidian index note with wikilinks to all commands, agents, and skills.
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

## Step 1: Scan Installed Files

```bash
# Collect command names (strip .md extension, sort)
COMMANDS=$(ls .claude/commands/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)

# Collect agent names (strip .md extension, sort)
AGENTS=$(ls .claude/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)

# Collect skill names (parent directory names, sort)
SKILLS=$(ls .claude/skills/ 2>/dev/null | sort)
```

Count each group:
```bash
CMD_COUNT=$(echo "$COMMANDS" | grep -c . 2>/dev/null || echo 0)
AGENT_COUNT=$(echo "$AGENTS" | grep -c . 2>/dev/null || echo 0)
SKILL_COUNT=$(echo "$SKILLS" | grep -c . 2>/dev/null || echo 0)
```

---

## Step 2: Determine Output Path

- If `$ARGUMENTS` is non-empty: use it as the output path.
- Otherwise: output path is `AZCLAUDE-MAP.md`.

---

## Step 3: Generate AZCLAUDE-MAP.md

Write the file using the exact structure below. Replace `{DATE}` with today's date (YYYY-MM-DD), replace each section list with the actual names collected in Step 1.

```
# AZCLAUDE Map
> Generated: {DATE} — re-run `/obsidian` to refresh.

This is an Obsidian index note. Open this vault in Obsidian to explore the graph view.
Each wikilink connects to the matching command, agent, or skill file.

---

## Commands

{for each name in $COMMANDS}
- [[{name}]]

---

## Agents

{for each name in $AGENTS}
- [[{name}]]

---

## Skills

{for each name in $SKILLS}
- [[.claude/skills/{name}/SKILL|{name}]]
```

Skills link as `[[.claude/skills/{name}/SKILL|{name}]]` — full vault-relative path required because Obsidian cannot resolve `[[skill/SKILL]]` without the `.claude/skills/` prefix.

Write the generated content to the output path determined in Step 2. Overwrite any existing file at that path without prompting — this command is idempotent.

---

## Step 4: Print Summary

```
─── Obsidian Map Written ───────────────────────
  Output:    {output path}
  Commands:  {CMD_COUNT} nodes
  Agents:    {AGENT_COUNT} nodes
  Skills:    {SKILL_COUNT} nodes
  Total:     {CMD_COUNT + AGENT_COUNT + SKILL_COUNT} nodes
────────────────────────────────────────────────
```

Then print the full wikilink list that was written:

```
Written wikilinks:

Commands:
{one [[name]] per line}

Agents:
{one [[name]] per line}

Skills:
{one [[skill-name/SKILL]] per line}
```

---

## Completion Rule

Show the actual wikilink list written to the output file. Do not say "map generated" without showing the content.
