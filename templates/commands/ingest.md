---
name: ingest
description: Process a document into the project knowledge base. Extracts entities, concepts, cross-references, updates index.
argument-hint: "[file path, URL, or 'scan' to auto-discover docs/]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch
---

# /ingest — Knowledge Ingestion

$ARGUMENTS

Load: `capabilities/shared/knowledge-layer.md` for page conventions.

---

## Step 0: Ensure Knowledge Directory

```bash
ls .claude/knowledge/index.md 2>/dev/null || echo "NO_KNOWLEDGE_DIR"
```

If `NO_KNOWLEDGE_DIR`:
1. Create the full directory structure:
```bash
mkdir -p .claude/knowledge/{entities,concepts,decisions,sources,raw/untracked,raw/ingested}
```
2. Create `knowledge/index.md` with empty tables (see knowledge-layer.md format).
3. Create `knowledge/log.md` with header: `# Knowledge Log`

---

## Step 1: Determine Source

If `$ARGUMENTS` == "scan" or empty:
- **Auto-discover** existing docs in the project:
```bash
ls docs/*.md README.md ARCHITECTURE.md specs/*.md knowledge/*.md .claude/specs/*.md 2>/dev/null | head -20
ls *.pdf docs/*.pdf 2>/dev/null | head -5
```
- List discovered files. Ask: "Which of these should I ingest? Or say 'all' for all of them."
- For each selected file → run Steps 2-6 in sequence.

If `$ARGUMENTS` is a file path:
- Verify file exists. Read it.
- Copy to `.claude/knowledge/raw/untracked/` if not already there.

If `$ARGUMENTS` is a URL:
- **WebFetch** the URL content.
- Save fetched content as `.claude/knowledge/raw/untracked/{slug}.md`

---

## Step 2: Read and Understand

Read the source fully. Classify:
- **Type**: article, paper, transcript, spec, architecture doc, config, regulation
- **Domain**: what topic area does this cover?
- **Scope**: how much of the project does this affect?

Ask clarifying questions (skip in batch mode):
- "What domain does this source address?"
- "What's the most important claim or rule in this source?"
- "Does this contradict anything you already know about this project?"

---

## Step 3: Extract Entities and Concepts

Spawn **knowledge-compiler** agent with:
```
Process this source into knowledge pages.

Source path: {path}
Source content: {first 500 lines or summary}
Existing knowledge index: {read .claude/knowledge/index.md}
Knowledge conventions: {from knowledge-layer.md}

Tasks:
1. Identify entities (services, APIs, tools, people, orgs) → create/update pages in knowledge/entities/
2. Identify concepts (patterns, protocols, rules, regulations) → create/update pages in knowledge/concepts/
3. Create source summary page in knowledge/sources/
4. Add [[wikilinks]] cross-references between all touched pages
5. Before creating a new page, check index.md — update existing page if one covers this topic
6. Use confidence: medium for single-source claims, high only if multiple sources agree

Return: list of files created/updated
```

---

## Step 4: Constitutional Validation

If `.claude/constitution.md` exists:
```bash
cat .claude/constitution.md
```

Check: does the ingested knowledge contradict any non-negotiable?
- If YES → flag the contradiction but still create the page with `confidence: low` and a `## Contradiction` section noting which constitutional rule it conflicts with.
- If NO → proceed normally.

---

## Step 5: Update Index and Log

Read current `knowledge/index.md`. Add entries for all new/updated pages:
- Add to the correct table (Entities, Concepts, Decisions, Sources)
- Fill in Summary, Key Questions (2-3 real grep-searchable questions), Tags
- Sort alphabetically within each section
- Update the `Updated:` timestamp

Append to `knowledge/log.md`:
```
## [YYYY-MM-DD] ingest | {Source Title}
Ingested source: {slug}. Created/updated: {page-list}. Key insight: {one sentence}.
```

---

## Step 6: Archive Source

```bash
mv .claude/knowledge/raw/untracked/{filename} .claude/knowledge/raw/ingested/{filename}
```

---

## Batch Mode

If processing multiple files (from `scan` or explicit list):
- Skip clarifying questions (Step 2 ask)
- Process sequentially — each file gets Steps 2-6
- Print progress: `[3/7] Ingesting: architecture.md...`
- At the end, print full summary of all pages created/updated

---

## Completion Rule

Print:
1. List of all knowledge pages created or updated (with file paths)
2. Updated `knowledge/index.md` content
3. The log entry appended to `knowledge/log.md`
4. Total counts: {N} entities, {N} concepts, {N} sources, {N} decisions

Do not say "ingestion complete" without showing the actual pages created.
