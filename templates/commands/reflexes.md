---
name: reflexes
description: >
  View, analyze, and manage learned reflexes. Shows what patterns the system has
  detected from session observations with confidence scoring.
  Triggers on: "reflexes", "what have you learned", "show learned patterns",
  "reflex status", "analyze observations", "promote reflex".
argument-hint: "[status | analyze | promote | clear]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /reflexes — Learned Behavioral Patterns

$ARGUMENTS

Load: capabilities/shared/reflexes.md

---

## Subcommand: status (default)

Show all learned reflexes with confidence scores + observation health.

```bash
# Observation health
OBS_FILE=".claude/memory/reflexes/observations.jsonl"
if [ -f "$OBS_FILE" ]; then
  OBS_COUNT=$(wc -l < "$OBS_FILE" 2>/dev/null | tr -d ' ')
  LATEST=$(tail -1 "$OBS_FILE" 2>/dev/null | grep -o '"ts":"[^"]*"' | head -1)
  echo "Observations: $OBS_COUNT total, latest: $LATEST"
  # Check capture recency (warn if > 24h since last observation)
  echo "Health: $([ "$OBS_COUNT" -gt 10 ] && echo 'good' || echo 'low — hooks may not be capturing')"
else
  echo "Observations: none — hooks not capturing yet"
fi

# Count project reflexes
ls .claude/memory/reflexes/project/*.md 2>/dev/null || echo "No project reflexes yet"

# Count global reflexes
ls .claude/memory/reflexes/global/*.md 2>/dev/null || echo "No global reflexes yet"
```

For each reflex file, read and display:
```
| ID | Trigger | Confidence | Domain | Scope | Evidence |
|----|---------|-----------|--------|-------|----------|
```

Sort by confidence (highest first).

---

## Subcommand: analyze

Analyze observations.jsonl to detect new patterns and create/update reflexes.

1. Read `.claude/memory/reflexes/observations.jsonl` (last 500 lines)
2. Detect patterns with 3+ occurrences:
   - **Tool sequences**: same chain of tools used repeatedly
   - **File co-access**: files always accessed together
   - **Error → fix pairs**: same error resolved the same way
   - **Naming patterns**: consistent naming in created files
3. For each detected pattern:
   - Check if reflex already exists → update confidence (+0.05 per new observation)
   - If new → create reflex file with initial confidence based on count
4. Write reflex files to `.claude/memory/reflexes/project/`

### Reflex File Format

```markdown
---
id: {kebab-case-name}
trigger: "{when condition}"
action: "{what to do}"
confidence: {0.3-0.95}
domain: {code-style|testing|git|debugging|workflow|file-patterns|security}
scope: {project|global}
evidence_count: {N}
last_observed: {YYYY-MM-DD}
---

# {Title}

## Evidence
- Observed {N} times across {M} sessions
- Pattern: {description}
- Last observed: {date}
```

---

## Subcommand: promote

Promote a project reflex to global scope.

```bash
# If specific ID given
# Move .claude/memory/reflexes/project/{id}.md → .claude/memory/reflexes/global/{id}.md
# Update scope field in frontmatter to "global"

# If no ID given — auto-promote all qualifying
# Criteria: confidence >= 0.8 AND domain in (security, workflow, git)
```

Show what was promoted and why.

---

## Subcommand: clear

Clear stale observations (older than 30 days) and low-confidence reflexes (< 0.3).

```bash
# Archive old observations
mv .claude/memory/reflexes/observations.jsonl .claude/memory/reflexes/observations-$(date +%Y%m%d).archive.jsonl

# Remove reflexes with confidence < 0.3
# List what would be removed, then confirm
```

---

## Copilot Mode

When running inside `/copilot`:
- Skip user confirmation for promote and clear
- Auto-run `analyze` every 3 milestones (alongside /evolve)
- Feed strong reflexes (confidence >= 0.7) into /add behavior

---

## Completion Rule

Show:
1. Reflex table (ID, trigger, confidence, domain, scope)
2. Observation count
3. Any new reflexes created or updated

Do not say "reflexes analyzed" without showing the table.
