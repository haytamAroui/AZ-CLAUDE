#!/bin/bash
# AZCLAUDE statusline — auto-installed by setup
# Shows: model | context % (color-coded) | rate limit | session time | lines changed
# Updates automatically after every turn — no manual action needed.
#
# Data arrives as JSON on stdin from Claude Code.
# Requires: jq (falls back to basic output if missing)

input=$(cat)

# ── Fallback if jq is not available ──────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "[AZCLAUDE] install jq for statusline metrics"
  exit 0
fi

# ── Extract metrics ──────────────────────────────────────────────────────────
MODEL=$(echo "$input" | jq -r '.model.display_name // "Claude"')
CTX_PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
CTX_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
LINES_ADD=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
LINES_DEL=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')
RATE_5H=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // -1' | cut -d. -f1)

# ── Format duration ──────────────────────────────────────────────────────────
DURATION_SEC=$((DURATION_MS / 1000))
MINS=$((DURATION_SEC / 60))
SECS=$((DURATION_SEC % 60))

# ── Format context size (200k / 1M) ─────────────────────────────────────────
if [ "$CTX_SIZE" -ge 1000000 ] 2>/dev/null; then
  CTX_LABEL="1M"
elif [ "$CTX_SIZE" -ge 100000 ] 2>/dev/null; then
  CTX_LABEL="200k"
else
  CTX_LABEL="${CTX_SIZE}"
fi

# ── Color codes ──────────────────────────────────────────────────────────────
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
DIM="\033[2m"
BOLD="\033[1m"
RESET="\033[0m"

# ── Context bar (10 segments) ────────────────────────────────────────────────
FILLED=$((CTX_PCT * 10 / 100))
EMPTY=$((10 - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /\u2593}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /\u2591}"

# ── Color thresholds ─────────────────────────────────────────────────────────
if [ "$CTX_PCT" -ge 80 ]; then
  CTX_COLOR="$RED"
  CTX_WARN=" COMPACT SOON"
elif [ "$CTX_PCT" -ge 60 ]; then
  CTX_COLOR="$YELLOW"
  CTX_WARN=""
else
  CTX_COLOR="$GREEN"
  CTX_WARN=""
fi

# ── Build line 1: model + context bar ────────────────────────────────────────
LINE1="${DIM}[${RESET}${BOLD}${MODEL}${RESET}${DIM}]${RESET} "
LINE1+="${CTX_COLOR}${BAR} ${CTX_PCT}%${RESET}"
LINE1+="${DIM}/${CTX_LABEL}${RESET}"
LINE1+="${RED}${CTX_WARN}${RESET}"

# ── Build line 2: rate limit + time + lines + cost ───────────────────────────
LINE2=""

# Rate limit (only show if available, i.e. Pro/Max subscription)
if [ "$RATE_5H" -ge 0 ] 2>/dev/null; then
  if [ "$RATE_5H" -ge 80 ]; then
    LINE2+="${RED}Rate: ${RATE_5H}%${RESET} "
  elif [ "$RATE_5H" -ge 50 ]; then
    LINE2+="${YELLOW}Rate: ${RATE_5H}%${RESET} "
  else
    LINE2+="${DIM}Rate: ${RATE_5H}%${RESET} "
  fi
  LINE2+="${DIM}|${RESET} "
fi

# Duration
LINE2+="${DIM}${MINS}m${SECS}s${RESET}"

# Lines changed
if [ "$LINES_ADD" -gt 0 ] || [ "$LINES_DEL" -gt 0 ]; then
  LINE2+=" ${DIM}|${RESET} ${GREEN}+${LINES_ADD}${RESET}${DIM}/${RESET}${RED}-${LINES_DEL}${RESET}"
fi

# Cost (only show if > 0, i.e. API billing)
if [ "$(echo "$COST > 0" | bc 2>/dev/null)" = "1" ]; then
  COST_FMT=$(printf '$%.2f' "$COST")
  LINE2+=" ${DIM}|${RESET} ${COST_FMT}"
fi

# ── Output ───────────────────────────────────────────────────────────────────
echo -e "$LINE1"
echo -e "$LINE2"
