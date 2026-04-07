---
name: canvas
description: Generate .claude/agent-pipeline.canvas — Obsidian Canvas showing the agent topology and plan milestones.
argument-hint: "[refresh to regenerate]"
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /canvas — Agent Pipeline Canvas Generator

$ARGUMENTS

Generates `.claude/agent-pipeline.canvas` — an Obsidian Canvas JSON file showing the fixed AZCLAUDE agent topology. If `.claude/plan.md` exists, milestone nodes are added below the topology. Obsidian auto-refreshes when the file changes on disk, giving live updates during `/copilot` runs.

---

## Step 0: Check Installation

```bash
ls .claude/commands/ 2>/dev/null || echo "NOT_INSTALLED"
```

If output is `NOT_INSTALLED`:
```
AZCLAUDE not installed in this project. Run setup first.
```
Stop here.

---

## Step 1: Extract Milestones (if plan.md exists)

```bash
[ -f .claude/plan.md ] && grep -E "^##? Milestone|^##? M[0-9]" .claude/plan.md 2>/dev/null | head -10 || echo ""
```

Collect each matching line as a milestone label. Strip the leading `## ` or `# ` prefix.
If no matches or file absent, milestone list is empty — Row 4 is omitted.

---

## Step 2: Build Canvas JSON

Construct the JSON string as follows.

### Fixed topology nodes

```
Row 1 (y=0):
  id=1  type=text  text="**orchestrator**\ncoordinates milestones"    x=400  y=0    width=220  height=80  color=4

Row 2 (y=200):
  id=2  type=text  text="**problem-architect**\nteam spec + risks"    x=0    y=200  width=220  height=80  color=5
  id=3  type=text  text="**milestone-builder**\nimplements"           x=400  y=200  width=220  height=80  color=5
  id=4  type=text  text="**code-reviewer**\nchecks output"            x=800  y=200  width=220  height=80  color=5

Row 3 (y=400):
  id=5  type=text  text="**constitution-guard**\nenforces rules"      x=0    y=400  width=220  height=80  color=3
  id=6  type=text  text="**test-writer**\ngenerates tests"            x=400  y=400  width=220  height=80  color=3
```

### Fixed topology edges

```
id=e1  fromNode=1  toNode=2  label="pre-flight"
id=e2  fromNode=1  toNode=3  label="dispatch"
id=e3  fromNode=3  toNode=4  label="review"
id=e4  fromNode=1  toNode=5  label="guard check"
id=e5  fromNode=3  toNode=6  label="test"
```

### Milestone nodes (Row 4, y=600) — only if milestones were found in Step 1

For each milestone at index `i` (0-based):
```
id=m{i}  type=text  text="{milestone label}"  x={i * 300}  y=600  width=250  height=80  color=6
```

Add one edge per milestone:
```
id=em{i}  fromNode=3  toNode=m{i}  label="builds"
```

### Assemble the full JSON

```json
{
  "nodes": [ ...fixed nodes..., ...milestone nodes (if any)... ],
  "edges": [ ...fixed edges..., ...milestone edges (if any)... ]
}
```

Use standard JSON formatting — double quotes, no trailing commas.

---

## Step 3: Write Canvas File

Write the JSON string to `.claude/agent-pipeline.canvas`.

Overwrite existing — this command is idempotent.

---

## Step 4: Print Summary

```
─── Canvas Written ─────────────────────────────
  Path:       .claude/agent-pipeline.canvas
  Nodes:      {total node count}
  Edges:      {total edge count}
  Milestones: {count, or "none — add plan.md to include milestones"}

Open in Obsidian to view the agent graph.
Obsidian auto-refreshes on file change — re-run /canvas to update during /copilot.
────────────────────────────────────────────────
```

Then print the first 20 lines of the JSON written.

---

## Completion Rule

Print the canvas file path and total node count. Show first 20 lines of the JSON written. Do not say "canvas generated" without showing the content.
