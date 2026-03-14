---
name: level7-extmcp
description: >
  Build Level 7: external MCP servers and advanced tool composition.
  Triggers on: "build level 7", "external MCP", "advanced tools".
tokens: ~150
---

## Level 7: External MCP Servers

Level 7 extends Claude's capabilities beyond the project boundary.
External MCPs connect Claude to the world: databases, browsers, APIs, services.

---

### What Qualifies as Level 7

- External data sources (production database, analytics, monitoring)
- Browser automation (Playwright, Puppeteer)
- Communication tools (Slack, email, GitHub issues)
- Cloud services (AWS, GCP, deployment pipelines)
- Cross-project memory (azrole-memory or equivalent)

---

### Validation Before Installing

For each external MCP:
1. Does the project actually need this capability?
2. Is the MCP server trusted? (check source, not just npm package name)
3. What data does it access? Document it.
4. Does it require credentials? Store in env, never in .mcp.json plaintext.

---

### Cross-Project Memory (optional)

If working across multiple projects and want shared patterns:
```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["/path/to/memory-server.js"]
    }
  }
}
```

Cross-project memory stores: goals, friction patterns, ELO scores, portable skills.
It does NOT replace project-level memory — it supplements it.

---

### Level 7 Complete When
- External MCPs installed and verified with test calls
- Credentials in environment variables, not in committed files
- Each server documented in manifest.md or .mcp.json comments
- No external MCP accesses data it doesn't need (principle of least access)
