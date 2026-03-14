# AZCLAUDE Capabilities Manifest
last_updated: 2026-03-14
version: 1.3.0

The model reads this file ONCE (~100 tokens) to know what exists.
Load only the files that match the current task. Never load the full list.

## Shared — inject alongside any task
| File | When to load | Tokens |
|------|-------------|--------|
| shared/tdd.md | Any code task | ~50 |
| shared/completion-rule.md | Every task | ~40 |
| shared/session-rhythm.md | Session start or end | ~80 |
| shared/friction-log.md | Persist phase only | ~60 |
| shared/5-layer-agent.md | Creating or improving agents | ~500 |
| shared/vocabulary-transform.md | Domain detected during /setup, vocabulary mismatch | ~60 |
| shared/multi-cli-paths.md | Non-Claude-Code CLI detected, path configuration needed | ~80 |
| shared/quality-check.md | After /setup or /level-up, verify environment is correct | ~80 |
| shared/security.md | Credential handling, hook integrity, untrusted project review | ~200 |
| shared/native-tools.md | Writing or improving skills — which native Claude Code tools to use and when | ~200 |

## Level Builders — load ONE at a time
| File | When to load | Tokens |
|------|-------------|--------|
| level-builders/level1-claudemd.md | Building Level 1 (CLAUDE.md) | ~200 |
| level-builders/level2-mcp.md | Building Level 2 (MCP servers) | ~150 |
| level-builders/level3-skills.md | Building Level 3 (skills/commands) | ~600 |
| level-builders/level4-memory.md | Building Level 4 (memory system) | ~200 |
| level-builders/level5-agents.md | Building Level 5 (custom agents) | ~400 |
| level-builders/level6-hooks.md | Building Level 6 (lifecycle hooks) | ~400 |
| level-builders/level7-extmcp.md | Building Level 7 (external MCP) | ~150 |
| level-builders/level8-orchestrated.md | Building Level 8+ (intelligence/evolution), decision matrix for when | ~200 |

## Evolution — compose by what the cycle needs
| File | When to load | Tokens |
|------|-------------|--------|
| evolution/detect.md | /evolve — scanning gaps, rot, friction | ~250 |
| evolution/generate.md | /evolve — writing new skills or agents | ~250 |
| evolution/evaluate.md | /evolve — quality gate on generated output | ~200 |
| evolution/cycle2-knowledge.md | /evolve — knowledge consolidation pass | ~200 |
| evolution/cycle3-topology.md | /level-up — pipeline and topology work | ~250 |
| evolution/re-derivation.md | Friction > 10 logs, same pattern > 5 times | ~150 |

## Intelligence — opt-in only
| File | When to load | Tokens |
|------|-------------|--------|
| intelligence/debate.md | "debate", "tradeoff", hard architectural decision | ~400 |
| intelligence/opro.md | "optimize prompts", improving skill instructions | ~300 |
| intelligence/elo.md | Quality ranking across options or agents | ~200 |
| intelligence/pipeline.md | 3+ agents that chain output to input | ~350 |
| intelligence/experiment.md | Risky approach needing worktree isolation, "try this safely" | ~80 |
