---
name: migrate
description: >
  Upgrade dependencies, frameworks, or language versions safely.
  Reads changelogs, finds breaking changes, applies fixes, runs tests.
  Triggers on: "upgrade", "migrate", "update dependency", "bump version",
  "move to React 19", "upgrade Node", "update packages", "breaking changes".
argument-hint: "[what to upgrade — package name, framework, or 'all']"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /migrate — Safe Dependency & Framework Migration

$ARGUMENTS

Load: shared/completion-rule.md

---

## Phase 1: Assess Current State

If $ARGUMENTS is blank, use **AskUserQuestion**:
- What needs upgrading? (specific package, framework, or language version)
- What target version?

1. Read current versions:
```bash
# Node.js / npm
cat package.json | head -30
npm outdated 2>&1 | head -20

# Python
cat requirements.txt 2>/dev/null || cat pyproject.toml 2>/dev/null | head -30
pip list --outdated 2>&1 | head -20
```

2. Run tests BEFORE migration:
```bash
{test command}; EXIT=$?
echo "BEFORE migration — Exit: $EXIT"
```

**If tests fail before migration: STOP.** Fix first with `/fix`.

---

## Phase 2: Research Breaking Changes

For each package being upgraded:
```bash
# Check changelog / release notes
npm view {package} versions --json 2>/dev/null | tail -5
```

Use **WebSearch** for major version upgrades:
- `"{package} migration guide v{old} to v{new}"`
- `"{package} breaking changes v{new}"`

Build a migration checklist:
```
Package:         {name} {old} → {new}
Breaking changes: {list each one}
Files affected:  {grep for usage}
Migration steps: {ordered list}
```

---

## Phase 3: Apply Migration

**For major version upgrades**: use **EnterWorktree** to isolate.

1. Update the dependency:
```bash
# npm
npm install {package}@{version}
# pip
pip install {package}=={version}
```

2. Apply breaking change fixes — one at a time:
   - Fix each breaking change
   - Reference: `file:line — what changed and why`
   - Run tests after each fix

3. Check for deprecation warnings:
```bash
{test command} 2>&1 | grep -i "deprecat\|warning" | head -10
```

---

## Phase 4: Verify

Run the full test suite AFTER migration:
```bash
{test command}; EXIT=$?
echo "AFTER migration — Exit: $EXIT"
if [ $EXIT -ne 0 ]; then echo "MIGRATION BROKE SOMETHING — check breaking changes"; fi
```

Check:
- All tests pass
- No new deprecation warnings
- Lock file updated (package-lock.json / poetry.lock)
- No leftover old version references

---

## Completion Rule

Show:
1. Before: package versions and test output
2. Breaking changes found and how each was resolved
3. After: updated versions and test output
4. Lock file changes: `git diff --stat`

Do not say "migration complete" without showing both test runs.
