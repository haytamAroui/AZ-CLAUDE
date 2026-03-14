---
name: intelligence-pipeline
description: >
  Pipeline agent design. Use when 3+ agents chain output to input.
  Ensures clean context passing, no context bleed between agents.
  Triggers on: "chain agents", "pipeline", "agent A feeds agent B".
tokens: ~250
---

## Pipeline Agent Design

Use when work genuinely requires sequential agents where each feeds the next.
Do NOT use for work one agent can do with tools directly.

---

### Pipeline Validity Check
Before building a pipeline, confirm:
1. Can a single agent do this with Read/Write/Bash tools? If yes → don't pipeline.
2. Is the output of Agent A genuinely the input of Agent B? If output needs human review first → don't pipeline.
3. Is each agent's task parallelizable instead? If yes → spawn parallel agents, not a pipeline.

Pipeline = sequential dependency. Parallel = independent tasks. Don't confuse them.

---

### Context Passing Rule
Each agent receives ONLY:
- The output of the previous agent (not the previous agent's full context)
- Its own capability file (the micro-section for its specific task)
- Shared rules if relevant (tdd.md, completion-rule.md)

**NEVER pass the full context window of Agent A to Agent B.**
Agent B's context starts fresh. It gets a summary, not a transcript.

---

### Pipeline Schema
Define before building:
```
Pipeline: {name}

Agent 1: {task}
  Input:  {what it receives}
  Output: {what it produces — this is Agent 2's input}

Agent 2: {task}
  Input:  {Agent 1's output format}
  Output: {what it produces — this is Agent 3's input}

Agent 3: {task}
  Input:  {Agent 2's output format}
  Output: {final result format}
```

The output format of each agent must exactly match the input format of the next.
If they don't match: the pipeline has a bug before it's built.

---

### Knowledge Passing [AutoAgent]
When passing knowledge between agents:
- Pass structured objects (JSON), not prose summaries
- Include only fields the next agent actually uses
- Compress intermediate results: script runs → summary output only

Intermediate tool call results stay in the script's scope, not in Claude's context.
Only the final structured output crosses the agent boundary.

---

### Pipeline Map
Document in `.claude/memory/pipeline-map.md`:
```
{pipeline-name}:
  A → B → C
  A output: {format}
  B output: {format}
  C output: {format}
  Total token budget: ~{estimate}
```
