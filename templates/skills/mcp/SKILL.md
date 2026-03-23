---
name: mcp
description: >
  MCP server recommendations and setup for Claude Code projects. Use when the user
  asks "what MCP should I use", "add MCP", "set up MCP", "improve Claude Code",
  "Context7", "sequential thinking", "GitHub MCP", "Playwright MCP", "Supabase MCP",
  "Brave Search", "add web search", "add browser control", "add database access",
  "Claude doesn't know the latest API", "wrong library version", "stale docs",
  "hallucinating API", or when /setup detects a stack and needs to recommend
  integrations. Also use when user wants to configure .mcp.json, add tools to
  Claude Code, or asks which MCP works best for their stack.
  Do NOT trigger when: user is asking about AZCLAUDE's own security scanner for
  MCP configs (use security skill). Do NOT trigger for generic npm package questions.
---

# MCP Integration

MCP servers extend Claude Code with live capabilities: real-time docs, web search,
browser control, database access. AZCLAUDE recommends MCPs based on your stack —
it never bundles them (zero-dep rule).

## Step 0: Detect Stack

Read these before recommending:
```bash
cat package.json 2>/dev/null | grep -E '"next"|"react"|"supabase"|"prisma"|"postgres"|"playwright"' | head -10
cat CLAUDE.md 2>/dev/null | grep -E "Stack:|Domain:" | head -5
ls .mcp.json ~/.claude/claude_desktop_config.json 2>/dev/null && echo "mcp=configured" || echo "mcp=none"
```

## Step 1: Universal — Recommend for Every Project

These improve ALL AZCLAUDE workflows regardless of stack:

| MCP | What it fixes | Install |
|-----|--------------|---------|
| **Context7** | `/copilot` and `/add` write code against stale training data — wrong API signatures, deprecated methods. Context7 injects current docs at prompt time. | `claude mcp add context7 npx @upstash/context7-mcp` |
| **Sequential Thinking** | Orchestrator, milestone-builder, and `/blueprint` make better multi-step decisions when they can reason iteratively with branching. | `claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking` |

Always recommend both. They cost nothing (free, no API key) and improve every session.

## Step 2: Stack-Specific — Recommend Based on Detection

| If stack contains | Recommend | Why |
|------------------|-----------|-----|
| Any GitHub repo | **GitHub MCP** | Richer than `gh` CLI for `/issues`, `/ship`, PR reviews, repo search |
| Any web project | **Playwright MCP** | E2E testing — pairs with qa-engineer agent and `/test` |
| `supabase` in deps | **Supabase MCP** | Schema introspection, migrations, Edge Functions from within Claude Code |
| `postgres`/`prisma` in deps | **PostgreSQL MCP** | Natural language queries, schema exploration during development |
| Debugging / `/fix` heavy | **Brave Search** | Real-time error lookup, CVE research for `/sentinel`, library issue tracking |
| Design-to-code workflow | **Figma MCP** | Translate Figma components directly to code |

## Step 3: Install Commands

```bash
# Universal — install these for every project
claude mcp add context7 npx @upstash/context7-mcp
claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking

# GitHub (no API key needed with Claude Code auth)
claude mcp add github npx @modelcontextprotocol/server-github

# Playwright (Microsoft official)
claude mcp add playwright npx @playwright/mcp@latest

# Brave Search (requires BRAVE_API_KEY)
claude mcp add brave-search npx @modelcontextprotocol/server-brave-search \
  --env BRAVE_API_KEY=${BRAVE_API_KEY}

# Supabase (requires SUPABASE_ACCESS_TOKEN)
claude mcp add supabase npx @supabase/mcp-server-supabase \
  --env SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN}

# PostgreSQL
claude mcp add postgres npx @modelcontextprotocol/server-postgres \
  postgresql://localhost/mydb
```

## Step 4: Security Rules (Always Apply)

Before writing any `.mcp.json`:
- **Never hardcode secrets** — use `${ENV_VAR}` syntax always
- **Pin versions** — use `@1.2.3` not `@latest` in production
- **Scope to project** — use `claude mcp add --scope project` not global when possible
- Run `/sentinel` after adding MCPs to verify the config scores cleanly

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@1.0.0"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
    }
  }
}
```

## Step 5: Verify Installation

```bash
claude mcp list                    # shows configured servers
claude mcp get context7            # shows context7 config
```

Then test in Claude Code: ask Claude "use context7 to get the latest React docs" — if it returns live docs, it's working.

For full MCP catalog: `references/mcp-catalog.md`
