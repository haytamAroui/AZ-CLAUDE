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

### Pipeline Building Blocks

Six primitives. Every pipeline is a composition of these.

| Block | What it does | When to use |
|-------|-------------|-------------|
| **Sequential** | A → B → C | Each step needs the previous result |
| **Parallel** | A + B + C → merge | Independent tasks that can run simultaneously |
| **Reflect** | Agent reviews its own output before passing it | High-stakes output, expensive to fix downstream |
| **Debate** | Two agents argue a position → synthesizer picks winner | Architectural decisions, tradeoffs |
| **Summarize** | Compresses large context before passing to next agent | When Agent A output would overflow Agent B context |
| **Tool-use** | Agent calls scripts/tools and passes JSON result | Programmatic data (never raw tool transcripts) |

**Compose by need**: most pipelines are Sequential + Summarize. Add Reflect only for high-risk steps.
Adding Debate to every pipeline wastes tokens — reserve for genuine tradeoffs.

---

### Pre-Built Pipeline Templates

#### Feature Pipeline (new feature implementation)
```
Agents: planner → implementer → reviewer
Planner input:  feature description + CLAUDE.md
Planner output: { files_to_change, test_plan, approach }
Implementer input: planner output + tdd.md
Implementer output: { files_changed, tests_written, test_results }
Reviewer input:  implementer output + spec
Reviewer output: { spec_compliance: pass|fail, issues: [...] }
Block types: Sequential + Reflect (implementer self-reviews tests before passing)
```

#### Fix Pipeline (bug investigation)
```
Agents: investigator → hypothesizer → fixer
Investigator input:  error description + relevant files
Investigator output: { root_cause, affected_files, reproduction_steps }
Hypothesizer input:  investigator output
Hypothesizer output: { hypothesis, fix_approach, risk: low|medium|high }
Fixer input:         hypothesizer output (high risk → add Debate block before fix)
Fixer output:        { files_changed, tests_passing, fix_summary }
Block types: Sequential (+ Debate if risk = high)
```

#### Review Pipeline (code review)
```
Agents: spec-checker → quality-checker
Spec-checker input:  PR diff + spec/requirements
Spec-checker output: { spec_compliance: pass|fail, violations: [...] }
Quality-checker input: PR diff + spec-checker output
  GATE: if spec_compliance = fail → stop, return spec-checker output (do not proceed)
Quality-checker output: { quality_issues: [...], suggestions: [...] }
Block types: Sequential with hard gate
```

#### Architecture Pipeline (major design decision)
```
Agents: analyst → maximalist → skeptic → synthesizer
Analyst input:   problem statement + codebase signals
Analyst output:  { options: [A, B, C], constraints, tradeoffs }
Maximalist input: analyst output → argues for best option
Skeptic input:    analyst output → argues against best option
Synthesizer input: maximalist + skeptic outputs → picks winner with reasoning
Block types: Sequential → Parallel (maximalist + skeptic run together) → Sequential
```

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
