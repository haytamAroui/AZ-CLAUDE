#!/usr/bin/env bash
set -euo pipefail
# validate-boundaries.sh — Detect overlap between commands, skills, capabilities, agents
# Run by: /evolve Cycle 3, doctor --audit, or manually
# Output: warnings for overlapping descriptions, stale manifest entries, orphaned files

ROOT="${1:-.claude}"
PASS=0
WARN=0

echo "## Boundary Validation"
echo ""

# ── 1. Manifest completeness: every capability file is listed ────────────────
echo "### Manifest completeness"
if [ -f "$ROOT/capabilities/manifest.md" ]; then
  for cap in "$ROOT"/capabilities/shared/*.md; do
    [ -f "$cap" ] || continue
    name=$(basename "$cap")
    if ! grep -q "$name" "$ROOT/capabilities/manifest.md" 2>/dev/null; then
      echo "  ⚠ $name exists but not in manifest.md"
      WARN=$((WARN + 1))
    else
      PASS=$((PASS + 1))
    fi
  done
  echo "  Checked: $((PASS + WARN)) capabilities, $WARN missing from manifest"
else
  echo "  ⚠ No manifest.md found"
  WARN=$((WARN + 1))
fi

# ── 2. Description overlap: same trigger words in multiple extensions ────────
echo ""
echo "### Description overlap detection"
OVERLAP_FOUND=0

# Extract all description fields from commands, skills, agents
TMPDIR_V=$(mktemp -d)
trap 'rm -rf "$TMPDIR_V"' EXIT

for cmd in "$ROOT"/commands/*.md; do
  [ -f "$cmd" ] || continue
  name=$(basename "$cmd" .md)
  grep -i "description\|triggers on\|use when" "$cmd" 2>/dev/null | tr '[:upper:]' '[:lower:]' > "$TMPDIR_V/cmd-$name.txt"
done

for skill_dir in "$ROOT"/skills/*/; do
  [ -f "${skill_dir}SKILL.md" ] || continue
  name=$(basename "$skill_dir")
  grep -i "description\|triggers on\|use when" "${skill_dir}SKILL.md" 2>/dev/null | tr '[:upper:]' '[:lower:]' > "$TMPDIR_V/skill-$name.txt"
done

for agent in "$ROOT"/agents/*.md; do
  [ -f "$agent" ] || continue
  name=$(basename "$agent" .md)
  grep -i "description\|triggers on\|use when" "$agent" 2>/dev/null | tr '[:upper:]' '[:lower:]' > "$TMPDIR_V/agent-$name.txt"
done

# Check for files with highly similar trigger words
for f1 in "$TMPDIR_V"/*; do
  [ -f "$f1" ] || continue
  for f2 in "$TMPDIR_V"/*; do
    [ -f "$f2" ] || continue
    [ "$f1" = "$f2" ] && continue
    # Count shared significant words (> 5 chars)
    shared=$(comm -12 \
      <(tr ' ,.:;|' '\n' < "$f1" | grep -E '^.{5,}$' | sort -u) \
      <(tr ' ,.:;|' '\n' < "$f2" | grep -E '^.{5,}$' | sort -u) \
      2>/dev/null | wc -l | tr -d ' ')
    if [ "$shared" -gt 8 ]; then
      n1=$(basename "$f1" .txt)
      n2=$(basename "$f2" .txt)
      # Only report each pair once (alphabetical order)
      if [ "$n1" \< "$n2" ]; then
        echo "  ⚠ Possible overlap: $n1 ↔ $n2 ($shared shared trigger words)"
        OVERLAP_FOUND=$((OVERLAP_FOUND + 1))
      fi
    fi
  done
done

if [ "$OVERLAP_FOUND" -eq 0 ]; then
  echo "  ✓ No significant overlaps detected"
  PASS=$((PASS + 1))
else
  WARN=$((WARN + OVERLAP_FOUND))
fi

# ── 3. Orphaned files: extensions not referenced anywhere ────────────────────
echo ""
echo "### Orphan detection"
ORPHANS=0

for agent in "$ROOT"/agents/*.md; do
  [ -f "$agent" ] || continue
  name=$(basename "$agent" .md)
  # Check if agent is referenced in any command, skill, or CLAUDE.md
  refs=$(grep -rl "$name" "$ROOT/commands/" "$ROOT/capabilities/" CLAUDE.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$refs" -eq 0 ]; then
    echo "  ⚠ Agent $name.md not referenced in any command or capability"
    ORPHANS=$((ORPHANS + 1))
  fi
done

if [ "$ORPHANS" -eq 0 ]; then
  echo "  ✓ No orphaned agents"
  PASS=$((PASS + 1))
else
  WARN=$((WARN + ORPHANS))
fi

# ── 4. Command name collision with Claude Code built-ins ─────────────────────
echo ""
echo "### Claude Code collision check"
BUILTINS="clear reset new compact config settings context copy cost desktop app diff doctor effort exit quit export fast feedback bug branch fork help hooks ide init insights keybindings login logout mcp memory model passes permissions plan plugin pr-comments release-notes review rewind checkpoint sandbox security-review skills stats status statusline stickers tasks terminal-setup theme upgrade usage vim voice"

COLLISIONS=0
for cmd in "$ROOT"/commands/*.md; do
  [ -f "$cmd" ] || continue
  name=$(basename "$cmd" .md)
  if echo "$BUILTINS" | tr ' ' '\n' | grep -qx "$name"; then
    echo "  ⚠ /$name collides with Claude Code built-in"
    COLLISIONS=$((COLLISIONS + 1))
  fi
done

if [ "$COLLISIONS" -eq 0 ]; then
  echo "  ✓ No collisions with Claude Code built-ins"
  PASS=$((PASS + 1))
else
  WARN=$((WARN + COLLISIONS))
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "### Summary: $PASS passed, $WARN warnings"
if [ "$WARN" -gt 0 ]; then
  echo "  Run /evolve to auto-fix overlaps and orphans"
fi

# ── Machine-readable output (last line, always) ─────────────────────────────
# Format: BOUNDARY_RESULT:pass=N:warn=N
# Parsed by doctor --audit instead of counting ⚠ symbols
echo ""
echo "BOUNDARY_RESULT:pass=$PASS:warn=$WARN"

# ── JSON report (structured, diffable, CI-friendly) ─────────────────────────
REPORT_DIR="$ROOT/memory/metrics"
mkdir -p "$REPORT_DIR" 2>/dev/null || true
REPORT_PATH="$REPORT_DIR/boundaries.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$REPORT_PATH" << JSONEOF
{
  "timestamp": "$TIMESTAMP",
  "pass": $PASS,
  "warn": $WARN,
  "manifest_gaps": $([ -f "$ROOT/capabilities/manifest.md" ] && {
    gaps=0
    for cap in "$ROOT"/capabilities/shared/*.md; do
      [ -f "$cap" ] || continue
      grep -q "$(basename "$cap")" "$ROOT/capabilities/manifest.md" 2>/dev/null || gaps=$((gaps + 1))
    done
    echo $gaps
  } || echo 0),
  "orphaned_agents": $(for a in "$ROOT"/agents/*.md; do
    [ -f "$a" ] || continue
    n=$(basename "$a" .md)
    grep -rl "$n" "$ROOT/commands/" "$ROOT/capabilities/" CLAUDE.md 2>/dev/null | wc -l | tr -d ' '
  done | awk '$1==0{c++}END{print c+0}'),
  "collisions": $COLLISIONS,
  "overlaps": $OVERLAP_FOUND
}
JSONEOF

echo "  Report written: $REPORT_PATH"

# Exit code: 0 if no warnings, 1 if warnings found
exit $( [ "$WARN" -eq 0 ] && echo 0 || echo 1 )
