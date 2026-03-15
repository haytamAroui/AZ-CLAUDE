---
name: vocabulary-transform
description: >
  Load when the project domain is compliance, legal, medical, finance, or creative
  and you are about to write an agent, skill, or command. Load when you catch
  yourself writing "tasks" for a compliance project or "bugs" for a clinical project.
  Load when domain vocabulary should flow into generated files but isn't.
tokens: ~80
---

## Vocabulary Transformation

Do NOT use generic system terms. Use the vocabulary of THIS project's domain.

| Domain | Notes become | Decisions become | Reviews become | Patterns become |
|--------|-------------|-----------------|----------------|-----------------|
| Research | claims, evidence | methodology choices | peer review | findings |
| Product | requirements, specs | product decisions | design review | solutions |
| API/Backend | endpoints, contracts | architectural decisions | code review | conventions |
| Frontend | components, views | UX decisions | design review | UI patterns |
| Data/ML | features, experiments | model decisions | validation | learnings |
| Writing | drafts, arguments | editorial decisions | editing pass | style rules |
| Compliance | obligations, assessments | regulatory interpretations | conformity review | requirements |
| Medical | observations, findings | clinical decisions | audit | protocols |
| Finance | positions, signals | risk decisions | validation | strategies |

Apply to: agent descriptions, skill names, command names, memory content,
and all generated text. An agent that speaks the domain's language gets used.
An agent that speaks generic system language gets ignored.

---

## Domain Detection Signals

| Signal in codebase / README | Detected domain |
|----------------------------|----------------|
| `package.json`, `requirements.txt`, test files | Developer (API/Backend or Frontend) |
| No code files, `.docx`, prose content | Writing |
| `knowledge/` dir, citations, `references/` | Research |
| EU AI Act, GDPR, compliance, audit | Compliance |
| `patient`, `clinical`, `ICD`, `FHIR` | Medical |
| `portfolio`, `trading`, `P&L`, `positions` | Finance |
| ML frameworks, experiments, features | Data/ML |
| Mixed signals | Developer (fallback) |

---

## How to Apply

**At /setup** — substitute vocabulary in the generated CLAUDE.md, goals.md, and skill descriptions.

```
Wrong: "Document decisions in .claude/memory/decisions.md"
Right (Research): "Document methodology choices in .claude/memory/decisions.md"
Right (Compliance): "Document regulatory interpretations in .claude/memory/decisions.md"
```

**In skill descriptions** — replace trigger words with domain-native synonyms so skills fire correctly:

```
Wrong (generic): "Triggers on: 'add a task', 'new issue'"
Right (Medical):  "Triggers on: 'add a care task', 'new patient obligation', 'new clinical task'"
```
