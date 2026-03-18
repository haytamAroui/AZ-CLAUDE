---
name: domain-advisor-generator
description: >
  Load when /dream or /setup detects a non-developer domain (compliance, marketing,
  finance, medical, research, writing, legal, HR, logistics). Generates a domain-specific
  advisor skill with decision matrices, best practices, and anti-patterns — the same way
  architecture-advisor guides tech decisions. Load when the project needs domain expertise
  that goes beyond code patterns into business/regulatory/strategic decision-making.
tokens: ~400
---

# Domain Advisor Generator

Creates domain-specific advisor skills automatically from project context.
Claude knows every domain — this capability structures WHEN to apply WHICH
knowledge based on project scale and context.

## When to Generate

During `/dream` or `/setup`, after domain detection:
1. Detect domain from CLAUDE.md, README, or copilot-intent.md
2. If domain is NOT pure developer → generate a domain advisor skill
3. Install in `.claude/skills/{domain}-advisor/`

## Generation Template

Every domain advisor follows the same structure as `architecture-advisor/`:

```
{domain}-advisor/
├── SKILL.md                    ← pushy description, workflow, rules
├── scripts/detect-context.sh   ← detect project-specific context
└── references/
    ├── decision-matrices.md    ← domain-specific decisions with thresholds
    └── {domain}-patterns.md    ← best practices and anti-patterns
```

## Domain-Specific Decision Matrices

Generate matrices for each domain using this template. Every matrix entry must have:
1. **Context** — when this applies (scale, phase, audience)
2. **Recommendation** — what to do
3. **Evidence** — why (regulation, research, industry standard)
4. **Threshold** — when the recommendation changes
5. **Anti-pattern** — common mistake at this context

---

### COMPLIANCE Domain

Generate `compliance-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Regulation mapping** | Which regulations apply? EU AI Act, GDPR, SOC2, HIPAA? Based on geography, data type, industry. |
| **Evidence strategy** | Article-level traceability vs summary compliance? Based on audit risk and org size. |
| **Assessment approach** | Self-assessment vs third-party audit? Based on regulation tier and company size. |
| **Documentation depth** | Minimal vs comprehensive? Based on regulatory tier (high-risk = comprehensive). |
| **Data handling** | Consent-first vs legitimate-interest? Based on data type and jurisdiction. |
| **Incident response** | 72-hour notification (GDPR) vs jurisdiction-specific? Based on applicable regulation. |

**Anti-patterns:**
- Checkbox compliance without evidence trail
- Single regulation focus when multiple apply
- Treating compliance as a one-time project vs ongoing obligation

---

### MARKETING Domain

Generate `marketing-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Channel strategy** | Which channels for which stage? Based on budget, audience, product type. |
| **Content type** | Blog/video/social/email? Based on audience behavior and resources. |
| **Funnel design** | Simple (landing → CTA) vs complex (nurture sequence)? Based on product price point. |
| **Pricing model** | Freemium vs trial vs paid-only? Based on market, CAC, and LTV targets. |
| **Metric focus** | Which KPIs matter at which stage? Pre-PMF: activation rate. Post-PMF: retention. |
| **SEO vs paid** | Organic-first vs paid-first? Based on keyword difficulty and budget. |

**Thresholds:**
- < $1K MRR: focus on product, not marketing
- $1K-$10K MRR: organic + community, no paid ads
- $10K-$100K MRR: add paid acquisition, A/B testing
- $100K+ MRR: full-stack marketing, attribution modeling

**Anti-patterns:**
- Paid ads before product-market fit
- Vanity metrics (followers) over conversion metrics (activation rate)
- Building email list without a nurture sequence

---

### FINANCE Domain

Generate `finance-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Data model** | Event-sourced (audit trail) vs CRUD? Finance always needs event sourcing for audit. |
| **Calculation precision** | Float vs decimal vs integer-cents? Always integer-cents for money. Never float. |
| **Reconciliation** | Real-time vs batch? Based on transaction volume and regulatory requirements. |
| **Reporting** | GAAP/IFRS format? Based on jurisdiction and company type. |
| **Risk model** | Simple limits vs VaR vs Monte Carlo? Based on asset class and portfolio size. |

**Anti-patterns:**
- Using floating-point for monetary calculations
- Missing audit trail on financial mutations
- Storing PII and financial data in the same table

---

### MEDICAL / HEALTHCARE Domain

Generate `medical-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Data standard** | FHIR vs HL7v2 vs custom? FHIR for new systems, HL7v2 for legacy integration. |
| **Privacy model** | HIPAA (US) vs GDPR (EU) vs both? Based on patient geography. |
| **Clinical workflow** | Order entry → verification → administration → documentation? Follow established clinical workflows. |
| **Terminology** | ICD-10, SNOMED CT, LOINC, RxNorm? Based on use case (diagnosis, procedures, labs, medications). |
| **Audit requirements** | Access logging granularity? Every PHI access must be logged with who/when/why. |

**Anti-patterns:**
- Storing PHI without encryption at rest and in transit
- Missing break-the-glass audit for emergency access
- Building custom terminology when standards exist

---

### RESEARCH Domain

Generate `research-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Literature scope** | Systematic review vs targeted search? Based on research question specificity. |
| **Methodology** | Quantitative vs qualitative vs mixed? Based on research question and data availability. |
| **Citation management** | Which database? arXiv + Semantic Scholar for CS. PubMed for medical. |
| **Experiment design** | Ablation study, A/B comparison, benchmark? Based on claim type. |
| **Statistical rigor** | p-values, confidence intervals, effect size? Always report all three. |

**Anti-patterns:**
- Cherry-picking results that confirm hypothesis
- Fabricating citations (AutoResearchClaw's citation-killer addresses this)
- p-hacking (running experiments until p < 0.05)

---

### LEGAL Domain

Generate `legal-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Contract structure** | Template-based vs custom? Based on deal complexity and value. |
| **Clause tracking** | Which clauses need version history? IP, liability, termination, data handling. |
| **Jurisdiction** | Which law governs? Based on party locations and choice-of-law clause. |
| **Risk classification** | Standard vs elevated vs critical? Based on deal value and obligation scope. |

---

### LOGISTICS Domain

Generate `logistics-advisor/` with these decision areas:

| Decision area | Key questions |
|--------------|---------------|
| **Routing** | Static routes vs dynamic optimization? Based on fleet size and delivery density. |
| **Inventory model** | JIT vs safety stock? Based on supply chain reliability and demand variability. |
| **Tracking granularity** | Package-level vs shipment-level? Based on value per unit and customer expectations. |

---

## Generation Workflow

When `/dream` or `/setup` detects a domain:

1. Read the domain section from this file
2. Create `{domain}-advisor/SKILL.md` with:
   - Pushy description (30+ trigger keywords from domain vocabulary)
   - Workflow: detect context → look up decision matrix → recommend → record
   - Rules specific to the domain
3. Create `{domain}-advisor/references/decision-matrices.md` with:
   - All decision areas for this domain
   - Thresholds for when recommendations change
   - Anti-patterns common in this domain
4. Create `{domain}-advisor/scripts/detect-context.sh` with:
   - Domain-specific detection (regulations, data types, standards)
5. Run `skill-creator` quality checklist on the generated skill

## Multi-Domain Projects

Some projects span multiple domains (e.g., compliance SaaS = developer + compliance + legal).
Generate one advisor per domain. They don't conflict — each guides different decision types.

## Integration with /copilot

In copilot mode, domain advisor skills fire automatically when:
- `/blueprint` creates milestones that touch domain-specific decisions
- `/add` implements a feature that involves domain logic
- `/debate` evaluates trade-offs in the domain space
- `/evolve` detects domain patterns from git history
