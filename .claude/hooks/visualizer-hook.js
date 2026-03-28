#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — Visualizer event relay hook
 * Registered for events the other hooks don't cover:
 *   Notification, SubagentStart, SubagentStop, SessionStart, SessionEnd, PostToolUseFailure
 * Reads stdin JSON, POSTs to the visualizer server. Fire-and-forget.
 * Only runs when AZCLAUDE_VISUALIZER env var is set.
 * 1500ms hard timeout — never blocks Claude Code.
 */

// Gate: exit immediately if visualizer not enabled
if (!process.env.AZCLAUDE_VISUALIZER) process.exit(0);

const http = require('http');

const PORT = (() => {
  const n = parseInt(process.env.AZCLAUDE_VISUALIZER, 10);
  return (n > 1 && n < 65536) ? n : 8765;
})();

// Hard safety net
setTimeout(() => process.exit(0), 1500);

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => { input += chunk; });

process.stdin.on('end', () => {
  if (!input.trim()) process.exit(0);

  // Validate JSON
  try { JSON.parse(input); } catch { process.exit(0); }

  const req = http.request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/event',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(input),
    },
    timeout: 1200,
  }, (res) => {
    res.resume();
    res.on('end', () => process.exit(0));
  });

  req.on('error', () => process.exit(0));
  req.on('timeout', () => { req.destroy(); process.exit(0); });

  req.write(input);
  req.end();
});

process.stdin.on('error', () => process.exit(0));
