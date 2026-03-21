# Privacy Policy — AZCLAUDE

**Last updated: 2026-03-22**

## No Data Collection

AZCLAUDE collects no data. It has zero external dependencies and makes no network requests of its own.

Everything it writes stays on your local machine:

- `goals.md` — session breadcrumbs written to your project's `.claude/memory/` directory
- `checkpoints/` — reasoning snapshots written to your project's `.claude/memory/checkpoints/`
- `observations.jsonl` — tool-use observations written to your project's `.claude/memory/reflexes/`
- Hook scripts — run locally as Node.js processes, no outbound connections

## What AZCLAUDE Does Not Do

- Does not send any data to external servers
- Does not track usage or analytics
- Does not store credentials (the pre-tool-use hook *blocks* them from being written)
- Does not use cookies or persistent identifiers

## Claude Code

AZCLAUDE runs inside Claude Code. Claude Code's own privacy policy governs how your prompts and code are handled by Anthropic. See: https://www.anthropic.com/privacy

## Contact

Issues: https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/issues
