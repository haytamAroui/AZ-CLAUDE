---
name: mcp
description: >
  MCP server recommendations and setup for Claude Code projects. Use when the user
  asks "what MCP should I use", "add MCP", "set up MCP", "improve Claude Code",
  "Context7", "sequential thinking", "GitHub MCP", "Playwright MCP", "Supabase MCP",
  "Brave Search", "add web search", "add browser control", "add database access",
  "Claude doesn't know the latest API", "wrong library version", "stale docs",
  "hallucinating API", or "which MCP works best for my stack".
argument-hint: "[optional: stack or specific MCP name]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob
---

# /mcp — MCP Integration

$ARGUMENTS

Load skill: `skills/mcp/SKILL.md`

Follow all steps in the skill: detect stack → recommend universal MCPs → recommend
stack-specific MCPs → show install commands → apply security rules → verify.
