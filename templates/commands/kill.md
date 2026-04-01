---
name: kill
description: >
  Kill all running dev/testing servers on common development ports.
  Triggers on: "kill servers", "kill ports", "free ports", "kill dev server",
  "port still in use", "EADDRINUSE", "address already in use", "stop all servers",
  "kill background processes", "clean up ports".
  Safe by design — only kills processes bound to TCP ports, never MCP servers (stdio, no ports).
argument-hint: "[port number | --all (default) | --ports 3000,8080]"
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
---

# /kill — Kill Dev Servers

$ARGUMENTS

---

## Safety guarantee

Killing by TCP port is inherently MCP-safe.
MCP servers use stdio transport — they hold **no TCP ports**.
Any process on a TCP port is a dev/test server, not Claude infrastructure.

---

## Step 1 — Parse target ports

**If $ARGUMENTS contains a port number** (e.g., `/kill 3000`):
→ Kill only that specific port. Skip to Step 3.

**If $ARGUMENTS is `--ports <list>`** (e.g., `/kill --ports 3000,5173`):
→ Parse the comma-separated list. Skip to Step 3.

**Default (`--all` or no argument)**:
→ Target the full dev port list below. Continue to Step 2.

### Default dev port list
```
3000  3001  3002  3003  4000  4200  4321
5000  5001  5173  5174  6006  7000  8000
8001  8080  8081  8888  9000  9001  9229
```

> Note: 9229 is Node.js debugger. Kill only if you're not actively debugging.

---

## Step 2 — Detect which ports are actually in use

**Unix/macOS:**
```bash
for port in 3000 3001 3002 3003 4000 4200 4321 5000 5001 5173 5174 6006 7000 8000 8001 8080 8081 8888 9000 9001 9229; do
  pid=$(lsof -ti tcp:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "  PORT $port → PID $pid ($(ps -p $pid -o comm= 2>/dev/null))"
  fi
done
```

**Windows:**
```bash
for port in 3000 3001 3002 3003 4000 4200 4321 5000 5001 5173 5174 6006 7000 8000 8001 8080 8081 8888 9000 9001 9229; do
  result=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1)
  if [ -n "$result" ]; then
    echo "  PORT $port → PID $result"
  fi
done
```

Print summary of occupied ports. If none found: print `No dev servers found on standard ports.` and stop.

---

## Step 3 — Kill strategy

### Primary (cross-platform, requires Node):
```bash
npx --yes kill-port <PORTS>
```
Example: `npx --yes kill-port 3000 5173 8080`

This is safe, silent on ports that are already free, and exits 0 on success.

### Fallback — Unix/macOS (if npx not available):
```bash
for port in <PORTS>; do
  lsof -ti tcp:$port | xargs -r kill -9 2>/dev/null
  echo "  Killed port $port"
done
```

### Fallback — Windows (if npx not available):
```bash
for port in <PORTS>; do
  pid=$(netstat -ano | findstr ":$port " | grep LISTENING | awk '{print $5}' | head -1)
  if [ -n "$pid" ]; then
    taskkill /PID $pid /F
    echo "  Killed PID $pid on port $port"
  fi
done
```

---

## Step 4 — Verify

After killing, re-run the detection from Step 2.

**Expected output:**
```
No dev servers found on standard ports.
```

If any port is still occupied: report it and its PID. Do not retry — report to user.

---

## Completion rule

Print a summary:
```
Killed: ports 3000, 5173
Still running: (none)
```

Never say "should be free now." Run the verification and show the output.
