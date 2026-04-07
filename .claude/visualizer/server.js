// Forked from claude-visualizer (MIT) by wretcher207
// https://github.com/wretcher207/claude-visualizer
// Modified for AZCLAUDE — pipeline-aware events, configurable port, tmpdir logging
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Port from AZCLAUDE_VISUALIZER env var (default 8765)
const PORT = (() => {
  const v = process.env.AZCLAUDE_VISUALIZER;
  const n = parseInt(v, 10);
  return (n > 1 && n < 65536) ? n : 8765;
})();

const PUBLIC_DIR = path.join(__dirname, 'public');
const LOG_FILE = path.join(os.tmpdir(), 'azclaude-visualizer.jsonl');
const MAX_BODY_SIZE = 1024 * 1024;

// ---------------------------------------------------------------------------
// SSE client management + replay buffer
// ---------------------------------------------------------------------------
const sseClients = new Set();
const EVENT_BUFFER_MAX = 200;
const eventBuffer = [];

function broadcast(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try { client.write(data); } catch { sseClients.delete(client); }
  }
  // Ring buffer for reconnect replay
  eventBuffer.push(event);
  if (eventBuffer.length > EVENT_BUFFER_MAX) eventBuffer.shift();
}

// SSE heartbeat
setInterval(() => {
  for (const client of sseClients) {
    try { client.write(': keepalive\n\n'); } catch { sseClients.delete(client); }
  }
}, 30000);

// ---------------------------------------------------------------------------
// Tool duration tracking
// ---------------------------------------------------------------------------
const pendingTools = new Map();

setInterval(() => {
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  for (const [id, startTime] of pendingTools) {
    if (startTime < fiveMinAgo) pendingTools.delete(id);
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// JSONL event logging (tmpdir, async)
// ---------------------------------------------------------------------------
function logEvent(event) {
  fs.appendFile(LOG_FILE, JSON.stringify(event) + '\n', () => {});
}

// ---------------------------------------------------------------------------
// Flatten tool_response into a readable string
// ---------------------------------------------------------------------------
function flattenToolResponse(resp) {
  if (resp == null) return null;
  if (typeof resp === 'string') return resp;
  if (Array.isArray(resp)) {
    return resp.map(item => {
      if (typeof item === 'string') return item;
      if (item && item.text) return item.text;
      return JSON.stringify(item);
    }).join('\n');
  }
  if (typeof resp === 'object') {
    if ('stdout' in resp || 'stderr' in resp) {
      const parts = [];
      if (resp.stdout) parts.push(resp.stdout);
      if (resp.stderr) parts.push('[stderr] ' + resp.stderr);
      return parts.join('\n') || '(no output)';
    }
    return JSON.stringify(resp, null, 2);
  }
  return String(resp);
}

// ---------------------------------------------------------------------------
// POST /event — receives hook payloads
// ---------------------------------------------------------------------------
function handleEvent(req, res) {
  let body = '';
  let size = 0;

  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) { req.destroy(); return; }
    body += chunk;
  });

  req.on('end', () => {
    try {
      const raw = JSON.parse(body);

      const event = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        event: raw.hook_event_name || raw.type || 'unknown',
        session_id: raw.session_id || null,
        tool_name: raw.tool_name || null,
        tool_input: raw.tool_input || null,
        tool_result: flattenToolResponse(raw.tool_response) || null,
        tool_use_id: raw.tool_use_id || null,
        cwd: raw.cwd || null,
        agent_id: raw.agent_id || null,
        agent_type: raw.agent_type || null,
        error: raw.error || null,
        is_interrupt: raw.is_interrupt ?? null,
        // AZCLAUDE pipeline fields
        intents: raw.intents || null,
        tier: raw.tier || null,
        tierLabel: raw.tierLabel || null,
        level: raw.level || null,
        rule: raw.rule || null,
        message: raw.message || null,
        diffStat: raw.diffStat || null,
        seq: raw.seq || null,
        duration: raw.duration || null,
        toolCounts: raw.toolCounts || null,
        blocks: raw.blocks ?? null,
        warnings: raw.warnings ?? null,
      };

      // Duration tracking
      if (event.event === 'PreToolUse' && event.tool_use_id) {
        pendingTools.set(event.tool_use_id, Date.now());
      }
      if ((event.event === 'PostToolUse' || event.event === 'PostToolUseFailure') && event.tool_use_id) {
        const start = pendingTools.get(event.tool_use_id);
        if (start) {
          event.duration_ms = Date.now() - start;
          pendingTools.delete(event.tool_use_id);
        }
      }
      if (event.event === 'SessionStart') {
        pendingTools.clear();
      }

      broadcast(event);
      logEvent(event);
    } catch { /* Bad JSON — ignore */ }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
  });
}

// ---------------------------------------------------------------------------
// GET /stream — SSE endpoint
// ---------------------------------------------------------------------------
function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.write(': connected\n\n');
  // Replay buffered events so refreshing the browser doesn't lose history
  for (const event of eventBuffer) {
    try { res.write(`data: ${JSON.stringify(event)}\n\n`); } catch { return; }
  }
  sseClients.add(res);
  req.on('close', () => { sseClients.delete(res); });
}

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function handleStatic(req, res) {
  let urlPath = new URL(req.url, 'http://localhost').pathname;
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(PUBLIC_DIR, '.' + urlPath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end(); return; }

  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.end(data);
  });
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/event') return handleEvent(req, res);
  if (req.method === 'GET' && new URL(req.url, 'http://localhost').pathname === '/stream') return handleSSE(req, res);
  return handleStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`AZCLAUDE Visualizer running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error(`Try: AZCLAUDE_VISUALIZER=${PORT + 1} node server.js\n`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

function shutdown() {
  for (const client of sseClients) { try { client.end(); } catch {} }
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
