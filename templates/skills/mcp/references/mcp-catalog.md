# MCP Catalog — Full Reference

## Universal (all projects)

| Name | Package | API Key | Use in AZCLAUDE |
|------|---------|---------|-----------------|
| Context7 | `@upstash/context7-mcp` | None | Inject live library docs into /add, /fix, /copilot |
| Sequential Thinking | `@modelcontextprotocol/server-sequential-thinking` | None | Better reasoning in orchestrator, /blueprint, /debate |

## Developer Tools

| Name | Package | API Key | Use in AZCLAUDE |
|------|---------|---------|-----------------|
| GitHub | `@modelcontextprotocol/server-github` | `GITHUB_TOKEN` (optional) | /issues, /ship, PR creation, repo search |
| Playwright | `@playwright/mcp` | None | E2E tests with qa-engineer, /test |
| Brave Search | `@modelcontextprotocol/server-brave-search` | `BRAVE_API_KEY` | /fix error lookup, /sentinel CVE research |
| Firecrawl | `firecrawl-mcp` | `FIRECRAWL_API_KEY` | Scrape live docs, competitor analysis |
| Sentry | `@sentry/mcp-server` | `SENTRY_TOKEN` | Pipe production errors into /fix sessions |

## Database

| Name | Package | API Key | Use in AZCLAUDE |
|------|---------|---------|-----------------|
| Supabase | `@supabase/mcp-server-supabase` | `SUPABASE_ACCESS_TOKEN` | Schema exploration, migrations, Edge Functions |
| PostgreSQL | `@modelcontextprotocol/server-postgres` | DB URL | Natural language queries during dev |
| SQLite | `@modelcontextprotocol/server-sqlite` | None | Local DB for prototypes |

## Design & Content

| Name | Package | API Key | Use in AZCLAUDE |
|------|---------|---------|-----------------|
| Figma | figma-mcp | `FIGMA_TOKEN` | Design-to-code with frontend-design skill |

---

## Install All Universal MCPs

```bash
claude mcp add context7 npx @upstash/context7-mcp
claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking
```

## Verify

```bash
claude mcp list
```

## Security Checklist

- [ ] No plaintext secrets in `.mcp.json` — use `${ENV_VAR}`
- [ ] Versions pinned (not `@latest`) for production
- [ ] Run `/sentinel` after changes to score MCP config
- [ ] `.mcp.json` in `.gitignore` if it contains env refs to local paths
