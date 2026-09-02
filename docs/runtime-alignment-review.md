# Runtime alignment and portability fixes

This branch packages the exact improvements requested during review so they can be inspected and applied cleanly.

## Highest-priority fixes

1. Replace hardcoded `.claude/...` runtime paths inside `templates/hooks/user-prompt.js` with `cfg`-derived paths.
2. Replace literal `node` spawns in `bin/copilot.js` with `process.execPath` for portability.
3. Align repository URLs in `package.json` and README badges/links with the current repository name.
4. Adjust README wording where the docs implied absolute runtime enforcement for behavior that is currently instruction-level enforcement.

## Why these changes matter

- The installer is multi-CLI aware, but `user-prompt.js` still contains several Claude-specific hardcoded paths.
- `bin/copilot.js` currently uses `node` for installer delegation instead of the already-running Node executable.
- The README and package metadata still point to `AZ-CLAUDE-COPILOT`, which creates repository identity drift.
- The security hooks are hard gates, but the task-routing flow is still primarily prompt-level enforcement; the docs should describe that accurately.

## Included patch

See `patches/runtime-alignment.patch` for the exact file-level patch prepared for review.
