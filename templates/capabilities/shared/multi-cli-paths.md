---
name: multi-cli-paths
description: >
  CLI detection and path configuration for multi-CLI environments.
  Load when CLI is not Claude Code, when path detection is needed, or when
  another AI CLI (Codex, OpenCode, Gemini, Cursor) is detected in the environment.
tokens: ~80
---

## Multi-CLI Path Configuration

AZCLAUDE defaults to Claude Code paths. When another CLI is detected, substitute paths below.

---

### Detection

```bash
# Detect active CLI
if command -v claude &>/dev/null; then echo "claude-code"
elif command -v codex &>/dev/null; then echo "openai-codex"
elif command -v opencode &>/dev/null; then echo "opencode"
elif command -v gemini &>/dev/null; then echo "gemini-cli"
else echo "unknown"
fi
```

---

### Path Table

| Path type | Claude Code | OpenAI Codex | OpenCode | Gemini CLI | Cursor |
|-----------|------------|--------------|----------|------------|--------|
| Config dir | `.claude/` | `.codex/` | `.opencode/` | `.gemini/` | `.cursor/` |
| Commands dir | `.claude/commands/` | `.codex/commands/` | `.opencode/commands/` | `.gemini/commands/` | `.cursor/rules/` |
| Agents dir | `.claude/agents/` | N/A | `.opencode/agents/` | N/A | `.cursor/agents/` |
| Memory dir | `.claude/memory/` | `.codex/memory/` | `.opencode/memory/` | `.gemini/memory/` | `.cursor/memory/` |
| Always-hot file | `CLAUDE.md` | `AGENTS.md` | `OPENCODE.md` | `GEMINI.md` | `.cursorrules` |
| Settings file | `~/.claude/settings.json` | `~/.codex/config.json` | N/A | `~/.gemini/settings.json` | N/A |

---

### Substitution Rule

When CLI ≠ claude-code, replace every hardcoded `.claude/` path before writing files.

```bash
CONFIG_DIR=".claude"        # Default
case "$DETECTED_CLI" in
  openai-codex) CONFIG_DIR=".codex" ;;
  opencode)     CONFIG_DIR=".opencode" ;;
  gemini-cli)   CONFIG_DIR=".gemini" ;;
  cursor)       CONFIG_DIR=".cursor" ;;
esac
```

Write all capability files, commands, and memory to `$CONFIG_DIR/` instead of `.claude/`.

---

### Capability Gaps by CLI

| Feature | Claude Code | Codex | OpenCode | Gemini | Cursor |
|---------|------------|-------|----------|--------|--------|
| Hooks (UserPromptSubmit, Stop) | ✓ | ✗ | partial | ✗ | ✗ |
| Agent spawning | ✓ | ✗ | ✓ | ✗ | partial |
| MCP servers | ✓ | ✗ | ✓ | partial | ✓ |
| Progressive disclosure | ✓ | manual | manual | manual | manual |

If hooks not supported → skip Level 6. If agents not supported → skip Level 5.
Apply same category skip rules as non-code projects.
