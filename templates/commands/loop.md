---
name: loop
description: Run a command or prompt on a recurring schedule using native Claude Code cron.
argument-hint: "[interval: 5m/10m/30m/1h/daily/weekly] [command or prompt]"
disable-model-invocation: true
allowed-tools: Bash
---

# /loop — Recurring Task

$ARGUMENTS

---

## Step 1: Parse Arguments

Extract from $ARGUMENTS:
- **Interval**: `5m`, `10m`, `30m`, `1h`, `daily`, `weekly` — default `10m` if not specified
- **Command**: everything after the interval token (e.g. `/pulse`, `/fix`, a prompt)

If blank, use **AskUserQuestion**:
- What should run? (e.g. `/pulse`, `/fix`, `check if the deploy succeeded`)
- How often? (5m / 10m / 30m / 1h / daily / weekly)

---

## Step 2: Map Interval to Cron Expression

| Argument | Cron expression |
|----------|----------------|
| `5m`     | `*/5 * * * *`  |
| `10m`    | `*/10 * * * *` |
| `30m`    | `*/30 * * * *` |
| `1h`     | `0 * * * *`    |
| `daily`  | `0 9 * * *`    |
| `weekly` | `0 9 * * 1`    |

---

## Step 3: Create the Cron Job

Use **CronCreate** with:
- The mapped cron expression
- The command or prompt from Step 1

Run the command once immediately so the user sees it working.

Then confirm:
```
Scheduled: {command} every {interval}
Use CronList to view active schedules.
Use CronDelete to cancel.
```

---

## Stopping

If $ARGUMENTS contains `stop` or `cancel`:
1. **CronList** — show active schedules
2. **CronDelete** the matching entry
3. Confirm: "Cancelled: {command}"
