# {{PROJECT_NAME}}

## Identity
{{PROJECT_DESCRIPTION}}
Domain: {{DOMAIN}} | Stack: {{STACK}} | Scale: {{SCALE}}

## Rules
1. **Completion** — Never say "should work" or "probably passes." Show the output or stay in progress.
2. **Precision** — Reference code as `file:line`. Never describe in prose.
{{TDD_RULE}}

## Session State
Read `.claude/memory/goals.md` at the start of every session.
If it does not exist, create it with empty sections.
Update it at the end of every session.

## Task Routing
Read `.claude/capabilities/manifest.md` to find what to load.
Load ONLY the files relevant to the current task — nothing else.

Quick dispatch:
- Any code task → shared/tdd.md + shared/completion-rule.md
- /dream → commands/dream.md → agents/orchestrator-init.md
- /setup → commands/setup.md → agents/orchestrator-init.md
- /fix → commands/fix.md
- /evolve → commands/evolve.md → evolution/detect + generate + evaluate
- /debate → commands/debate.md → intelligence/debate.md
- /persist → commands/persist.md → shared/session-rhythm + friction-log
- /level-up → commands/level-up.md → level-builders/{N}.md
- /ship → commands/ship.md
- /status → commands/status.md
- /explain → commands/explain.md
- /loop → commands/loop.md
- Unknown capability → grep manifest.md by description, load match

## Trade-Off Hierarchies
When priorities conflict:
1. {{PRIORITY_1}}
2. {{PRIORITY_2}}
3. {{PRIORITY_3}}

## Available Commands
/dream · /setup · /fix · /evolve · /debate · /persist · /level-up · /ship · /status · /explain · /loop
