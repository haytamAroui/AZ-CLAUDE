# Contributing to AZCLAUDE

## How to add a new capability (15 min)

A capability is a markdown file in `templates/capabilities/`. It gets lazy-loaded — Claude reads it only when the task matches.

1. Create `templates/capabilities/shared/your-capability.md` with frontmatter:
```yaml
---
name: your-capability
description: >
  Symptom language — describe the situation the developer is in, not what the
  skill does. "Load when about to..." not "This skill provides...".
  List 5+ trigger scenarios.
tokens: ~100
---
```

2. If the capability enforces a process gate (completion, review, TDD, etc.):
   Add a `## Pressure Tests` section with 4 scenarios (time pressure, sunk cost, authority, false confidence).
   See `shared/pressure-test.md` for the format. A skill that can be argued out of is a suggestion, not a skill.

3. Add it to `templates/capabilities/manifest.md` under the right section.
   Use symptom language in the "When to load" column — not a workflow summary.

4. Add tests in `tests/test-features.sh`:
```bash
check "your-capability: key behavior" "$SHARED/your-capability.md" "pattern to grep"
```

5. Run `bash tests/test-features.sh` — all must pass.

6. Open a PR.

## How to add a new command (/skill)

1. Create `templates/commands/your-command.md` with frontmatter:
```yaml
---
name: your-command
description: What it does. Triggers on: [list scenarios].
argument-hint: "[what to pass]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---
```

2. Add `'your-command'` to the `COMMANDS` array in `bin/cli.js`.

3. Add it to the dispatch table in `templates/CLAUDE.md`.

4. Add tests in `tests/test-features.sh`.

5. Run `bash tests/test-features.sh` — all must pass.

## Running tests

```bash
bash tests/test-features.sh
```

1196 tests. All must pass before any PR is merged. No exceptions.

## Diagnosing your local setup

```bash
npx azclaude doctor
```

Shows exactly which checks pass or fail and what to fix.

## PR checklist

- [ ] `bash tests/test-features.sh` passes (0 failures)
- [ ] New capability/command has frontmatter with `description` and `tokens`
- [ ] Description uses symptom/trigger language ("Load when about to..."), not workflow summary
- [ ] Enforcement skills have a `## Pressure Tests` section (4 scenarios)
- [ ] New capability is listed in `manifest.md` with symptom language
- [ ] Commit message format: `type: what changed — why`

## What we don't accept

- New commands without tests
- Capabilities that load unconditionally (defeats lazy loading)
- Bash-only features (must work on Windows PowerShell, CMD, Git Bash, macOS, Linux)
- Dependencies beyond Node.js built-ins (`fs`, `path`, `os`, `crypto`, `child_process`)
