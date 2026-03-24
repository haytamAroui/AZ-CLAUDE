# Node.js / Express Code Rules — Curated DO/DO NOT Reference

**Load when**: stack contains Node.js, Express, Fastify, or similar backend JS/TS; generating code-rules.md for Node projects; or verifying Node/Express files.

---

## Async Patterns

- DO: use `async/await` throughout — no callback-style code in new files
- DO: always `await` Promises or chain `.catch()` — unhandled rejections crash Node
- DO: wrap `await` calls in `try/catch` at the service boundary
- DO NOT: mix `async/await` and `.then()/.catch()` in the same function
- DO NOT: use `Promise.all` without handling individual rejections — use `Promise.allSettled` when partial failure is acceptable

## Route Structure

- DO: split routes into separate files by resource — `routes/users.ts`, `routes/orders.ts`
- DO: use a router factory pattern — `export function usersRouter(deps: Deps): Router`
- DO: validate all request input at the route entry — use zod, joi, or class-validator
- DO: return semantically correct HTTP status codes:
  - `201` for successful resource creation
  - `204` for successful delete with no body
  - `400` for validation failures
  - `404` for not found
  - `409` for conflicts
  - `422` for unprocessable entity
- DO NOT: put business logic in route handlers — delegate to a service layer
- DO NOT: return stack traces in error responses — log server-side, return a generic message

## Middleware

- DO: register middleware in order: security → logging → parsing → auth → routes → errors
- DO: error-handling middleware uses 4 parameters exactly: `(err, req, res, next)`
- DO: always call `next(err)` on errors in async middleware — never swallow silently
- DO NOT: call both `next()` and `res.send()` in the same middleware path
- DO NOT: use synchronous file I/O in middleware (`fs.readFileSync`) — blocks the event loop

## Database and Queries

- DO: use parameterized queries or an ORM — never concatenate user input into SQL
- DO: define a data access layer (repository) — routes and services never call the DB directly
- DO: use database transactions for multi-step writes
- DO NOT: select `*` — list columns explicitly in queries
- DO NOT: put connection logic inside route handlers — use a shared pool or ORM connection

## Security

- DO: load secrets from `process.env` — never hardcode keys, tokens, or passwords in source
- DO: validate and sanitize all user input before use
- DO: set security headers — use `helmet` for Express
- DO: apply rate limiting to all public endpoints
- DO NOT: log request bodies containing passwords or tokens
- DO NOT: expose internal error messages to clients — wrap in a safe error response

## Configuration

- DO: validate all required env vars at startup — fail fast with a clear message if missing
  ```ts
  const PORT = Number(process.env.PORT) || 3000;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  ```
- DO: use a config module — centralize all `process.env` access in one file
- DO NOT: use `process.env.X` scattered throughout the codebase

## Testing

- DO: test routes with supertest against the real Express app — not mocked handlers
- DO: use a test database — never run tests against production or development databases
- DO: reset database state between tests using transactions or table truncation
- DO NOT: mock the database layer in route integration tests — it hides real issues
