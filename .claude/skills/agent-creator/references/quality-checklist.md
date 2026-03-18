# Agent Quality Checklist

Verify ALL items before shipping any agent.

## Description
- [ ] Description has 30+ trigger keywords (pushy routing)
- [ ] Description ends with "even if not explicitly mentioned"
- [ ] Name is lowercase, hyphenated, descriptive
- [ ] No naming collision with project's internal agents (LangGraph, CrewAI)

## Structure
- [ ] All 5 layers present (persona, scope, tools, constraints, domain)
- [ ] Layer 5 (domain) is the largest section
- [ ] Agent file is under 500 lines

## Scope
- [ ] Scope has explicit OWNS list with directories/files
- [ ] Scope has explicit DOES NOT TOUCH boundaries
- [ ] No overlap with other agents' scope
- [ ] Agent owns its test files (testing = responsibility, not role)

## Constraints
- [ ] Constraints are positive directives ("Always X" not "Don't do Y")
- [ ] Constraints hold under pressure ("skip tests" → refuses)
- [ ] 5-10 constraints maximum
- [ ] Constraints are specific and testable

## Tools
- [ ] Tools section lists restrictions, not just grants
- [ ] Review agents: Read, Grep, Glob only (no Write/Edit)
- [ ] Permission mode matches role (planMode for reviewers, acceptEdits for builders)

## Integration
- [ ] Agent reads memory (patterns, antipatterns, decisions) before starting
- [ ] Agent references relevant skills for task-specific workflows
- [ ] Model assignment matches complexity (opus for review, sonnet for implementation)
- [ ] Self-correction pattern included (2 attempts, then stop and report)

## Behavior
- [ ] Removing the agent changes Claude's behavior (not just removes info)
- [ ] Agent doesn't duplicate another agent's scope
- [ ] Agent records outcomes (patterns.md, antipatterns.md, decisions.md)
