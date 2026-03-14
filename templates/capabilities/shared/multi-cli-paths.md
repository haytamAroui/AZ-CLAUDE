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

### Path Table

| CLI | Rules File | Config Dir | Agents | Commands | Memory |
|-----|-----------|------------|--------|----------|--------|
| Claude Code | `CLAUDE.md` | `.claude/` | `.claude/agents/` | `.claude/commands/` | `.claude/memory/` |
| Codex CLI | `AGENTS.md` | `.codex/` | `.codex/agents/` | `.codex/commands/` | `.codex/memory/` |
| OpenCode | `AGENTS.md` | `.opencode/` | `.opencode/agents/` | `.opencode/commands/` | `.opencode/memory/` |
| Gemini CLI | `GEMINI.md` | `.gemini/` | `.gemini/agents/` | `.gemini/commands/` | `.gemini/memory/` |
| Cursor | `.cursor/rules/project.mdc` | `.cursor/` | `.cursor/agents/` | `.cursor/commands/` | `.cursor/memory/` |

---

### Auto-Detection

Detect by directory presence — not by executable name (executables aren't always in PATH).

```bash
if   [ -d .claude ];   then CFG=".claude";   RULES="CLAUDE.md"
elif [ -d .gemini ];   then CFG=".gemini";   RULES="GEMINI.md"
elif [ -d .opencode ]; then CFG=".opencode"; RULES="AGENTS.md"
elif [ -d .codex ];    then CFG=".codex";    RULES="AGENTS.md"
elif [ -d .cursor ];   then CFG=".cursor";   RULES=".cursor/rules/project.mdc"
else CFG=".claude"; RULES="CLAUDE.md"
fi
```

Use `$CFG` and `$RULES` in all file operations. Never hardcode `.claude/`.

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
