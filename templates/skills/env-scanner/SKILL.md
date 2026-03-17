---
name: env-scanner
description: >
  Scans and reports project environment. Use when setting up a new project,
  diagnosing build issues, checking what tools are available, when the user
  asks "what stack is this", "what's in this project", "what framework",
  "show me the tech stack", "what language is this", or any variation of
  environment discovery. Also use when entering a project for the first time,
  when /setup runs, when debugging dependency issues, or when you need to
  understand the project structure before making changes.
---

# Environment Scanner

## How

Run the env scanner script for structured JSON output:

```bash
bash .claude/scripts/env-scan.sh
```

This produces ~200 tokens of JSON covering:
- Git status, branch, recent commits
- Package managers detected (npm, pip, cargo, go, etc.)
- Framework detection
- README summary
- File count and structure

## Why this exists

Without this skill, environment scanning takes 10-15 tool calls (ls, cat package.json, git log, etc.).
The script does it in one call, one output, ~200 tokens.

## Fallback

If `.claude/scripts/env-scan.sh` doesn't exist, scan manually:
1. `ls` the project root
2. Check for package.json, pyproject.toml, Cargo.toml, go.mod
3. `git log --oneline -5`
4. Read README.md first 20 lines
