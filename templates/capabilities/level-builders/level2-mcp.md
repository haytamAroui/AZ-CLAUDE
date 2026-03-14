---
name: level2-mcp
description: >
  Build Level 2: configure MCP servers for this project.
  Triggers on: "build level 2", "add MCP", "configure MCP servers".
tokens: ~150
---

## Level 2: MCP Servers

MCP servers extend Claude's tool set. They are deferred-loaded — only connect
when an agent needs that specific capability.

---

### Detect What's Needed
Read signals from the project:
- Database files (sqlite, postgres connection strings) → database MCP
- Browser/web tasks mentioned in README → browser/playwright MCP
- File system operations beyond the project → filesystem MCP
- External APIs in dependencies → relevant API MCPs

Only install what the project actually needs. Not a default list.

---

### Configure `.mcp.json`
```json
{
  "mcpServers": {
    "{server-name}": {
      "command": "{command}",
      "args": ["{args}"],
      "env": {
        "{KEY}": "${ENV_VAR}"
      }
    }
  }
}
```

Place `.mcp.json` in the project root.

---

### Deferred Loading Rule
MCPs are NOT loaded at session start. Each subagent connects only when it needs
that capability. Do not list all MCPs in CLAUDE.md — they appear in manifest.md
if they need to be explicitly dispatched.

---

### Verification
After configuring:
- Run `claude mcp list` to confirm servers are registered
- Test one tool from each server before declaring Level 2 complete
- Document each server in manifest.md if it needs to be discoverable by agents
