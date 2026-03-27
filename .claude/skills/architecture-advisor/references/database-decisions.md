# Database Selection Guide

Source: Instaclustr 2026 DB best practices, mkennedy.codes Raw+DC pattern,
PostgreSQL docs, Redis docs.

## Quick Decision

```
What's your data shape?
  Relational (users, orders, relations) → PostgreSQL (any scale)
  Document (flexible schema, nested) → PostgreSQL JSONB (< 1M docs) or MongoDB
  Key-value (cache, sessions) → Redis
  Time-series (metrics, logs) → TimescaleDB (Postgres extension)
  Search (full-text) → PostgreSQL FTS first, Elasticsearch if > 10M docs
  Graph (relationships are the query) → Neo4j
```

## PostgreSQL Is The Default

For 90% of projects in 2026, PostgreSQL is the right answer:
- Relational + JSON + full-text search + extensions in one database
- Scales to billions of rows with proper indexing
- Free, open-source, every cloud has managed versions
- Don't add a second database until Postgres can't do the job

## ORM Decision

```
Project phase?
  Prototype/MVP → ORM (Prisma, Drizzle, SQLAlchemy)
    Why: developer velocity > query performance
  Growing product → ORM for CRUD + raw SQL for reports/analytics
    Why: ORM handles 90%, raw SQL for the 10% that needs optimization
  At scale → ORM with query monitoring (pg_stat_statements)
    Why: find slow queries, optimize those specific ones

NEVER: raw SQL with string concatenation
ALWAYS: parameterized queries ($1, ?, :param)
```

## Connection Pooling

| Scale | Strategy |
|-------|---------|
| < 50 connections | Direct connection (no pooler needed) |
| 50-500 connections | PgBouncer or Supabase connection pooler |
| 500+ connections | PgBouncer + read replicas |

## Caching Strategy

```
Do you need caching?
  Response time > 200ms for repeated queries → YES
  Response time < 200ms → NO, premature optimization

Where to cache?
  HTTP responses → CDN (Cloudflare, Vercel Edge)
  Database queries → Redis (TTL-based)
  Computed values → In-memory (Map/LRU) for single-server
  Session data → Redis (shared across servers)
```
