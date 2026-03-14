#!/bin/bash
# AZCLAUDE Environment Scanner
# Runs as a single script — output (JSON) is what enters Claude's context.
# Not 15 separate tool calls. One script, one result, ~200 tokens.

FILE_COUNT=$(find . \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -not -path './.claude/*' \
  \( -name '*.md' -o -name '*.json' -o -name '*.js' -o -name '*.ts' \
     -o -name '*.py' -o -name '*.rs' -o -name '*.go' \) \
  2>/dev/null | wc -l | tr -d ' ')

has_file() { [ -f "$1" ] && echo true || echo false; }
has_dir()  { [ -d "$1" ] && echo true || echo false; }
count_files() { ls "$1"/*.md 2>/dev/null | wc -l | tr -d ' ' || echo 0; }

cat <<EOF
{
  "file_count": $FILE_COUNT,
  "scale": $(
    if   [ "$FILE_COUNT" -lt 100  ]; then echo '"STANDARD"'
    elif [ "$FILE_COUNT" -lt 500  ]; then echo '"SKIM"'
    elif [ "$FILE_COUNT" -lt 2000 ]; then echo '"MINIMAL"'
    else echo '"STRUCTURE-ONLY"'
    fi
  ),
  "signals": {
    "has_package_json":    $(has_file package.json),
    "has_requirements":    $(has_file requirements.txt),
    "has_cargo":           $(has_file Cargo.toml),
    "has_gomod":           $(has_file go.mod),
    "has_pyproject":       $(has_file pyproject.toml),
    "has_knowledge_dir":   $(has_dir knowledge),
    "has_claude_md":       $(has_file CLAUDE.md),
    "claude_md_count":     $(find . -name 'CLAUDE.md' 2>/dev/null | wc -l | tr -d ' '),
    "has_git":             $(has_dir .git),
    "has_mcp":             $(has_file .mcp.json),
    "has_memory":          $(has_file .claude/memory/goals.md),
    "commands_count":      $(count_files .claude/commands 2>/dev/null),
    "agents_count":        $(count_files .claude/agents 2>/dev/null)
  },
  "git_log": "$(git log --oneline -5 2>/dev/null | head -5 | tr '\n' '|' || echo 'none')",
  "readme_head": "$(head -10 README.md 2>/dev/null | tr '\n' '|' || echo 'none')"
}
EOF
