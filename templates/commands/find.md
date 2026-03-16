---
name: find
description: >
  Search for reusable skills across ~/shared-skills/ and project commands.
  Triggers on: "find skill", "is there a skill for", "search commands",
  "what skills exist", "find a command for", "do we have a skill that".
argument-hint: "[what you're looking for — e.g. 'testing', 'deploy', 'review']"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash
---

# /find — Skill Discovery

$ARGUMENTS

---

## Step 1: Search Local Skills

Search project commands first — they're tailored to this project:

```bash
# List all project commands with descriptions
for f in .claude/commands/*.md; do
  name=$(basename "$f" .md)
  desc=$(grep -A1 "^description:" "$f" | tail -1 | sed 's/^ *//')
  echo "  /$name — $desc"
done
```

If $ARGUMENTS provided, filter by keyword:
```bash
grep -li "$ARGUMENTS" .claude/commands/*.md 2>/dev/null
```

---

## Step 2: Search Shared Skills

Search `~/shared-skills/` — portable skills that work across projects:

```bash
ls ~/shared-skills/*.md 2>/dev/null | while read f; do
  name=$(basename "$f" .md)
  desc=$(grep -A1 "^description:" "$f" | tail -1 | sed 's/^ *//')
  echo "  $name — $desc"
done
```

If $ARGUMENTS provided:
```bash
grep -li "$ARGUMENTS" ~/shared-skills/*.md 2>/dev/null
```

---

## Step 3: Search Capabilities

Some functionality lives in capabilities, not commands:

```bash
grep -i "$ARGUMENTS" .claude/capabilities/manifest.md 2>/dev/null
```

---

## Step 4: Present Results

Format results as a table:

```
## Skills matching "{query}"

### Project Commands (this project)
| Command | Description | File |
|---------|-------------|------|

### Shared Skills (all projects)
| Skill | Description | File |
|-------|-------------|------|

### Capabilities
| Capability | When to load | Tokens |
|------------|-------------|--------|
```

If no results found:
```
No skills found matching "{query}".

Options:
1. Run /create {query} — build a new command for this
2. Check ~/shared-skills/ — portable skills from other projects
3. Ask: "I need a skill that does X" — and I'll help you build one
```

---

## Completion Rule
Show the results table. Do not say "search complete" without showing matches.
