---
name: ship
description: Stage changes, generate a commit message, commit, and push. Skips .env and secrets automatically.
argument-hint: "[optional: commit message hint]"
disable-model-invocation: true
allowed-tools: Bash, Read
---

# /ship — Save and Push to GitHub

Steps:

1. Run `git status` — show what changed
2. If not a git repo: run `git init`, create initial commit
3. Stage changed files — NEVER stage `.env`, credentials, secrets, or API keys
   - Check for sensitive files before staging: `git status --short | grep -E "\.env|secret|credential|key"`
   - If found: warn and skip those files
4. Generate a clear commit message:
   - Lead with what changed and why (not just "update files")
   - Format: `{type}: {what changed} — {why}`
   - Types: feat / fix / refactor / docs / chore
5. Commit the changes
6. If a remote exists: push to current branch
7. If no remote: show exactly how to connect to GitHub:
   ```
   git remote add origin https://github.com/{username}/{repo}.git
   git push -u origin main
   ```

If there are no changes: say "Nothing to ship — your code is already up to date."

Show a summary of what was shipped: files changed, commit hash, branch.
