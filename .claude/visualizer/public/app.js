// Forked from claude-visualizer (MIT) by wretcher207
// https://github.com/wretcher207/claude-visualizer
// Added: AZCLAUDE pipeline progress, security events, brain router intent
(function () {
  'use strict';

  // Settings
  const SETTINGS_CONFIG = [
    { key: 'smartSummaries',  name: 'Smart Summaries',   desc: 'Parsed, readable tool descriptions',   defaultOn: true },
    { key: 'liveTimer',       name: 'Live Timer',        desc: 'Real-time counter while tools run',    defaultOn: true },
    { key: 'sessionStats',    name: 'Session Stats',     desc: 'Tool count and timing in header',      defaultOn: true },
    { key: 'resultSize',      name: 'Result Size',       desc: 'Line and character count badges',      defaultOn: true },
    { key: 'sequenceNumbers', name: 'Sequence Numbers',  desc: 'Tool call numbering (#1, #2...)',      defaultOn: true },
    { key: 'mcpLabels',       name: 'MCP Server Labels', desc: 'Show which server a tool comes from',  defaultOn: true },
    { key: 'resultPreviews',  name: 'Result Previews',   desc: 'Smart first-line result summaries',    defaultOn: true },
    { key: 'workingDirectory',name: 'Working Directory',  desc: 'Show the active project path',        defaultOn: false },
  ];

  const STORAGE_KEY = 'azclaude-visualizer-settings';

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        const merged = {};
        for (const cfg of SETTINGS_CONFIG) merged[cfg.key] = cfg.key in saved ? saved[cfg.key] : cfg.defaultOn;
        return merged;
      }
    } catch {}
    const defaults = {};
    for (const cfg of SETTINGS_CONFIG) defaults[cfg.key] = cfg.defaultOn;
    return defaults;
  }

  function saveSettings() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {} }
  let settings = loadSettings();

  function buildSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    const title = document.createElement('div'); title.className = 'settings-title'; title.textContent = 'Display Settings'; panel.appendChild(title);
    for (const cfg of SETTINGS_CONFIG) {
      const row = document.createElement('div'); row.className = 'setting-row';
      const info = document.createElement('div'); info.className = 'setting-info';
      const nameEl = document.createElement('span'); nameEl.className = 'setting-name'; nameEl.textContent = cfg.name;
      const descEl = document.createElement('span'); descEl.className = 'setting-desc'; descEl.textContent = cfg.desc;
      info.appendChild(nameEl); info.appendChild(descEl);
      const toggle = document.createElement('div'); toggle.className = 'toggle-switch' + (settings[cfg.key] ? ' on' : ''); toggle.dataset.key = cfg.key;
      row.appendChild(info); row.appendChild(toggle);
      row.addEventListener('click', () => { settings[cfg.key] = !settings[cfg.key]; toggle.classList.toggle('on', settings[cfg.key]); saveSettings(); if (cfg.key === 'sessionStats') updateSessionStatsDisplay(); });
      panel.appendChild(row);
    }
  }

  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', () => { settingsPanel.classList.toggle('open'); settingsBtn.classList.toggle('active'); });
  }

  // Tool utilities
  const TOOL_COLORS = window.AmbientCanvas.TOOL_COLORS;
  function getToolColor(toolName) { return TOOL_COLORS[toolName] || TOOL_COLORS[cleanToolName(toolName)] || TOOL_COLORS._default; }
  function cleanToolName(name) {
    if (!name) return 'unknown';
    if (name.startsWith('mcp__')) { const parts = name.split('__'); return parts.length >= 3 ? parts.slice(2).join('__') : parts[parts.length - 1]; }
    return name;
  }
  function extractMcpServer(name) {
    if (!name || !name.startsWith('mcp__')) return null;
    const parts = name.split('__');
    return parts.length >= 3 ? parts[1].replace(/_/g, ' ') : null;
  }

  // Smart parsers
  function formatSmartInput(rawToolName, input) {
    if (!input || typeof input !== 'object') return null;
    const tool = cleanToolName(rawToolName);
    switch (tool) {
      case 'Read': { let s = input.file_path || '(unknown file)'; if (input.offset) s += ', from line ' + input.offset; if (input.limit) s += ', ' + input.limit + ' lines'; return s; }
      case 'Edit': { let s = input.file_path || '(unknown file)'; if (input.old_string) { const p = input.old_string.trim().split('\n')[0].slice(0, 60); s += ' — replacing "' + p + (input.old_string.length > 60 ? '...' : '') + '"'; } return s; }
      case 'Write': { let s = input.file_path || '(unknown file)'; if (input.content) s += ' (' + input.content.length.toLocaleString() + ' chars)'; return s; }
      case 'Bash': return '$ ' + (input.command || '(empty)');
      case 'Glob': { let s = input.pattern || '*'; if (input.path) s += ' in ' + input.path; return s; }
      case 'Grep': { let s = '/' + (input.pattern || '') + '/'; if (input['-i']) s += 'i'; if (input.path) s += ' in ' + input.path; if (input.glob) s += ' (' + input.glob + ')'; return s; }
      case 'Agent': { let s = input.subagent_type || 'general-purpose'; if (input.description) s += ': ' + input.description; else if (input.prompt) s += ': ' + input.prompt.slice(0, 120) + (input.prompt.length > 120 ? '...' : ''); return s; }
      case 'WebFetch': return input.url || '(no URL)';
      case 'WebSearch': return '"' + (input.query || '') + '"';
      case 'Skill': return input.skill || '(unknown skill)';
      case 'MultiEdit': { let s = input.file_path || '(unknown file)'; if (input.edits) s += ' (' + input.edits.length + ' edits)'; return s; }
      case 'NotebookEdit': { let s = input.notebook || input.file_path || '(notebook)'; if (input.cell_id != null) s += ' cell ' + input.cell_id; return s; }
      case 'AskUserQuestion': return input.question || '(question)';
      case 'TaskCreate': return input.subject || '(new task)';
      case 'TaskUpdate': { let s = 'task #' + (input.taskId || '?'); if (input.status) s += ' → ' + input.status; return s; }
      default: {
        const keys = Object.keys(input);
        if (keys.length === 0) return null;
        if (keys.length === 1) { const v = input[keys[0]]; const str = typeof v === 'string' ? v : JSON.stringify(v); return keys[0] + ': ' + str.slice(0, 120); }
        const previews = [];
        for (let i = 0; i < Math.min(keys.length, 3); i++) { const v = input[keys[i]]; const vs = typeof v === 'string' ? v.slice(0, 40) : JSON.stringify(v).slice(0, 40); previews.push(keys[i] + ': ' + vs); }
        return previews.join(' | ') + (keys.length > 3 ? ' (+' + (keys.length - 3) + ' more)' : '');
      }
    }
  }

  function formatSmartResult(result) {
    if (!result) return null;
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    if (!text || text === 'null') return null;
    const lines = text.split('\n').filter(function (l) { return l.trim(); });
    if (lines.length === 0) return '(empty result)';
    const firstLine = lines[0].trim().slice(0, 150);
    return firstLine + (firstLine.length >= 150 ? '...' : '') + (lines.length > 1 ? ' (+' + (lines.length - 1) + ' more lines)' : '');
  }

  function parseResultSize(result) {
    if (!result) return null;
    const text = typeof result === 'string' ? result : JSON.stringify(result);
    if (!text) return null;
    const lines = text.split('\n').length;
    if (lines > 1) return lines.toLocaleString() + ' lines';
    if (text.length > 100) return text.length.toLocaleString() + ' chars';
    return null;
  }

  // Formatting
  function formatTime(isoString) { return new Date(isoString).toLocaleTimeString('en-US', { hour12: false }); }
  function formatDuration(ms) {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return Math.floor(ms / 60000) + 'm ' + Math.floor((ms % 60000) / 1000) + 's';
  }
  const MAX_DETAIL_LENGTH = 5000;
  function truncate(text) {
    if (typeof text !== 'string') text = JSON.stringify(text, null, 2) || '';
    return text.length > MAX_DETAIL_LENGTH ? { text: text.slice(0, MAX_DETAIL_LENGTH), truncated: true } : { text: text, truncated: false };
  }

  // Session tracking
  let toolSequence = 0, sessionToolCount = 0, sessionTotalDuration = 0, sessionStartTime = null, sessionClockInterval = null;

  function resetSessionStats() {
    toolSequence = 0; sessionToolCount = 0; sessionTotalDuration = 0; sessionStartTime = Date.now();
    if (sessionClockInterval) clearInterval(sessionClockInterval);
    sessionClockInterval = setInterval(updateSessionStatsDisplay, 1000);
    updateSessionStatsDisplay();
  }

  function updateSessionStatsDisplay() {
    const bar = document.getElementById('session-stats');
    if (!bar) return;
    if (!settings.sessionStats) { bar.classList.remove('visible'); return; }
    bar.classList.add('visible');
    const countEl = document.getElementById('stat-tool-count');
    const timeEl = document.getElementById('stat-total-time');
    const clockEl = document.getElementById('stat-session-clock');
    if (countEl) countEl.textContent = sessionToolCount + ' tool' + (sessionToolCount !== 1 ? 's' : '');
    if (timeEl) timeEl.textContent = formatDuration(sessionTotalDuration) + ' total';
    if (clockEl && sessionStartTime) {
      const elapsed = Date.now() - sessionStartTime;
      clockEl.textContent = String(Math.floor(elapsed / 60000)).padStart(2, '0') + ':' + String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    }
  }

  // DOM
  const feed = document.getElementById('event-feed');
  const emptyState = document.getElementById('empty-state');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const sessionIndicator = document.getElementById('session-indicator');
  const pipelineProgress = document.getElementById('pipeline-progress');
  const brainIntent = document.getElementById('brain-intent');
  const securityEvents = document.getElementById('security-events');

  let userScrolledUp = false;
  feed.addEventListener('scroll', function () { userScrolledUp = !(feed.scrollHeight - feed.scrollTop - feed.clientHeight < 50); });
  function scrollToBottom() { if (!userScrolledUp) feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' }); }

  const MAX_FEED_ITEMS = 500;
  function pruneOldCards() { while (feed.children.length > MAX_FEED_ITEMS) feed.removeChild(feed.firstChild); }

  function createSessionMarker(text) {
    const marker = document.createElement('div'); marker.className = 'session-marker';
    marker.innerHTML = '<div class="session-marker-line"></div><span class="session-marker-text">' + text + '</span><div class="session-marker-line"></div>';
    return marker;
  }

  // ===== AZCLAUDE Pipeline =====
  function updatePipelineStage(stage) {
    const stages = document.querySelectorAll('.pipeline-stage');
    const order = ['architect', 'implement', 'review', 'test'];
    const idx = order.indexOf(stage);
    stages.forEach(function (el, i) {
      el.classList.remove('active', 'complete');
      if (i < idx) el.classList.add('complete');
      else if (i === idx) el.classList.add('active');
    });
  }

  function showPipelineIntent(intents, tier) {
    if (!pipelineProgress || !brainIntent) return;
    pipelineProgress.classList.add('visible');
    const primary = (intents && intents[0]) || 'CODE';
    const cls = primary.toLowerCase();
    brainIntent.innerHTML = '<span class="intent-label ' + (['build','fix','review','test','refactor','plan','devops','frontend','extend','code','security','analyze'].includes(cls) ? cls : 'default') + '">' + primary + '</span>' +
      (tier ? ' <span style="font-size:9px;color:#5A5448">Tier ' + tier + '</span>' : '');
    // Reset pipeline stages
    document.querySelectorAll('.pipeline-stage').forEach(function (el) { el.classList.remove('active', 'complete'); });
    updatePipelineStage('architect');
  }

  function addSecurityEvent(level, rule, message) {
    if (!securityEvents) return;
    const card = document.createElement('div');
    card.className = 'security-card ' + (level || 'warn');
    card.innerHTML = '<div class="security-rule">' + (level === 'block' ? 'BLOCKED' : 'WARNING') + ': ' + (rule || 'unknown') + '</div>' +
      '<div class="security-message">' + (message || '').slice(0, 120) + '</div>';
    securityEvents.appendChild(card);
    // Cap at 10
    while (securityEvents.children.length > 10) securityEvents.removeChild(securityEvents.firstChild);
    // Trigger canvas bloom
    if (window.AmbientCanvas && window.AmbientCanvas.triggerSecurityBloom) {
      window.AmbientCanvas.triggerSecurityBloom(level);
    }
  }

  // Event card builder
  function createEventCard(event) {
    const color = getToolColor(event.tool_name);
    const card = document.createElement('div'); card.className = 'event-card'; card.style.borderLeftColor = color;
    if (event.tool_use_id) card.dataset.toolUseId = event.tool_use_id;

    const header = document.createElement('div'); header.className = 'event-header';
    if (settings.sequenceNumbers && event.event === 'PreToolUse') {
      toolSequence++;
      const seqEl = document.createElement('span'); seqEl.className = 'sequence-num'; seqEl.textContent = '#' + toolSequence; header.appendChild(seqEl);
    }

    const dot = document.createElement('span'); dot.className = 'tool-dot'; dot.style.backgroundColor = color; header.appendChild(dot);
    const name = document.createElement('span'); name.className = 'tool-name'; name.textContent = cleanToolName(event.tool_name) || event.event; name.style.color = color; header.appendChild(name);

    if (settings.mcpLabels) { const mcpServer = extractMcpServer(event.tool_name); if (mcpServer) { const label = document.createElement('span'); label.className = 'mcp-label'; label.textContent = mcpServer; header.appendChild(label); } }

    // Agent label — show which subagent made this call
    if (event.agent_type) { const agentLabel = document.createElement('span'); agentLabel.className = 'mcp-label'; agentLabel.style.background = 'rgba(168, 130, 255, 0.15)'; agentLabel.style.color = '#A882FF'; agentLabel.textContent = event.agent_type; header.appendChild(agentLabel); }

    // Diff stat badge (AZCLAUDE enriched)
    if (event.diffStat) { const ds = document.createElement('span'); ds.className = 'diff-stat'; ds.textContent = event.diffStat; header.appendChild(ds); }

    const meta = document.createElement('div'); meta.className = 'event-meta';
    if (event.event === 'PreToolUse') {
      card.classList.add('running');
      const indicator = document.createElement('span'); indicator.className = 'running-indicator'; indicator.style.backgroundColor = color; meta.appendChild(indicator);
    }

    const sizeBadge = document.createElement('span'); sizeBadge.className = 'result-size-badge'; meta.appendChild(sizeBadge);
    const durationBadge = document.createElement('span'); durationBadge.className = 'duration-badge'; durationBadge.style.display = 'none'; meta.appendChild(durationBadge);

    if (event.event === 'PreToolUse' && settings.liveTimer) {
      const startTime = Date.now(); durationBadge.textContent = '0ms'; durationBadge.style.display = ''; durationBadge.classList.add('live');
      card._timerInterval = setInterval(function () { durationBadge.textContent = formatDuration(Date.now() - startTime); }, 100);
    }

    const time = document.createElement('span'); time.className = 'timestamp'; time.textContent = formatTime(event.timestamp); meta.appendChild(time);
    header.appendChild(meta); card.appendChild(header);

    if (settings.smartSummaries && event.tool_input) {
      const summary = formatSmartInput(event.tool_name, event.tool_input);
      if (summary) { const s = document.createElement('div'); s.className = 'smart-summary' + (cleanToolName(event.tool_name) === 'Bash' ? ' bash-cmd' : ''); s.textContent = summary; s.title = summary; card.appendChild(s); }
    }
    if (settings.workingDirectory && event.cwd) { const c = document.createElement('div'); c.className = 'cwd-display'; c.textContent = 'cwd: ' + event.cwd; card.appendChild(c); }

    const detail = document.createElement('div'); detail.className = 'event-detail';
    if (event.tool_input) {
      const sec = document.createElement('div'); sec.className = 'detail-section';
      const lab = document.createElement('div'); lab.className = 'detail-label'; lab.textContent = 'Input';
      const con = document.createElement('div'); con.className = 'detail-content'; const d = truncate(event.tool_input); con.textContent = d.text;
      sec.appendChild(lab); sec.appendChild(con);
      if (d.truncated) { const n = document.createElement('div'); n.className = 'truncated-notice'; n.textContent = '... truncated'; sec.appendChild(n); }
      detail.appendChild(sec);
    }
    header.addEventListener('click', function () { detail.classList.toggle('expanded'); });
    card.appendChild(detail);

    if (event.event === 'PreToolUse') { sessionToolCount++; updateSessionStatsDisplay(); }
    return card;
  }

  function updateCardWithResult(card, event) {
    if (card._timerInterval) { clearInterval(card._timerInterval); card._timerInterval = null; }
    card.classList.remove('running');
    if (event.event === 'PostToolUseFailure') card.classList.add('failure');

    const durationBadge = card.querySelector('.duration-badge');
    if (durationBadge) {
      durationBadge.classList.remove('live');
      if (event.duration_ms != null) { durationBadge.textContent = formatDuration(event.duration_ms); durationBadge.style.display = ''; sessionTotalDuration += event.duration_ms; updateSessionStatsDisplay(); }
    }

    const indicator = card.querySelector('.running-indicator'); if (indicator) indicator.remove();

    if (settings.resultSize && event.tool_result) { const t = parseResultSize(event.tool_result); if (t) { const b = card.querySelector('.result-size-badge'); if (b) { b.textContent = t; b.style.display = ''; } } }
    if (settings.resultPreviews && event.tool_result) {
      const preview = formatSmartResult(event.tool_result);
      if (preview) { const p = document.createElement('div'); p.className = 'result-preview'; p.textContent = preview; p.title = preview; const d = card.querySelector('.event-detail'); if (d) card.insertBefore(p, d); else card.appendChild(p); }
    }
    if (event.tool_result) {
      const detail = card.querySelector('.event-detail');
      if (detail) {
        const sec = document.createElement('div'); sec.className = 'detail-section';
        const lab = document.createElement('div'); lab.className = 'detail-label'; lab.textContent = 'Result';
        const con = document.createElement('div'); con.className = 'detail-content'; const d = truncate(event.tool_result); con.textContent = d.text;
        sec.appendChild(lab); sec.appendChild(con);
        if (d.truncated) { const n = document.createElement('div'); n.className = 'truncated-notice'; n.textContent = '... truncated'; sec.appendChild(n); }
        detail.appendChild(sec);
      }
    }
  }

  // Event handler
  function handleEvent(event) {
    if (emptyState && emptyState.parentNode) emptyState.remove();

    // AZCLAUDE pipeline events
    if (event.event === 'pipeline-start') {
      showPipelineIntent(event.intents, event.tier);
      feed.appendChild(createSessionMarker('Pipeline: ' + (event.intents || []).join(' + ')));
      scrollToBottom();
      return;
    }
    if (event.event === 'pipeline-step') {
      updatePipelineStage(event.stage);
      return;
    }
    if (event.event === 'security-event') {
      addSecurityEvent(event.level, event.rule, event.message);
      return;
    }
    if (event.event === 'user-message') {
      var card = document.createElement('div'); card.className = 'user-message-card';
      var hdr = document.createElement('div'); hdr.className = 'user-message-header';
      hdr.innerHTML = '<span class="user-message-icon">&#9656;</span> User';
      var txt = document.createElement('div'); txt.className = 'user-message-text';
      txt.textContent = event.message || '(empty)';
      card.appendChild(hdr); card.appendChild(txt);
      feed.appendChild(card); pruneOldCards(); scrollToBottom();
      return;
    }
    if (event.event === 'context-update') {
      var pct = event.pct || 0;
      var bar = document.getElementById('context-bar');
      var fill = document.getElementById('context-fill');
      var label = document.getElementById('context-pct');
      if (bar && fill && label) {
        bar.classList.add('visible');
        fill.style.width = pct + '%';
        fill.className = 'context-fill' + (pct >= 85 ? ' critical' : pct >= 70 ? ' warn' : '');
        label.textContent = pct + '%';
        label.style.color = pct >= 85 ? '#C85050' : pct >= 70 ? '#D4A017' : '#5A5448';
      }
      return;
    }
    if (event.event === 'pipeline-complete') {
      document.querySelectorAll('.pipeline-stage').forEach(function (el) {
        el.classList.remove('active', 'complete');
        el.classList.add('done');
      });
      return;
    }
    if (event.event === 'session-summary') {
      const parts = [];
      if (event.duration) parts.push(event.duration);
      if (event.blocks != null) parts.push(event.blocks + ' blocks');
      if (event.warnings != null) parts.push(event.warnings + ' warnings');
      feed.appendChild(createSessionMarker('Session End: ' + parts.join(' | ')));
      scrollToBottom();
      return;
    }

    // Standard events
    if (event.event === 'SessionStart') { feed.appendChild(createSessionMarker('Session Started')); sessionIndicator.textContent = 'Session ' + (event.session_id || '').slice(0, 8); resetSessionStats(); scrollToBottom(); return; }
    if (event.event === 'SessionEnd') { feed.appendChild(createSessionMarker('Session Ended')); sessionIndicator.textContent = ''; if (sessionClockInterval) { clearInterval(sessionClockInterval); sessionClockInterval = null; } scrollToBottom(); return; }
    if (event.event === 'Stop') { feed.appendChild(createSessionMarker('Response Complete')); scrollToBottom(); return; }
    if (event.event === 'Notification') { feed.appendChild(createSessionMarker('Notification')); scrollToBottom(); return; }

    if (event.event === 'PreToolUse') {
      const card = createEventCard(event); feed.appendChild(card); pruneOldCards(); scrollToBottom();
      if (event.tool_name) { window.AmbientCanvas.triggerBloom(event.tool_name); if (window.AmbientAudio) window.AmbientAudio.playToolSound(event.tool_name); }
      return;
    }

    if (event.event === 'PostToolUse' || event.event === 'PostToolUseFailure' || event.event === 'tool-complete') {
      let matchingCard = null;
      if (event.tool_use_id) {
        const cards = feed.querySelectorAll('.event-card[data-tool-use-id]');
        for (let i = cards.length - 1; i >= 0; i--) { if (cards[i].dataset.toolUseId === event.tool_use_id) { matchingCard = cards[i]; break; } }
      }
      if (matchingCard) { updateCardWithResult(matchingCard, event); }
      else { const card = createEventCard(event); if (event.event === 'PostToolUseFailure') card.classList.add('failure'); feed.appendChild(card); }
      scrollToBottom(); return;
    }

    if (event.event === 'SubagentStart') { feed.appendChild(createSessionMarker('Subagent Started')); if (event.tool_name) window.AmbientCanvas.triggerBloom('Agent'); scrollToBottom(); return; }
    if (event.event === 'SubagentStop') { feed.appendChild(createSessionMarker('Subagent Finished')); scrollToBottom(); return; }

    // Fallback
    const card = createEventCard(event); feed.appendChild(card); scrollToBottom();
  }

  // SSE
  function connect() {
    const evtSource = new EventSource('/stream');
    evtSource.onopen = function () { statusDot.className = 'connected'; statusText.textContent = 'Connected'; };
    evtSource.onmessage = function (e) { try { handleEvent(JSON.parse(e.data)); } catch {} };
    evtSource.onerror = function () { statusDot.className = 'reconnecting'; statusText.textContent = 'Reconnecting...'; };
  }

  // Audio toggle
  var audioBtn = document.getElementById('audio-toggle');
  var audioIcon = document.getElementById('audio-icon');
  var audioLabel = document.getElementById('audio-label');
  if (audioBtn && window.AmbientAudio) {
    audioBtn.addEventListener('click', function () {
      if (!window.AmbientAudio.isReady()) { window.AmbientAudio.init(); audioBtn.classList.add('active'); audioIcon.innerHTML = '&#9835;'; audioLabel.textContent = 'Audio On'; }
      else {
        var muted = window.AmbientAudio.toggleMute();
        if (muted) { audioBtn.classList.remove('active'); audioBtn.classList.add('muted'); audioIcon.innerHTML = '&#9834;'; audioLabel.textContent = 'Muted'; }
        else { audioBtn.classList.remove('muted'); audioBtn.classList.add('active'); audioIcon.innerHTML = '&#9835;'; audioLabel.textContent = 'Audio On'; }
      }
    });
  }

  buildSettingsPanel(); updateSessionStatsDisplay(); connect();
})();
