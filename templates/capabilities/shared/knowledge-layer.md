---
name: knowledge-layer
description: >
  Load when project has a knowledge/ directory, when /ingest or /knowledge runs,
  when /persist detects domain insights worth filing, when /explain produces a
  reusable answer, when /debate produces a decision, when /evolve Cycle 4 runs.
  Defines page conventions, directory structure, confidence scoring, wikilinks,
  and code_refs for bidirectional code-knowledge tracking.
tokens: ~350
---

# Knowledge Layer — Domain Knowledge That Compounds

The knowledge layer sits between raw sources and code. It persists domain
expertise across sessions so agents don't re-derive context from scratch.

## Directory Structure

```
.claude/knowledge/
  index.md              -- content catalog (grep-searchable key_questions)
  log.md                -- chronological: ingests, queries, auto-generations
  entities/             -- services, APIs, tools, people, orgs, libraries
  concepts/             -- patterns, protocols, domain rules, regulations
  decisions/            -- from /debate, /blueprint, architectural choices
  sources/              -- processed document summaries with provenance
  raw/
    untracked/          -- new documents awaiting /ingest
    ingested/           -- processed and archived (immutable)
```

## Page Format

Every knowledge page uses this frontmatter:

```yaml
---
title: Page Title
type: entity | concept | decision | source
confidence: high | medium | low
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [[[source-slug]], [[source-slug2]]]
code_refs: [src/path/file.ts:45, src/other/file.py:12]
tags: [tag1, tag2]
auto_generated_by: /ingest | /fix | /debate | /explain | /add | /persist | manual
---
```

### Field definitions

- **confidence**: `high` = multiple sources agree or verified by user. `medium` = single source or LLM synthesis. `low` = speculative, needs verification.
- **code_refs**: Source code locations this knowledge describes. When these files change, the page is flagged stale by /evolve Cycle 4.
- **auto_generated_by**: Which command created this page. `manual` if user created it directly.
- **sources**: `[[wikilinks]]` to source pages that informed this page.

## Page Types

| Type | Directory | Contains | Example |
|------|-----------|----------|---------|
| **Entity** | entities/ | Services, APIs, tools, people, orgs, libraries | `payment-gateway.md` — Stripe integration details |
| **Concept** | concepts/ | Patterns, protocols, domain rules, regulations | `kyc-verification.md` — KYC three-stage flow |
| **Decision** | decisions/ | Architectural choices with tradeoffs | `chose-postgres-over-mongo.md` — from /debate |
| **Source** | sources/ | Processed document summaries with provenance | `pci-dss-v4-summary.md` — key requirements |

## Page Structure by Type

### Entity page
- Basic facts (what it is, what it does)
- Key relationships (depends on, consumed by, owned by)
- Configuration / integration details
- code_refs to implementation files
- History section (when added, updated)

### Concept page
- Definition (1-2 sentences)
- Context (why this matters for this project)
- Rules / constraints (what must be true)
- Anti-patterns (common mistakes)
- code_refs to files that implement this concept
- Related concepts via `[[wikilinks]]`

### Decision page
- Decision statement (what was decided)
- Options considered (with tradeoffs)
- Winner and rationale
- Confidence and reversibility
- Date and participants
- code_refs to files affected by this decision

### Source page
- Summary (3-5 bullet points)
- Key claims (top 5 factual claims with citations)
- Relevance (how this connects to project)
- Open questions (what this source doesn't answer)
- Original file path in raw/ingested/

## Wikilinks

Use `[[page-name]]` for internal cross-references (Obsidian-compatible):
- Lowercase, hyphens instead of spaces: `[[kyc-verification]]`
- Bidirectional: if A mentions B, B should mention A
- Cross-type links are encouraged: entities link to concepts, decisions link to sources

## Index Format

`knowledge/index.md` is the manifest for the knowledge layer:

```markdown
# Knowledge Index
Updated: YYYY-MM-DD

## Entities
| Page | Summary | Key Questions | Tags |
|------|---------|---------------|------|
| [[payment-gateway]] | Stripe integration for recurring billing | How do we process payments? What webhook events? | payments, stripe |

## Concepts
| Page | Summary | Key Questions | Tags |
|------|---------|---------------|------|

## Decisions
| Page | Summary | Key Questions | Tags |
|------|---------|---------------|------|

## Sources
| Page | Summary | Key Questions | Tags |
|------|---------|---------------|------|
```

**key_questions**: 2-3 real questions this page answers. Agents grep these to find which page to read.

## Log Format

`knowledge/log.md` is append-only:

```markdown
## [YYYY-MM-DD] ingest | Document Title
Ingested source: [slug]. Created/updated pages: [list]. Key insight: [one sentence].

## [YYYY-MM-DD] query | Question asked
Answer draws from: [page-list]. Result: filed to wiki | reported only.

## [YYYY-MM-DD] auto | /fix generated root-cause page
Created: concepts/null-pointer-in-auth.md. code_refs: [src/auth.ts:45].
```

## Confidence Auto-Calculation

When /evolve Cycle 4 runs, recalculate confidence:

```
score = (source_count * 2) + (citation_count * 3) + (recency * 2) - (staleness * 4)
```

| Factor | Measurement | Scale |
|--------|-------------|-------|
| source_count | How many source pages back this claim | 0-10 |
| citation_count | How many other knowledge pages link to this | 0-10 |
| recency | Days since last update (0=today, 10=ancient) | 0-10 inverted |
| staleness | code_refs changed but page didn't update | 0-10 |

Thresholds: score >= 25 = high, 10-24 = medium, < 10 = low.

## Integration Rules

### For agents
- **problem-architect**: Read `knowledge/index.md` during Step 2. Add relevant knowledge pages to "Pre-Read Files" in Team Spec.
- **milestone-builder**: Receives knowledge pages via context-relay. Check code against domain rules before implementing.
- **code-reviewer**: Check code against `knowledge/concepts/` anti-patterns.
- **constitution-guard**: Validate that milestones don't contradict `knowledge/decisions/`.

### For commands
- **/setup**: Auto-discover docs/, specs/, knowledge/ and run lightweight ingest.
- **/persist**: Scan session for domain insights. Offer to file as knowledge pages.
- **/explain**: After answering, offer to file reusable explanations as knowledge pages.
- **/debate**: Auto-file decisions to knowledge/decisions/.
- **/fix**: If root cause is non-obvious, create a concept page for the failure mode.
- **/evolve**: Cycle 4 — Knowledge Health (staleness, orphans, gaps, confidence decay, contradictions).

## Raw Sources Rules

1. **Never modify `raw/`** — it is immutable evidence.
2. Only allowed operation: move from `raw/untracked/` to `raw/ingested/` after ingest.
3. Every claim in knowledge pages must trace to a source or code.
4. Synthesis is OK; speculation must be marked `confidence: low`.

## Anti-Patterns

- Creating knowledge pages with no source attribution
- Letting knowledge pages drift from code without /evolve catching it
- Duplicating knowledge that belongs in CLAUDE.md rules
- Over-generating: not every /explain answer deserves a knowledge page — only reusable ones
