---
name: loop
description: >
  Run a command or prompt on a recurring interval.
  Triggers on: /loop, "check every X minutes", "run repeatedly", "keep watching".
tokens: ~60
---

# /loop — Recurring Task

$ARGUMENTS

---

Parse the arguments:
- Interval: look for `5m`, `10m`, `30m`, `1h` — default to `10m` if not specified
- Command: the rest of the arguments (e.g. `/status`, `/fix`, a prompt)

If arguments are blank, ask:
"What should I run, and how often? Example: `/loop 5m /status` or `/loop 10m check if the deploy succeeded`"

Run the command or prompt now, then remind the user:
"I'll repeat this every {interval}. Type /loop stop to cancel."

Note: Claude Code does not have a native timer — use the system cron or ask the user to re-invoke `/loop` manually for the next cycle. For automated recurring tasks, suggest setting up a cron job or GitHub Action instead.
