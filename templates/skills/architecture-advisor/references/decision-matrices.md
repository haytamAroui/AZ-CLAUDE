# Architecture Decision Matrices — Evidence-Based

Every recommendation includes the threshold where it changes.
Sources: Anthropic 2026 Agentic Coding Report, Martin Fowler Context Engineering,
Atlassian Architecture Guide, Java Code Geeks 2026, Monday.com TDD Guide.

---

## 1. Architecture Pattern

| Scale | Recommendation | Evidence | Reconsider when |
|-------|---------------|----------|-----------------|
| SMALL (< 50 files) | **Single-file or flat modules** | Over-engineering kills MVPs. Start simple, refactor when patterns emerge. | > 20 modules or 3+ developers |
| MEDIUM (50-500 files) | **Modular monolith** | 2026 consensus: modular monolith = strict module boundaries, single deployable. Faster debugging, simpler consistency. | > 1M req/day or > 50 developers |
| LARGE (500+ files) | **Modular monolith + targeted microservices** | Extract ONLY services with vastly different scaling needs. Operational cost: microservices need 2-4 platform engineers vs 1-2 for monolith. | Components genuinely need independent deployment cycles |

**Anti-patterns by scale:**
- SMALL: Don't add Docker, Kubernetes, message queues, or service mesh
- MEDIUM: Don't split into microservices "for scalability" — you don't have the traffic yet
- LARGE: Don't keep everything in one service if parts scale 100x differently

---

## 2. Frontend Rendering

| Use case | Pattern | Evidence | Anti-pattern |
|----------|---------|----------|-------------|
| Marketing/SEO pages | **SSG** (Static Site Generation) | Pre-rendered = fastest TTFB, best SEO. No server cost per request. | SSR for content that changes monthly |
| User dashboards | **SSR** (Server-Side Rendering) | User-specific data needs request-time rendering. cookies(), headers() trigger dynamic. | SSG for personalized content |
| Internal admin tools | **SPA** (Client-Side) | No SEO needed, rich interactions. React SPA is fine. | SSR for tools only 5 people use |
| E-commerce products | **ISR** (Incremental Static Regen) | Products change but not per-request. Revalidate every 60s. | Full SSR for 10K product pages |
| Blog/docs | **SSG** | Content is static. Build once. MDX + static = zero runtime cost. | SSR for content that doesn't change |

**Next.js 16+ rule**: You don't choose SSR vs SSG explicitly — the framework infers from data access patterns. Use Server Components by default. CSR only for interactive islands.

---

## 3. Database Selection

| Scale | Data shape | Recommendation | Evidence | Reconsider when |
|-------|-----------|---------------|----------|-----------------|
| SMALL | Relational | **SQLite** | Zero config, single file, surprisingly fast (< 1M rows). | > 100 concurrent writes or multi-server |
| SMALL | Document | **JSON files or SQLite JSON** | Don't add MongoDB for 500 documents. | > 10K documents or need queries |
| MEDIUM | Relational | **PostgreSQL** | Most versatile. JSON support, full-text search, extensions. Industry default. | Never — Postgres scales to large |
| MEDIUM | Document | **PostgreSQL JSONB** | Postgres handles JSON natively. One database, not two. | Truly schemaless with > 1M docs |
| LARGE | Relational | **PostgreSQL + read replicas** | Connection pooling (PgBouncer), read replicas for scale. | > 100K writes/sec → consider sharding |
| LARGE | Key-value/cache | **Redis** | In-memory, O(1) lookups, pub/sub. Complement to Postgres, not replacement. | Data must survive restart → add persistence |
| ANY | Search | **PostgreSQL full-text** first, **Elasticsearch** when > 10M docs | Don't add a search engine until Postgres FTS is too slow. Measure first. | Postgres FTS query time > 200ms |

**ORM vs raw SQL:**
- SMALL/MEDIUM: **ORM** (Prisma, SQLAlchemy, Drizzle) — developer velocity matters more than query optimization
- LARGE: **ORM for CRUD, raw SQL for complex queries** — ORM for 90%, raw for the 10% that needs performance
- Never raw SQL with string concatenation — always parameterized queries

---

## 4. Testing Strategy

| Scale | Strategy | Evidence | Anti-pattern |
|-------|---------|----------|-------------|
| SMALL/MVP | **Test-after, critical paths only** | TDD slows prototypes. Write tests for auth, payments, data mutations. Skip UI tests. | TDD for throwaway code |
| MEDIUM | **TDD for business logic, test-after for UI** | Business logic tests catch regressions. UI changes too fast for test-first. | 100% coverage mandate — diminishing returns after 80% |
| LARGE | **Full TDD + integration tests** | At scale, every untested path is a production bug. Testing pyramid: many unit, fewer integration, few E2E. | Mocking everything — integration tests catch what mocks hide |

**Testing pyramid (2026 consensus):**
```
      /  E2E  \        ← few, slow, high confidence
     / Integr. \       ← moderate, catch boundary bugs
    /   Unit    \      ← many, fast, catch logic bugs
```

---

## 5. API Design

| Audience | Pattern | Evidence | Reconsider when |
|----------|---------|----------|-----------------|
| Internal (your frontend) | **tRPC or server actions** | Type-safe, no serialization overhead, collocated with UI. | Multiple frontends or public API |
| Public API | **REST** | Universal, cacheable via HTTP, well-understood by consumers. | Mobile app with complex nested data |
| Mobile-heavy | **GraphQL** | Reduces over-fetching on bandwidth-limited clients. Single endpoint. | Team has 0 GraphQL experience — learning curve costs 3+ weeks |
| Real-time | **WebSocket or SSE** | SSE for server-to-client. WebSocket for bidirectional. | Polling is fine for < 30s update intervals |

---

## 6. State Management (Frontend)

| Complexity | Pattern | Evidence | Anti-pattern |
|-----------|---------|----------|-------------|
| Simple (< 10 states) | **React useState/useReducer** | Built-in, zero bundle size, sufficient for most apps. | Adding Redux for a todo app |
| Forms + server data | **React Hook Form + TanStack Query** | Server state ≠ client state. TanStack caches server data. RHF handles forms. | Managing server cache in Redux |
| Complex client state | **Zustand** | 1KB, no boilerplate, TypeScript-first. Replaced Redux as default in 2025. | Redux for new projects in 2026 — Zustand is simpler |
| Enterprise with workflows | **XState** | State machines prevent impossible states. Worth the complexity for multi-step flows. | XState for simple toggle states |

---

## 7. Deployment Target

| Scale | Target | Evidence | Reconsider when |
|-------|--------|----------|-----------------|
| SMALL/MVP | **Vercel or Railway** | Zero-config, free tier, auto-scaling. Ship in minutes. | Need GPU, long-running jobs, or custom networking |
| MEDIUM | **Railway or Render** | Managed Postgres, Redis, background workers. Predictable pricing. | > $500/month → dedicated infra is cheaper |
| LARGE | **AWS/GCP with IaC** | Full control, compliance, VPC isolation. Terraform or Pulumi. | Small team — managed platforms save 2 engineers |
| Edge workloads | **Cloudflare Workers or Vercel Edge** | < 50ms global latency. Limited runtime (no Node.js APIs). | Need full Node.js runtime or > 128MB memory |

---

## 8. Auth Strategy

| Scale | Pattern | Evidence | Anti-pattern |
|-------|---------|----------|-------------|
| SMALL | **Supabase Auth or Clerk** | Pre-built, secure, free tier. Don't build auth from scratch. | Rolling your own JWT system |
| MEDIUM | **Auth.js (NextAuth) or Supabase** | Flexible providers, session management included. | Storing sessions in localStorage |
| LARGE | **Dedicated auth service (Auth0, Keycloak)** | SSO, RBAC, audit logs, compliance. | Self-hosted auth without a security team |

---

## Meta-Rule: When In Doubt

1. **Start simple.** The most common mistake is over-engineering the initial design.
2. **Measure before optimizing.** "X is slow" is not evidence. Show the numbers.
3. **Defer decisions.** Choose the option that's easiest to change later.
4. **Match the team.** The best architecture is the one your team can operate.
