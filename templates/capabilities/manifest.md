# AZCLAUDE Capabilities Manifest
last_updated: 2026-03-14
version: 2.0.0

The model reads this file ONCE (~100 tokens) to know what exists.
Load only the files that match the current task. Never load the full list.

## Shared — inject alongside any task
| File | When to load | Tokens |
|------|-------------|--------|
| shared/tdd.md | About to write, implement, fix, or refactor code — check signals first | ~50 |
| shared/completion-rule.md | About to say "should work", "probably passes", or claim done without proof | ~40 |
| shared/session-rhythm.md | Session just started, context was reset, or about to close | ~80 |
| shared/friction-log.md | Something was hard, slow, repeated, or frustrating this session | ~60 |
| shared/5-layer-agent.md | Writing a new agent or an existing agent is incomplete / making mistakes (see also: agent-creator skill) | ~500 |
| shared/vocabulary-transform.md | Generating files for compliance, medical, legal, finance, or creative domain | ~60 |
| shared/multi-cli-paths.md | CLI is not Claude Code, or path configuration is wrong for the platform | ~80 |
| shared/quality-check.md | /setup or /level-up just ran — verify it actually worked correctly | ~80 |
| shared/security.md | Handling credentials, modifying hooks, reviewing untrusted project, deploying | ~200 |
| shared/native-tools.md | Writing or improving a skill — which Claude Code tools to use and when | ~200 |
| shared/review-reception.md | Receiving review feedback — before responding, implementing, or pushing back | ~80 |
| shared/pressure-test.md | Writing a new enforcement skill, or an existing skill keeps getting bypassed | ~120 |
| shared/plan-tracker.md | Reading/writing plan.md, updating milestone status, copilot mode | ~200 |
| shared/reflexes.md | Learned behavioral patterns, reflex analysis, observation patterns, promote reflexes | ~250 |
| shared/context-artifacts.md | Project has DB schemas, API specs, infra configs, or knowledge/ dir — discover and use non-code knowledge before implementing | ~200 |
| shared/semantic-boundary-check.md | /evolve Cycle 3 or boundary validator warns — detect deeper behavioral duplication across extension types that grep misses | ~300 |
| shared/domain-advisor-generator.md | Non-tech domain detected (compliance, marketing, finance, medical, legal, research) — generates domain-specific advisor skill | ~400 |
| shared/intelligent-dispatch.md | About to build, fix, refactor, audit, or ship — non-trivial scope (3+ files or structural) — pre-flight analysis via problem-architect | ~300 |

## Level Builders — load ONE at a time
| File | When to load | Tokens |
|------|-------------|--------|
| level-builders/level1-claudemd.md | Project has no CLAUDE.md or rules file needs to be built/rebuilt | ~200 |
| level-builders/level2-mcp.md | Project needs database, browser, or API tool access via MCP | ~150 |
| level-builders/level3-skills.md | Project has repeated workflows with no command for them yet | ~600 |
| level-builders/level4-memory.md | No goals.md exists, or session context keeps getting lost | ~200 |
| level-builders/level5-agents.md | Project has parallel workstreams with no specialized agents yet | ~400 |
| level-builders/level6-hooks.md | No PostToolUse / UserPromptSubmit hooks, or hooks are bash-based | ~400 |
| level-builders/level7-extmcp.md | Project needs external MCP servers — databases, browsers, APIs | ~150 |
| level-builders/level8-orchestrated.md | Considering pipelines, debates, or self-improvement — unsure which | ~200 |

## Evolution — compose by what the cycle needs
| File | When to load | Tokens |
|------|-------------|--------|
| evolution/detect.md | Starting /evolve, environment feels stale, skills misfiring, friction repeating | ~250 |
| evolution/generate.md | detect.md produced a PLAN — about to write a fix or new skill | ~250 |
| evolution/evaluate.md | Just generated a skill or agent — before promoting or committing it | ~200 |
| evolution/cycle2-knowledge.md | patterns.md bloated, stale sessions, learning not consolidated | ~200 |
| evolution/cycle3-topology.md | Agents overlap, pipeline slow, manifest has dead entries | ~250 |
| evolution/re-derivation.md | Same friction pattern 5+ times, 10+ friction logs, patches aren't sticking | ~150 |

## Intelligence — opt-in only
| File | When to load | Tokens |
|------|-------------|--------|
| intelligence/debate.md | Hard decision between two real options — "debate", "tradeoff", "which is better" | ~400 |
| intelligence/opro.md | A skill keeps underperforming or producing wrong output after 10+ uses | ~300 |
| intelligence/elo.md | Need a defensible rank order across multiple options, agents, or skills | ~200 |
| intelligence/pipeline.md | 3+ agents must chain output — context bleed is a risk | ~350 |
| intelligence/experiment.md | Trying a risky approach that must not touch main branch — "try this safely" | ~80 |

## Spec-Driven Workflow — load in sequence
| Command | Purpose | Loads |
|---------|---------|-------|
| /constitute | Define project ground rules before any planning | commands/constitute.md |
| /spec | Write structured feature spec (goal → ACs → failure modes) | commands/spec.md |
| /clarify | Resolve open questions in a spec before blueprinting | commands/clarify.md |
| /blueprint | Derive milestone plan from a spec (spec-reviewer validates first) | commands/blueprint.md |
| /analyze | Cross-artifact consistency check — ghost milestones, spec vs. code | commands/analyze.md |
| /tasks | Build dependency graph + wave groups from plan.md | commands/tasks.md |
| /issues | Convert plan.md milestones to GitHub Issues | commands/issues.md |

**Typical sequence**: /constitute → /spec → /clarify → /blueprint → /copilot → /analyze
**Gates**: spec-reviewer (haiku) blocks /blueprint if spec is incomplete; constitution-guard (haiku) blocks milestones that violate non-negotiables
**Agents**: spec-reviewer validates spec quality; constitution-guard checks each milestone before dispatch
