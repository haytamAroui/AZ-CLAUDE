---
name: knowledge
description: Browse, query, or check health of the project knowledge base. Status dashboard without args, search with a query.
argument-hint: "[query to search, 'status' for dashboard, 'health' for lint]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# /knowledge — Knowledge Base Explorer

$ARGUMENTS

Load: `capabilities/shared/knowledge-layer.md` for page conventions.

---

## Step 0: Check Knowledge Exists

```bash
ls .claude/knowledge/index.md 2>/dev/null || echo "NO_KNOWLEDGE"
```

If `NO_KNOWLEDGE`:
```
No knowledge base found. Run /ingest to create one, or /ingest scan to auto-discover docs.
```
Stop here.

---

## Mode: Status (default when no args, or $ARGUMENTS == "status")

```bash
# Page counts
find .claude/knowledge/entities -name "*.md" 2>/dev/null | wc -l
find .claude/knowledge/concepts -name "*.md" 2>/dev/null | wc -l
find .claude/knowledge/decisions -name "*.md" 2>/dev/null | wc -l
find .claude/knowledge/sources -name "*.md" 2>/dev/null | wc -l

# Pending ingestion
find .claude/knowledge/raw/untracked -type f 2>/dev/null | wc -l

# Recent activity
tail -10 .claude/knowledge/log.md 2>/dev/null
```

Print dashboard:
```
─── Knowledge Base Status ──────────────────────
  Entities:   {N}
  Concepts:   {N}
  Decisions:  {N}
  Sources:    {N}
  ────────────
  Total:      {N} pages

  Pending ingest: {N} files in raw/untracked/
  Last activity:  {date from log.md}
───────────────────────────────────────────────
```

If pending > 0: suggest `/ingest` to process them.

---

## Mode: Query ($ARGUMENTS is a question or search term)

1. Read `knowledge/index.md` — scan Key Questions column for matches.
2. Grep knowledge pages for the query term:
```bash
grep -ril "$QUERY" .claude/knowledge/entities/ .claude/knowledge/concepts/ .claude/knowledge/decisions/ .claude/knowledge/sources/ 2>/dev/null | head -10
```
3. Read matching pages. Synthesize an answer with `[[wikilink]]` citations.
4. After answering, offer:
   - "This answer covers a reusable concept. File to knowledge/concepts/{slug}.md?"
   - Only offer if the answer synthesizes multiple pages or produces new insight.
   - If user says yes → create the page, update index and log.

Append to `knowledge/log.md`:
```
## [YYYY-MM-DD] query | {Question}
Answer draws from: {page-list}. Result: {filed to knowledge | reported only}.
```

---

## Mode: Health ($ARGUMENTS == "health" or "lint")

Run structural checks (zero LLM tokens):

```bash
# 1. Pages without frontmatter
for f in $(find .claude/knowledge/{entities,concepts,decisions,sources} -name "*.md" 2>/dev/null); do
  head -1 "$f" | grep -q "^---" || echo "MISSING_FRONTMATTER: $f"
done

# 2. Orphan pages (not in index)
for f in $(find .claude/knowledge/{entities,concepts,decisions,sources} -name "*.md" 2>/dev/null); do
  PAGE=$(basename "$f" .md)
  grep -q "$PAGE" .claude/knowledge/index.md 2>/dev/null || echo "NOT_IN_INDEX: $f"
done

# 3. Dangling wikilinks
grep -roh '\[\[[a-z0-9-]*\]\]' .claude/knowledge/ 2>/dev/null | sort -u | while read link; do
  PAGE=$(echo "$link" | tr -d '[]')
  find .claude/knowledge/ -name "${PAGE}.md" 2>/dev/null | grep -q . || echo "DANGLING_LINK: $link"
done

# 4. Stale sources (in raw/untracked > 7 days)
find .claude/knowledge/raw/untracked -type f -mtime +7 2>/dev/null
```

Then run content checks (LLM-powered):
5. **Contradictions**: Scan pages for conflicting claims.
6. **Stale code_refs**: Check if referenced code files changed since page was last updated.
7. **Confidence decay**: Pages with `confidence: medium` older than 30 days with no updates → suggest downgrade.
8. **Missing pages**: Concepts mentioned in prose but lacking their own page.

Print report:
```
─── Knowledge Health Report ────────────────────
  Structural:
    Missing frontmatter: {N}
    Not in index:        {N}
    Dangling wikilinks:  {N}
    Stale raw sources:   {N}

  Content:
    Contradictions:      {N}
    Stale code_refs:     {N}
    Confidence decay:    {N}
    Missing pages:       {N}

  Score: {0-100}
───────────────────────────────────────────────
```

Score formula: `100 - (missing_frontmatter * 5) - (not_in_index * 3) - (dangling * 3) - (contradictions * 10) - (stale_refs * 5) - (decay * 2)` clamped to 0-100.

---

## Completion Rule

Show the actual output. Do not say "knowledge base is healthy" without showing the report.
