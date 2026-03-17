#!/usr/bin/env bash
# skill-creator/scripts/scaffold.sh
# Purpose: create the directory structure for a new skill
# Usage: bash .claude/skills/skill-creator/scripts/scaffold.sh my-skill-name
# Output: creates .claude/skills/<name>/ with SKILL.md template + subdirs

set -euo pipefail

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "## Error: skill name required"
  echo "Usage: bash .claude/skills/skill-creator/scripts/scaffold.sh my-skill-name"
  exit 1
fi

# Sanitize name: lowercase, hyphens only
NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | tr -cd 'a-z0-9-')

SKILL_DIR=".claude/skills/$NAME"

if [ -d "$SKILL_DIR" ]; then
  echo "## Skill '$NAME' already exists at $SKILL_DIR"
  echo "Edit the existing SKILL.md or delete the directory first."
  exit 1
fi

mkdir -p "$SKILL_DIR"/{scripts,references,examples}

cat > "$SKILL_DIR/SKILL.md" << 'TEMPLATE'
---
name: SKILL_NAME_PLACEHOLDER
description: >
  [WHAT it does in one sentence]. Use when [ACTION 1], [ACTION 2], [ACTION 3],
  [ACTION 4], [ACTION 5]. Triggers on: [KEYWORD 1], [KEYWORD 2], [KEYWORD 3],
  [KEYWORD 4], [KEYWORD 5], [KEYWORD 6], [KEYWORD 7], [KEYWORD 8], [KEYWORD 9],
  [KEYWORD 10], [KEYWORD 11], [KEYWORD 12]. Also applies when working with
  [CONTEXT 1], [CONTEXT 2], [CONTEXT 3]. Even if the user doesn't explicitly
  mention [DOMAIN], use this skill when the task involves [CONDITION].
---

# SKILL_NAME_PLACEHOLDER

## When This Fires
[One paragraph explaining the purpose and why this skill exists]

## Workflow
1. [First step — imperative form, e.g. "Run the detection script"]
2. [Second step]
3. [Third step]
4. [Verification step]

## Rules
- [Positive directive 1 — "Always X"]
- [Positive directive 2]
- [Positive directive 3]

## Example
[One concrete input → output showing expected behavior]

## References
For detailed [topic], read: `references/guide.md`
TEMPLATE

# Replace placeholder with actual name
sed -i "s/SKILL_NAME_PLACEHOLDER/$NAME/g" "$SKILL_DIR/SKILL.md"

echo "## Skill scaffolded: $SKILL_DIR/"
echo ""
echo "Files created:"
echo "  $SKILL_DIR/SKILL.md          ← edit frontmatter + body"
echo "  $SKILL_DIR/scripts/          ← add deterministic scripts"
echo "  $SKILL_DIR/references/       ← add deep content"
echo "  $SKILL_DIR/examples/         ← add output samples"
echo ""
echo "Next: edit SKILL.md — fill in description (30+ keywords) and workflow"
