# Memory rotation upgrade

This upgrade strengthens AZCLAUDE's memory layer without changing its core philosophy.

## What is already strong

- `post-tool-use.js` rotates `## In progress` when it reaches 30 entries and keeps the newest 15.
- `stop.js` trims `## Done this session` to 20 entries and archives overflow.
- `stop.js` prunes checkpoints to the 5 newest files.
- `user-prompt.js` caps injected memory sections before they re-enter context.

## What this upgrade adds

### 1. Summary layer
Introduce `memory/summary.md` as a compact semantic index that sits between raw session logs and live working memory.

It is intentionally lightweight:
- last archive timestamp
- number of in-progress entries rotated
- number of done entries archived
- newest files still active
- most recent checkpoint label

This is not a full wiki compiler yet. It is the missing middle layer between raw rotation and long-term knowledge.

### 2. Portable runtime paths
Replace remaining hardcoded `.claude/...` paths in `user-prompt.js` with `cfg`-derived paths so memory behavior matches the installer's multi-CLI architecture.

### 3. Better first-message injection
Inject `summary.md` before raw `goals.md` sections so Claude sees a compact memory digest first, then the detailed ledger.

## Why this matters

AZCLAUDE currently rotates memory well, but it mostly archives mechanically. This upgrade gives the model a compressed bridge between:
- active working memory
- archived session logs
- future semantic wiki-style memory

## Follow-up after this PR

If this lands cleanly, the next step should be a real memory compiler that promotes repeated archived patterns into canonical knowledge pages.
