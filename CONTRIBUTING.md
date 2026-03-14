# Contributing to AZCLAUDE

## How to add a new capability (15 min)

A capability is a markdown file in `templates/capabilities/`. It gets lazy-loaded — Claude reads it only when the task matches.

1. Create `templates/capabilities/shared/your-capability.md` with frontmatter:
```yaml
---
name: your-capability
description: >
  What this does. List 5+ trigger scenarios so Claude knows when to load it.
tokens: ~100
---
```

2. Add it to `templates/capabilities/manifest.md` under the right section with a `When to load` description.

3. Add tests in `test-features.sh`:
```bash
check "your-capability: key behavior" "$SHARED/your-capability.md" "pattern to grep"
```

4. Run `bash test-features.sh` — all must pass.

5. Open a PR.

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

4. Add tests in `test-features.sh`.

5. Run `bash test-features.sh` — all must pass.

## Running tests

```bash
bash test-features.sh
```

527+ tests. All must pass before any PR is merged. No exceptions.

## Diagnosing your local setup

```bash
npx azclaude doctor
```

Shows exactly which checks pass or fail and what to fix.

## PR checklist

- [ ] `bash test-features.sh` passes (0 failures)
- [ ] New capability/command has frontmatter with `description` and `tokens`
- [ ] New capability is listed in `manifest.md`
- [ ] Commit message format: `type: what changed — why`

## What we don't accept

- New commands without tests
- Capabilities that load unconditionally (defeats lazy loading)
- Bash-only features (must work on Windows PowerShell, CMD, Git Bash, macOS, Linux)
- Dependencies beyond Node.js built-ins (`fs`, `path`, `os`, `crypto`, `child_process`)
