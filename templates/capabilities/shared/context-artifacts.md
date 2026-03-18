---
name: context-artifacts
description: >
  Load when the project has non-code knowledge (DB schemas, API specs, infra configs,
  architecture docs) that should inform implementation. Load when /add or /copilot
  needs to understand database structure, API contracts, or deployment config before
  writing code. Load when knowledge/ directory exists. Load when the project has
  OpenAPI specs, SQL schemas, Terraform files, or Kubernetes manifests.
tokens: ~200
---

# Context Artifacts — Non-Code Project Knowledge

Claude already reads code files. This capability ensures non-code knowledge
(schemas, specs, configs, docs) is discovered and used before implementing.

## What Are Context Artifacts?

Files that describe the system but aren't source code:

| Type | Examples | Why it matters |
|------|---------|---------------|
| **Database schemas** | schema.sql, migrations/, prisma/schema.prisma | Know table structure before writing queries |
| **API specs** | openapi.yaml, swagger.json, .proto files | Know endpoints before building integrations |
| **Infra configs** | terraform/, k8s/, docker-compose.yml | Know deployment constraints before architecture decisions |
| **Architecture docs** | docs/architecture.md, ADRs, diagrams | Know design decisions before proposing changes |
| **Environment configs** | .env.example, config templates | Know available env vars before hardcoding values |
| **Domain knowledge** | knowledge/, regulations, business rules | Know domain constraints before implementing logic |

## Discovery Protocol

Before implementing any milestone or feature, scan for artifacts:

```bash
# Database schemas
ls prisma/schema.prisma drizzle/ migrations/ schema.sql *.sql 2>/dev/null | head -5

# API specs
ls openapi.yaml openapi.json swagger.json *.proto api-spec.* 2>/dev/null | head -5

# Infra configs
ls terraform/ k8s/ kubernetes/ docker-compose.yml Dockerfile 2>/dev/null | head -5

# Architecture docs
ls docs/architecture* docs/adr/ knowledge/ ARCHITECTURE.md 2>/dev/null | head -5

# Environment
ls .env.example .env.template 2>/dev/null | head -5
```

## Integration Rules

### Before /add (any feature)
1. Check if the feature touches a database → read schema first
2. Check if the feature calls an API → read spec first
3. Check if the feature has infra constraints → read config first
4. Check knowledge/ for domain-specific rules

### Before /plan (any plan)
1. Read all available artifacts to understand system constraints
2. Reference artifact files in milestone descriptions
3. Flag milestones that will change artifacts (schema migrations, API changes)

### Before /review
1. Verify implementation matches schema (table names, column types)
2. Verify API calls match spec (endpoints, request/response shapes)
3. Verify deploy config supports the implementation

## Artifact Index

If `knowledge/` or `docs/` exists, maintain a lightweight index at `knowledge-index.md`:

```markdown
| file | summary | key_questions | tags |
|------|---------|--------------|------|
| prisma/schema.prisma | User, Assessment, Report tables | What tables exist? What are the relations? | database, schema |
| openapi.yaml | 12 endpoints, JWT auth | What endpoints are available? What auth is required? | api, auth |
| terraform/main.tf | AWS ECS + RDS + S3 | What infra is provisioned? What are the limits? | infra, aws |
```

Update this index when artifacts change. `/evolve` Cycle 2 refreshes it.

## Copilot Mode

In copilot mode, artifact discovery runs automatically:
- Session 1: `/dream` scans for existing artifacts, creates index
- Per milestone: `/add` reads relevant artifacts before implementing
- After schema changes: update artifact index
- `/evolve`: check for stale artifact references

## Anti-Patterns

- Writing SQL queries without reading the schema first
- Building API integrations without reading the spec
- Deploying without checking infra constraints
- Ignoring knowledge/ directory when it exists
