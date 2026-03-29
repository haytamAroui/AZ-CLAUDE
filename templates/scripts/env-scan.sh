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
  "toolchain": {
    "node":   { "installed": $(command -v node   >/dev/null 2>&1 && echo true || echo false), "version": "$(node --version 2>/dev/null || echo null)" },
    "cargo":  { "installed": $(command -v cargo  >/dev/null 2>&1 && echo true || echo false), "version": "$(cargo --version 2>/dev/null | head -1 || echo null)" },
    "python": { "installed": $(command -v python3 >/dev/null 2>&1 && echo true || echo false), "version": "$(python3 --version 2>/dev/null || echo null)" },
    "go":     { "installed": $(command -v go     >/dev/null 2>&1 && echo true || echo false), "version": "$(go version 2>/dev/null || echo null)" },
    "dotnet": { "installed": $(command -v dotnet >/dev/null 2>&1 && echo true || echo false), "version": "$(dotnet --version 2>/dev/null || echo null)" },
    "ruby":   { "installed": $(command -v ruby   >/dev/null 2>&1 && echo true || echo false), "version": "$(ruby --version 2>/dev/null || echo null)" }
  },
  "deps": {
    "node_modules": $(has_dir node_modules),
    "target":       $(has_dir target),
    "venv":         $([ -d venv ] || [ -d .venv ] && echo true || echo false),
    "vendor":       $(has_dir vendor)
  },
  "verify_cmd": "$(
    V=""
    if [ -f Cargo.toml ]; then
      command -v cargo >/dev/null 2>&1 && V="cargo check" || V="# cargo missing"
    fi
    if [ -f package.json ]; then
      if command -v npx >/dev/null 2>&1; then
        grep -q '"typescript"' package.json 2>/dev/null && V="${V:+$V && }npx tsc --noEmit" || V="${V:+$V && }npx eslint src/ || true"
      else
        V="${V:+$V && }# node missing"
      fi
    fi
    if [ -f pyproject.toml ] || [ -f requirements.txt ]; then
      command -v python3 >/dev/null 2>&1 && V="${V:+$V && }python3 -m py_compile" || V="${V:+$V && }# python missing"
    fi
    if [ -f go.mod ]; then
      command -v go >/dev/null 2>&1 && V="${V:+$V && }go vet ./..." || V="${V:+$V && }# go missing"
    fi
    echo "${V:-echo no-stack-detected}"
  )",
  "git_log": "$(git log --oneline -5 2>/dev/null | head -5 | tr '\n' '|' | sed 's/"/\\"/g' || echo 'none')",
  "readme_head": "$(head -10 README.md 2>/dev/null | tr '\n' '|' | sed 's/"/\\"/g' || echo 'none')"
}
EOF
