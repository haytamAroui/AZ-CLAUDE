#!/usr/bin/env bash
# agent-creator/scripts/scaffold.sh
# Purpose: create agent definition file or analyze co-change boundaries
# Usage: bash .claude/skills/agent-creator/scripts/scaffold.sh [--analyze | agent-name]
# Output: creates .claude/agents/<name>.md with 5-layer template, or prints analysis

set -euo pipefail

ACTION="${1:-}"

if [ -z "$ACTION" ]; then
  echo "## Error: argument required"
  echo "Usage:"
  echo "  bash .claude/skills/agent-creator/scripts/scaffold.sh --analyze"
  echo "  bash .claude/skills/agent-creator/scripts/scaffold.sh my-agent-name"
  exit 1
fi

# ── Co-change analysis mode ──────────────────────────────────────────────────
if [ "$ACTION" = "--analyze" ]; then
  echo "## Co-Change Analysis"
  echo ""

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Not a git repository — use directory structure instead."
    echo ""
    echo "## Directory Structure"
    find . -maxdepth 2 -type d ! -path './.git*' ! -path './node_modules*' ! -path './.claude*' 2>/dev/null | sort
    exit 0
  fi

  commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  echo "Total commits: $commit_count"
  echo ""

  if [ "$commit_count" -lt 10 ]; then
    echo "Too few commits for co-change analysis. Use directory structure:"
    echo ""
    find . -maxdepth 2 -type d ! -path './.git*' ! -path './node_modules*' ! -path './.claude*' 2>/dev/null | sort
    exit 0
  fi

  echo "### Most frequently changed files"
  git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn | head -20
  echo ""

  echo "### Top-level directory change frequency"
  git log --name-only --format="" --diff-filter=M | sed 's|/.*||' | sort | uniq -c | sort -rn | head -15
  echo ""

  # Check for framework collision
  collision=""
  for f in pyproject.toml package.json requirements.txt; do
    if [ -f "$f" ]; then
      match=$(grep -i "langgraph\|crewai\|autogen\|langchain.*agent" "$f" 2>/dev/null || true)
      if [ -n "$match" ]; then
        collision="$collision$f: $match\n"
      fi
    fi
  done

  if [ -n "$collision" ]; then
    echo "### ⚠ Framework Collision Detected"
    echo "Project uses agent frameworks internally. Prefix Claude Code agents with cc-"
    printf "%b" "$collision"
  fi

  exit 0
fi

# ── Scaffold mode ────────────────────────────────────────────────────────────
NAME=$(echo "$ACTION" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | tr -cd 'a-z0-9-')
AGENT_DIR=".claude/agents"
AGENT_FILE="$AGENT_DIR/$NAME.md"

if [ -f "$AGENT_FILE" ]; then
  echo "## Agent '$NAME' already exists at $AGENT_FILE"
  echo "Edit the existing file or delete it first."
  exit 1
fi

mkdir -p "$AGENT_DIR"

cat > "$AGENT_FILE" << TEMPLATE
---
name: $NAME
description: >
  [WHAT this agent does]. Route to this agent for: [ACTION 1], [ACTION 2],
  [ACTION 3], [KEYWORD 1], [KEYWORD 2], [KEYWORD 3], [KEYWORD 4],
  [KEYWORD 5], [KEYWORD 6], [KEYWORD 7], [KEYWORD 8], [KEYWORD 9],
  [KEYWORD 10], [KEYWORD 11], [KEYWORD 12]. Also handles: [CONTEXT 1],
  [CONTEXT 2], [CONTEXT 3]. Even if the user doesn't mention [DOMAIN],
  route here when the task involves [CONDITION].
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
permissionMode: acceptEdits
---

## Layer 1: PERSONA
[One sentence — role, not personality]

## Layer 2: SCOPE
OWNS: [directories and files this agent is responsible for]
DOES NOT TOUCH: [explicit boundaries — what other agents own]

## Layer 3: TOOLS & RESOURCES
- Read, Write, Edit: for all files in scope
- Bash: for running tests and scripts only
- Grep, Glob: for searching codebase
RESTRICTIONS:
- [What this agent must NOT do with tools]

## Layer 4: CONSTRAINTS
- [Positive directive 1 — "Always X"]
- [Positive directive 2]
- [Positive directive 3]
- [Positive directive 4]
- [Positive directive 5]

## Layer 5: DOMAIN CONTEXT
### Architecture
[Project-specific architecture decisions]

### Conventions
[Coding conventions, patterns, framework usage]

### Self-Correction
If the first attempt fails: re-read the error, try one alternative.
After 2 attempts: stop. Present what was tried, what the error says,
what is needed to proceed.

## Before Starting Any Task
1. Read .claude/memory/patterns.md for project conventions
2. Read .claude/memory/antipatterns.md for known mistakes
3. Check if a relevant skill matches this task type
TEMPLATE

echo "## Agent scaffolded: $AGENT_FILE"
echo ""
echo "Next steps:"
echo "  1. Fill in the description (30+ trigger keywords)"
echo "  2. Define scope — OWNS and DOES NOT TOUCH"
echo "  3. Add domain knowledge in Layer 5 (the most important layer)"
echo "  4. Validate against quality checklist"
