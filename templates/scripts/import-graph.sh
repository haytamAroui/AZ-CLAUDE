#!/usr/bin/env bash
set -euo pipefail
# import-graph.sh — Lightweight dependency mapper
# Purpose: Build import/dependency graph from grep, detect circular deps
# Usage: bash .claude/scripts/import-graph.sh [project-dir]
# Output: structured text showing imports per file + circular dependencies
# Zero dependencies — just grep. No ast-grep, no vector DB, no Docker.

ROOT="${1:-.}"
cd "$ROOT"

echo "## Import Graph — $(basename "$(pwd)")"
echo ""

# ── Detect language ──────────────────────────────────────────────────────────
HAS_TS=$(find . -name "*.ts" -o -name "*.tsx" -not -path "*/node_modules/*" 2>/dev/null | head -1)
HAS_PY=$(find . -name "*.py" -not -path "*/__pycache__/*" -not -path "*/venv/*" 2>/dev/null | head -1)
HAS_GO=$(find . -name "*.go" -not -path "*/vendor/*" 2>/dev/null | head -1)

# ── Extract imports ──────────────────────────────────────────────────────────
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

if [ -n "$HAS_TS" ]; then
  echo "Language: TypeScript/JavaScript"
  grep -rn "^import\|^const.*require(" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist . 2>/dev/null | \
    sed 's/:.*//' | sort | uniq -c | sort -rn | head -20 > "$TMPFILE"
fi

if [ -n "$HAS_PY" ]; then
  echo "Language: Python"
  grep -rn "^import\|^from.*import" --include="*.py" \
    --exclude-dir=__pycache__ --exclude-dir=venv --exclude-dir=.git . 2>/dev/null | \
    sed 's/:.*//' | sort | uniq -c | sort -rn | head -20 > "$TMPFILE"
fi

if [ -n "$HAS_GO" ]; then
  echo "Language: Go"
  grep -rn "^import" --include="*.go" \
    --exclude-dir=vendor --exclude-dir=.git . 2>/dev/null | \
    sed 's/:.*//' | sort | uniq -c | sort -rn | head -20 > "$TMPFILE"
fi

echo ""
echo "### Most-imported files (by import count)"
if [ -s "$TMPFILE" ]; then
  cat "$TMPFILE"
else
  echo "(no imports detected)"
fi

# ── Circular dependency detection ────────────────────────────────────────────
echo ""
echo "### Circular dependency check"

CIRCULARS=0
if [ -n "$HAS_TS" ]; then
  # Find files that import each other (A imports B AND B imports A)
  grep -roh "from ['\"]\..*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | \
    sed "s/from ['\"]//;s/['\"]//g" | sort | uniq -d | while read -r imp; do
      # Check if the target imports back
      target_file=$(find . -path "*${imp}*" -name "*.ts" -o -path "*${imp}*" -name "*.tsx" 2>/dev/null | head -1)
      if [ -n "$target_file" ]; then
        source_dir=$(dirname "$target_file")
        back_imports=$(grep -l "from.*${source_dir}" "$target_file" 2>/dev/null || true)
        if [ -n "$back_imports" ]; then
          echo "  ⚠ Possible circular: $imp ↔ $source_dir"
          CIRCULARS=$((CIRCULARS + 1))
        fi
      fi
    done
fi

if [ "$CIRCULARS" -eq 0 ]; then
  echo "  ✓ No circular dependencies detected"
fi

# ── File co-change analysis (for /evolve) ────────────────────────────────────
echo ""
echo "### Co-change clusters (files that always commit together)"
if command -v git &>/dev/null && [ -d .git ]; then
  git log --name-only --format="" --diff-filter=M -50 2>/dev/null | \
    sort | uniq -c | sort -rn | head -15 | \
    awk '{if ($1 >= 3) print "  " $1 "x — " $2}'
else
  echo "  (not a git repo — skipping)"
fi
