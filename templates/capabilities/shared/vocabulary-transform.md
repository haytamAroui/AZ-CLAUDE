---
name: vocabulary-transform
description: >
  Domain vocabulary mapping. Transforms generic system language into domain-native terms.
  Load when domain is detected during /setup or when agents produce output that feels off-register.
  Triggers on: domain detection, "use proper terminology", vocabulary mismatch.
tokens: ~60
---

## Domain Vocabulary Transformation

Generic system terms feel wrong in domain-specific contexts. This table maps them.

**Rule**: After detecting domain in Step 2 of orchestrator-init, substitute every generic term
with the domain-native equivalent in CLAUDE.md, goals.md, skills, and agent instructions.

---

| Generic Term | Developer | Writer | Researcher | Compliance/Legal | Medical/Clinical | Finance/Trading |
|-------------|-----------|--------|------------|------------------|-----------------|----------------|
| notes | code comments | scene notes | field notes | annotations | clinical notes | trade notes |
| decisions | architecture choices | narrative choices | methodology choices | compliance determinations | clinical decisions | investment decisions |
| review | code review | editorial review | peer review | conformity review | clinical review | risk review |
| tasks | issues / tickets | writing tasks | research tasks | obligations | care tasks | positions |
| output | build artifact | manuscript | findings | compliance report | clinical outcome | P&L |
| goals | sprint goals | manuscript goals | research objectives | compliance targets | patient outcomes | return targets |
| problems | bugs / failures | plot holes | gaps in evidence | non-conformities | adverse events | drawdowns |
| patterns | code patterns | narrative patterns | recurring themes | regulatory patterns | clinical patterns | market patterns |
| history | git log | revision history | literature | precedent | patient history | trade history |

---

## How to Apply

**At /setup** (Step 3 of orchestrator-init): substitute vocabulary in the generated CLAUDE.md.

```
Wrong: "Document decisions in .claude/memory/decisions.md"
Right (Researcher): "Document methodology choices in .claude/memory/decisions.md"
Right (Compliance): "Document compliance determinations in .claude/memory/decisions.md"
```

**In agent instructions**: replace Layer 1 (PERSONA) and Layer 5 (DOMAIN CONTEXT) language.

**In skill descriptions**: replace trigger words with domain-native synonyms so skills fire correctly.

```
Wrong (generic): "Triggers on: 'add a task', 'new issue'"
Right (Medical):  "Triggers on: 'add a care task', 'new patient obligation', 'new clinical task'"
```

---

## Domain Detection Signals

| Signal in codebase / README | Detected domain |
|----------------------------|----------------|
| `package.json`, `requirements.txt`, test files | Developer |
| No code files, `.docx`, prose content | Writer |
| `knowledge/` dir, citations, `references/` | Researcher |
| EU AI Act, GDPR, compliance, audit | Compliance/Legal |
| `patient`, `clinical`, `ICD`, `FHIR` | Medical/Clinical |
| `portfolio`, `trading`, `P&L`, `positions` | Finance/Trading |
| Mixed signals | Developer (fallback) |
