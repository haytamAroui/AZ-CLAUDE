---
name: snapshot
description: Mid-session snapshot — captures current reasoning, decisions, and state to survive context compaction. Run every 15-20 turns on complex work. Auto-injected on next session start.
argument-hint: "[optional: topic label]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit
---

# /snapshot — Mid-Session Snapshot

**Purpose**: Write your current mental model to disk NOW, before context compaction loses it.
This is different from `/persist` (end-of-session). Checkpoint = mid-flight snapshot.

---

## Step 1: Read Current State

Read `.claude/memory/goals.md` — scan the "In progress" entries and "Current threads."

**Step 1b: Detect Active Parallel Wave**

```bash
cat .claude/parallel-wave-state.md 2>/dev/null
```

If the file exists → a parallel wave is active. Read it and include wave status in the checkpoint (Step 2).

---

## Step 2: Write Checkpoint File

Write `.claude/memory/checkpoints/{YYYY-MM-DD}-{HH:MM}.md`:

```markdown
---
date: {ISO datetime}
label: {$ARGUMENTS or "mid-session"}
files_in_progress: [{list from goals.md ## In progress}]
---

## What I'm doing right now
{1-2 sentences: the specific task in flight, not the project description}

## Why — key decisions made this session
{Bullet list: each decision + the reason. Example:}
- Used spawnSync over exec: timeout needed, exec doesn't block
- Skipped STRUCTURE-ONLY on SKIM projects: blueprint.json already has scale field

## What I know that isn't written down yet
{Anything in working memory that hasn't been committed to a file or comment}

## What's next (top 3)
1. {next concrete action}
2.
3.

## Risk / open question
{Anything uncertain that needs resolution — or "None"}

## Active parallel wave (if any)
{Copy the full contents of .claude/parallel-wave-state.md here, or "No active wave"}
```

Create the directory if needed: `.claude/memory/checkpoints/`

---

## Step 3: Update goals.md

**3a.** Add one line to the top of `## Current threads`:
```
- [checkpoint] {HH:MM} — {label} → .claude/memory/checkpoints/{date}-{HH:MM}.md
```

**3b.** Replace the `## Next actions` block with the "What's next" list from the checkpoint:
```
## Next actions
1. {item 1 from checkpoint "What's next"}
2. {item 2}
3. {item 3}
```

This keeps goals.md current — `/snapshot` owns mid-session state, `/persist` owns end-of-session.

---

## Step 4: Confirm

Print the checkpoint file content.
Print: `Checkpoint saved. Inject on next session start: UserPromptSubmit will load the latest checkpoint automatically.`
Do NOT say "checkpoint saved" without showing the content.
