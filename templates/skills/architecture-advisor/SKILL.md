---
name: architecture-advisor
description: >
  Evidence-based architecture and pattern decisions. Use when choosing between
  architectures, frameworks, patterns, databases, rendering strategies, testing
  approaches, or deployment targets. Triggers on: architecture, which pattern,
  monolith vs microservices, SSR vs SSG vs SPA, ORM vs raw SQL, REST vs GraphQL,
  SQL vs NoSQL, TDD vs test-after, modular monolith, serverless, edge computing,
  horizontal vs vertical scaling, caching strategy, state management, when to use,
  which is better, trade-offs, decision, scale, performance, project size, small
  project, large project, enterprise, startup, MVP, production-ready, best practice.
  Also triggers when /dream or /plan needs to decide stack, /copilot faces an
  architecture milestone, or /debate needs evidence for a technical decision.
  Even if the user doesn't say "architecture", use this when the task involves
  choosing between competing approaches for a project of a specific size or domain.
---

# Architecture Advisor

Claude already knows every framework, pattern, and language. This skill doesn't teach
HOW to code — it guides WHEN to use WHICH approach based on project context and evidence.

## When This Fires

Any decision where the right answer depends on project scale, team size, domain, or
deployment target — not just technical preference.

## Step 1: Detect Project Context

Read these signals (skip what doesn't exist):
```bash
# Project scale
find . -name "*.ts" -o -name "*.py" -o -name "*.js" -o -name "*.go" -o -name "*.rs" 2>/dev/null | wc -l
# Framework signals
ls package.json pyproject.toml Cargo.toml go.mod pom.xml build.gradle 2>/dev/null
# Team signals
git shortlog -sn --no-merges 2>/dev/null | wc -l
# Age signals
git log --reverse --format="%ai" 2>/dev/null | head -1
```

Read CLAUDE.md for: Domain, Stack, Scale fields.

Classify:
- **SMALL**: < 50 files, 1-2 contributors, < 3 months old, MVP/prototype
- **MEDIUM**: 50-500 files, 3-10 contributors, 3-12 months, growing product
- **LARGE**: 500+ files, 10+ contributors, 1+ year, production system

## Step 2: Apply Decision Framework

For the detected scale, apply the matching evidence from `references/decision-matrices.md`.

**Output format:**
```
## Decision: {question}

Context: {SMALL|MEDIUM|LARGE} project, {domain}, {N} files, {N} contributors

### Recommendation: {choice}
Evidence: {why this is right for THIS context}

### When to reconsider
{thresholds that would change the answer}

### Anti-pattern warning
{what NOT to do at this scale}
```

## Step 3: Record Decision

Append to `.claude/memory/decisions.md`:
```
## {Decision} — {date}
**Context**: {scale}, {domain}
**Choice**: {what was chosen}
**Why**: {evidence-based reason}
**Reconsider when**: {threshold}
```

## Rules
- Always state the project scale before recommending
- Always cite the threshold where the recommendation changes
- Always warn against the common over-engineering mistake at this scale
- Never recommend microservices for projects under 50K lines or 10 contributors
- Never recommend "just use Redux" without checking if the project needs global state
- Never recommend TDD for throwaway prototypes — recommend test-after instead
- Recommendations must be evidence-based — "X is popular" is not evidence

## References
For complete decision matrices: `references/decision-matrices.md`
For rendering strategy guide: `references/rendering-decisions.md`
For database selection guide: `references/database-decisions.md`
