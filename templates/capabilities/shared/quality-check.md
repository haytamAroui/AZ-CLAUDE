---
name: quality-check
description: >
  Post-setup quality verification. Runs after /setup or /level-up to verify
  generated output is correct. Triggers on: "verify setup", "check quality",
  "did setup work correctly", "validate environment".
tokens: ~80
---

## Post-Setup Quality Check

Run after `/setup` or any `/level-up`. Verifies generated files are correct, not just present.

---

### Environment Check

```bash
# Required structure
echo "=== AZCLAUDE Environment Check ==="

echo "--- Core files ---"
[ -f CLAUDE.md ] && echo "✓ CLAUDE.md" || echo "✗ CLAUDE.md MISSING"
[ -f .claude/memory/goals.md ] && echo "✓ goals.md" || echo "✗ goals.md MISSING"
[ -d .claude/capabilities ] && echo "✓ capabilities/" || echo "✗ capabilities/ MISSING"
[ -d .claude/commands ] && echo "✓ commands/" || echo "✗ commands/ MISSING"
[ -f .claude/capabilities/manifest.md ] && echo "✓ manifest.md" || echo "✗ manifest.md MISSING"

echo "--- Commands ---"
for cmd in dream setup fix add audit test blueprint evolve debate persist level-up ship pulse explain loop; do
  [ -f ".claude/commands/$cmd.md" ] && echo "✓ /$cmd" || echo "✗ /$cmd MISSING"
done

echo "--- Memory dirs ---"
[ -d .claude/memory/sessions ] && echo "✓ memory/sessions/" || echo "✗ memory/sessions/ MISSING"
[ -d ops/observations ] && echo "✓ ops/observations/" || echo "✗ ops/observations/ MISSING"
```

---

### Content Accuracy Check

After environment check passes, verify CLAUDE.md is filled (not template):

```bash
# Detect unfilled placeholders
grep -c '{{' CLAUDE.md && echo "✗ CLAUDE.md has unfilled placeholders — re-run /setup" || echo "✓ CLAUDE.md filled"

# Verify goals.md has today's date (not empty)
grep -q "$(date +%Y-%m-%d)" .claude/memory/goals.md && echo "✓ goals.md has today's date" || echo "✗ goals.md missing date"
```

---

### Command Quality Check (RECIPE vs REFERENCE)

For each command in `.claude/commands/`:

```bash
for skill in .claude/commands/*.md; do
  name=$(basename "$skill")
  # Check for pushy description (3+ trigger variants)
  triggers=$(grep -c "Triggers on:" "$skill" 2>/dev/null || echo 0)
  # Check body length
  lines=$(wc -l < "$skill")
  [ "$lines" -gt 500 ] && echo "⚠ $name: $lines lines — exceeds 500 limit"
  # Check for frontmatter
  grep -q '^---' "$skill" && echo "✓ $name: has frontmatter" || echo "✗ $name: MISSING frontmatter"
done
```

---

### Capability Reference Check

Verify all `capabilities/` references in commands and agents resolve to existing files:

```bash
echo "--- Capability references ---"
missing=0
for dir in .claude/commands .claude/agents; do
  [ -d "$dir" ] || continue
  for f in "$dir"/*.md; do
    refs=$(grep -oE 'capabilities/[^ )\]}"'"'"',]+' "$f" 2>/dev/null | sort -u)
    for ref in $refs; do
      if [ ! -f ".claude/$ref" ] && [ ! -d ".claude/$ref" ]; then
        echo "✗ Missing: $ref (in $(basename $f))"
        missing=$((missing + 1))
      fi
    done
  done
done
[ "$missing" -eq 0 ] && echo "✓ All capability references resolve" || echo "✗ $missing broken references"
```

---

### Pass Criteria

All checks must show ✓ before declaring setup complete.

```
Bad: "Setup complete!"
Good: "Environment check: 15/15 ✓. Content check: CLAUDE.md filled, goals.md dated. Skills: 15 installed, all pass RECIPE test."
```

Run this check automatically at the end of every `/setup` and `/level-up`.
