// Forked from claude-visualizer (MIT) by wretcher207
// https://github.com/wretcher207/claude-visualizer
// F# Major Pentatonic generative ambient music engine — unchanged
(function () {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let padGain = null;
  let delayNode = null;
  let delayFeedback = null;
  let reverbNode = null;
  let isMuted = false;
  let isInitialized = false;
  let padOscillators = [];

  const MASTER_VOLUME = 0.30;
  const PAD_VOLUME = 0.05;

  const SCALE = [
    185.00, 207.65, 233.08, 277.18, 311.13,
    369.99, 415.30, 466.16, 554.37, 622.25,
    739.99, 830.61, 932.33,
  ];

  const LOW = [0, 1, 2, 3, 4];
  const MID = [3, 4, 5, 6, 7, 8];
  const HIGH = [7, 8, 9, 10, 11, 12];

  const TOOL_VOICES = {
    Read:          { register: MID,  style: 'arpUp',    notes: 3, velocity: 0.5 },
    Glob:          { register: MID,  style: 'arpUp',    notes: 2, velocity: 0.45 },
    Grep:          { register: MID,  style: 'arpDown',  notes: 3, velocity: 0.5 },
    WebFetch:      { register: HIGH, style: 'arpUp',    notes: 3, velocity: 0.45 },
    WebSearch:     { register: HIGH, style: 'scatter',  notes: 3, velocity: 0.45 },
    Edit:          { register: MID,  style: 'arpDown',  notes: 3, velocity: 0.6 },
    Write:         { register: MID,  style: 'chord',    notes: 3, velocity: 0.6 },
    Bash:          { register: MID,  style: 'pulse',    notes: 2, velocity: 0.55 },
    Skill:         { register: MID,  style: 'arpUp',    notes: 2, velocity: 0.5 },
    TodoWrite:     { register: LOW,  style: 'arpUp',    notes: 2, velocity: 0.45 },
    Agent:         { register: HIGH, style: 'bloom',    notes: 5, velocity: 0.75 },
    SubagentStart: { register: HIGH, style: 'bloom',    notes: 4, velocity: 0.65 },
    Plan:          { register: LOW,  style: 'chord',    notes: 3, velocity: 0.6 },
    EnterPlanMode: { register: LOW,  style: 'chord',    notes: 3, velocity: 0.55 },
    ExitPlanMode:  { register: MID,  style: 'arpUp',    notes: 3, velocity: 0.55 },
    _default:      { register: MID,  style: 'arpUp',    notes: 2, velocity: 0.5 },
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length)); }
  function pickConsecutive(arr, n, direction) {
    const start = Math.floor(Math.random() * (arr.length - n + 1));
    const indices = [];
    for (let i = 0; i < n; i++) {
      indices.push(arr[direction === 'down' ? (arr.length - 1 - start - i) : (start + i)]);
    }
    return indices;
  }

  function createReverbImpulse(duration, decay) {
    const length = ctx.sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function createDelay() {
    delayNode = ctx.createDelay(2.0);
    delayNode.delayTime.value = 0.375;
    delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.35;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 2000;
    delayFilter.Q.value = 0.5;
    delayNode.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayFilter.connect(masterGain);
  }

  function startPad() {
    if (!ctx || padOscillators.length > 0) return;
    padGain = ctx.createGain();
    padGain.gain.value = isMuted ? 0 : PAD_VOLUME;
    padGain.connect(masterGain);

    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 92.50; osc1.connect(padGain); osc1.start();
    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 138.59;
    const g2 = ctx.createGain(); g2.gain.value = 0.35; osc2.connect(g2); g2.connect(padGain); osc2.start();
    const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = 185.00;
    const g3 = ctx.createGain(); g3.gain.value = 0.15; osc3.connect(g3); g3.connect(padGain); osc3.start();
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.06;
    const lg = ctx.createGain(); lg.gain.value = PAD_VOLUME * 0.35; lfo.connect(lg); lg.connect(padGain.gain); lfo.start();
    padOscillators = [osc1, osc2, osc3, lfo];
  }

  function playVoice(frequency, velocity, startTime, decay) {
    if (!ctx || isMuted) return;
    decay = decay || 4.0;
    const detune = (Math.random() - 0.5) * 8;

    const oscBass = ctx.createOscillator(); oscBass.type = 'sine'; oscBass.frequency.value = frequency / 2; oscBass.detune.value = detune * 0.5;
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = frequency; osc1.detune.value = detune;
    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = frequency * 2; osc2.detune.value = detune + (Math.random() - 0.5) * 6;
    const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = frequency * 3; osc3.detune.value = detune + (Math.random() - 0.5) * 10;

    const gainBass = ctx.createGain(); const gain1 = ctx.createGain(); const gain2 = ctx.createGain(); const gain3 = ctx.createGain();
    gainBass.gain.value = 0; gain1.gain.value = 0; gain2.gain.value = 0; gain3.gain.value = 0;
    const peak = 0.18 * velocity;

    gainBass.gain.setValueAtTime(0, startTime); gain1.gain.setValueAtTime(0, startTime); gain2.gain.setValueAtTime(0, startTime); gain3.gain.setValueAtTime(0, startTime);
    gainBass.gain.linearRampToValueAtTime(peak * 0.45, startTime + 0.04); gainBass.gain.exponentialRampToValueAtTime(0.001, startTime + decay * 1.2);
    gain1.gain.linearRampToValueAtTime(peak, startTime + 0.025); gain2.gain.linearRampToValueAtTime(peak * 0.25, startTime + 0.025); gain3.gain.linearRampToValueAtTime(peak * 0.06, startTime + 0.025);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + decay); gain2.gain.exponentialRampToValueAtTime(0.001, startTime + decay * 0.75); gain3.gain.exponentialRampToValueAtTime(0.001, startTime + decay * 0.5);

    oscBass.connect(gainBass); osc1.connect(gain1); osc2.connect(gain2); osc3.connect(gain3);
    const voiceBus = ctx.createGain(); voiceBus.gain.value = 1.0;
    gainBass.connect(voiceBus); gain1.connect(voiceBus); gain2.connect(voiceBus); gain3.connect(voiceBus);

    const dryGain = ctx.createGain(); dryGain.gain.value = 0.45; voiceBus.connect(dryGain); dryGain.connect(masterGain);
    if (reverbNode) { const rs = ctx.createGain(); rs.gain.value = 0.35; voiceBus.connect(rs); rs.connect(reverbNode); }
    if (delayNode) { const ds = ctx.createGain(); ds.gain.value = 0.25; voiceBus.connect(ds); ds.connect(delayNode); }

    oscBass.start(startTime); osc1.start(startTime); osc2.start(startTime); osc3.start(startTime);
    oscBass.stop(startTime + decay * 1.2 + 0.5); osc1.stop(startTime + decay + 0.5); osc2.stop(startTime + decay * 0.75 + 0.5); osc3.stop(startTime + decay * 0.5 + 0.5);
  }

  function patternArpUp(register, noteCount, velocity) {
    const indices = pickConsecutive(register, noteCount, 'up');
    const spacing = 0.12 + Math.random() * 0.15;
    return indices.map((idx, i) => ({ freq: SCALE[idx], time: i * spacing, velocity: velocity * (0.85 + i * 0.05), decay: 3.5 + Math.random() * 1.5 }));
  }
  function patternArpDown(register, noteCount, velocity) {
    const indices = pickConsecutive(register, noteCount, 'down');
    const spacing = 0.15 + Math.random() * 0.12;
    return indices.map((idx, i) => ({ freq: SCALE[idx], time: i * spacing, velocity: velocity * (1.0 - i * 0.08), decay: 3.0 + Math.random() * 2.0 }));
  }
  function patternChord(register, noteCount, velocity) {
    const indices = pickN(register, noteCount);
    return indices.map((idx, i) => ({ freq: SCALE[idx], time: i * 0.03, velocity: velocity * (0.7 + Math.random() * 0.3), decay: 4.0 + Math.random() * 2.0 }));
  }
  function patternScatter(register, noteCount, velocity) {
    const indices = pickN(register, noteCount);
    return indices.map((idx) => ({ freq: SCALE[idx], time: Math.random() * 0.6, velocity: velocity * (0.6 + Math.random() * 0.4), decay: 3.0 + Math.random() * 2.0 }));
  }
  function patternPulse(register, noteCount, velocity) {
    const idx = pick(register);
    const result = [];
    for (let i = 0; i < noteCount; i++) {
      result.push({ freq: SCALE[idx + (i % 2 === 1 && idx + 2 < SCALE.length ? 2 : 0)], time: i * 0.18, velocity: velocity * (i === 0 ? 1.0 : 0.6), decay: 2.5 });
    }
    return result;
  }
  function patternBloom(register, noteCount, velocity) {
    const indices = pickN(register, noteCount);
    indices.sort((a, b) => a - b);
    const mid = Math.floor(indices.length / 2);
    return indices.map((idx, i) => {
      const d = Math.abs(i - mid);
      return { freq: SCALE[idx], time: d * 0.1, velocity: velocity * (1.0 - d * 0.08), decay: 5.0 + Math.random() * 2.0 };
    });
  }

  const PATTERNS = { arpUp: patternArpUp, arpDown: patternArpDown, chord: patternChord, scatter: patternScatter, pulse: patternPulse, bloom: patternBloom };

  function playToolPhrase(toolName) {
    if (!ctx || isMuted) return;
    const voice = TOOL_VOICES[toolName] || TOOL_VOICES._default;
    const patternFn = PATTERNS[voice.style] || PATTERNS.arpUp;
    const notes = patternFn(voice.register, voice.notes, voice.velocity);
    const now = ctx.currentTime;
    for (const note of notes) { playVoice(note.freq, note.velocity, now + note.time, note.decay); }
  }

  function init() {
    if (isInitialized) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_VOLUME;
    masterGain.connect(ctx.destination);
    reverbNode = ctx.createConvolver();
    reverbNode.buffer = createReverbImpulse(3.5, 2.2);
    reverbNode.connect(masterGain);
    createDelay();
    startPad();
    isInitialized = true;
  }

  window.AmbientAudio = {
    init: init,
    playToolSound: function (toolName) { if (!isInitialized) return; playToolPhrase(toolName); },
    toggleMute: function () {
      if (!ctx) return false;
      isMuted = !isMuted;
      const now = ctx.currentTime;
      if (isMuted) { masterGain.gain.linearRampToValueAtTime(0, now + 0.5); if (padGain) padGain.gain.linearRampToValueAtTime(0, now + 0.5); }
      else { masterGain.gain.linearRampToValueAtTime(MASTER_VOLUME, now + 0.5); if (padGain) padGain.gain.linearRampToValueAtTime(PAD_VOLUME, now + 0.5); }
      return isMuted;
    },
    isMuted: function () { return isMuted; },
    isReady: function () { return isInitialized; },
  };
})();
