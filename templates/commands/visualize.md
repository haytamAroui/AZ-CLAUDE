# /visualize — Real-Time Session Visualizer

Start or stop the AZCLAUDE pipeline-aware visualizer dashboard.

## Quick Start

```bash
# Start the visualizer server
AZCLAUDE_VISUALIZER=8765 node .claude/visualizer/server.js &

# Or via CLI
azclaude-copilot visualize

# Open in browser
# http://localhost:8765
```

Set `AZCLAUDE_VISUALIZER=8765` in your environment so hooks send events to the dashboard.

## What You See

**Canvas (left 70%):**
- Tycho-inspired ambient sunset animation
- Particle blooms on every tool call (color-coded per tool)
- Red flash on security blocks, amber on warnings
- Generative F# pentatonic ambient music (toggle on/off)

**Sidebar (right 30%):**
- **Pipeline Progress** — 4-stage bar: architect → implement → review → test
- **Brain Router Intent** — BUILD, FIX, REFACTOR, TEST, PLAN, etc.
- **Security Events** — blocks and warnings with rule names
- **Tool Timeline** — smart summaries, live timers, diff stats (+N/-M)
- **Session Stats** — tool count, total time, session clock

## Stopping

```bash
azclaude-copilot visualize stop
# Or just close the terminal running the server
```

## Configuration

The port is set via the `AZCLAUDE_VISUALIZER` environment variable:
- `AZCLAUDE_VISUALIZER=8765` — default port
- `AZCLAUDE_VISUALIZER=9000` — custom port

When the env var is unset, hooks skip the visualizer POST entirely (zero overhead).
