# Security Details — Full Reference

## 4-Hook Security Pipeline Architecture

AZCLAUDE uses Claude Code's native 4-hook infrastructure as a runtime security pipeline.
Zero external dependencies. All state shared via `/tmp/.azclaude-seclog-{PID}` (JSONL).

```
User types prompt
       ↓
[user-prompt.js]  — scans EVERY prompt for injection attempts (before session gate)
       ↓
Claude plans & calls tools
       ↓
[pre-tool-use.js] — intercepts 3 tool types before execution:
  Bash  → blocks curl|bash RCE, destructive rm; warns npm install, env var echo
  Read  → warns on credential file access (.env, secrets.json, id_rsa, .pem)
  Write → 19 code vulnerability pattern rules (see table below)
       ↓                          ↓
[post-tool-use.js]         /tmp/.azclaude-seclog-{PID}
  behavioral sequence             ↑ shared session event log
  Read(.env) → Bash = warn ───────┘ (all 4 hooks write here)
       ↓
[stop.js] — reads seclog, prints session summary, cleans up
  "🔒 Security: 0 blocks, 2 warnings this session"
```

### Session Security Log Format

Each hook appends JSON lines to `/tmp/.azclaude-seclog-{PID}`:
```json
{"ts":"2026-03-23T17:00:00Z","hook":"pre-tool-use","rule":"hardcoded-secret","level":"block","target":"config.js"}
{"ts":"2026-03-23T17:01:00Z","hook":"post-tool-use","rule":"credential-read-then-exec","level":"warn","target":".env → Bash"}
{"ts":"2026-03-23T17:02:00Z","hook":"user-prompt","rule":"prompt-injection-attempt","level":"warn","target":"ignore previous..."}
```

Levels: `block` (exit 2 — Claude Code refuses the action) · `warn` (exit 0 — proceeds with warning)

### Bash Gate Rules (pre-tool-use.js)

| ID | Pattern | Action |
|----|---------|--------|
| `rce-curl-pipe` | `curl ... \| bash` | **Block** |
| `rce-wget-pipe` | `wget ... \| bash` | **Block** |
| `destructive-rm` | `rm -rf /` or `rm -rf ~` | **Block** |
| `shadow-npm-install` | `npm install` without `--ignore-scripts` | Warn |
| `env-var-echo` | `echo $SECRET` / `echo $TOKEN` | Warn |

### Read Gate Rules (pre-tool-use.js)

Files matching: `.env`, `.env.*`, `secrets.json`, `secrets.yaml`, `credentials.json`, `id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, `.pem`, `.p12`, `.pfx`, `.keystore`
→ Warn once per session per file (deduplicated).

### Behavioral Sequence Detection (post-tool-use.js)

| Sequence | Detection | Action |
|----------|-----------|--------|
| `Read(.env) → Bash` | Credential file read then shell execution | Warn |
| `Read(.env) → WebFetch` | Credential file read then external HTTP | Warn |

### Prompt Injection Detection (user-prompt.js)

Fires on **every** user prompt (not just the first). Patterns:
- `ignore [all] previous instructions`
- `disregard [all] previous instructions`
- `override your [rules/instructions/safety]`
- `you are now [a new/different/unrestricted]`

---

## Code Vulnerability Patterns (pre-tool-use.js Write gate)

Scans all Edit/Write/MultiEdit operations. Warnings → stderr. Secrets → exit 2 (blocked).

| ID | Pattern | Language | Risk | Action |
|----|---------|----------|------|--------|
| `gh-actions-injection` | `${{ github.event.` | YAML | Command injection via untrusted event data | Warn |
| `child-process-exec` | `child_process.exec(` | Node.js | Command injection (shell=true) | Warn |
| `new-function` | `new Function(` | JS/TS | Dynamic code execution | Warn |
| `eval` | `eval(` | JS/TS/Python | Code injection | Warn |
| `dangerously-set-inner-html` | `dangerouslySetInnerHTML` | React/JSX | XSS | Warn |
| `dom-xss` | `document.write(` / `.innerHTML =` | JS/TS | DOM XSS | Warn |
| `pickle-deserialization` | `pickle.load(` / `pickle.loads(` | Python | Arbitrary code execution | Warn |
| `os-system` | `os.system(` | Python | Command injection | Warn |
| `weak-crypto` | `MD5`, `SHA1`, `DES`, `Math.random()` | Any | Broken crypto / insecure tokens | Warn |
| `prototype-pollution` | `__proto__`, `constructor.prototype` | JS/TS | Object state corruption / RCE | Warn |
| `yaml-unsafe-load` | `yaml.load(` | Python | Arbitrary code execution | Warn |
| `path-traversal` | `../` in file paths | Any | Arbitrary file read/write | Warn |
| `prompt-injection-write` | `ignore previous instructions` / `{"role":"user","content":` | Any | AI context hijack (CVE-2025-54794) | Warn |
| `subprocess-shell-true` | `subprocess.run(..., shell=True)` / `subprocess.Popen(..., shell=True)` | Python | Command injection via shell metacharacters | Warn |
| `c-gets` | `gets(` | C/C++ | Buffer overflow (removed from C11) | Warn |
| `php-shell-exec` | `shell_exec(` | PHP | Command injection | Warn |
| `java-runtime-exec` | `Runtime.getRuntime().exec(` | Java/Kotlin | Command injection | Warn |
| `jinja2-ssti` | `render_template_string(` | Python/Flask | Server-side template injection | Warn |
| `hardcoded-secret` | AWS/GH/GL/Slack/npm/GCP/Stripe/SendGrid/PEM key tokens | Any | Credential exposure | **Block** |

**Fix guidance per pattern:**
- `child-process-exec` → use `execFile()` or `spawnSync(['cmd', ['arg1']])` (no shell interpolation)
- `eval` / `new Function` → use `JSON.parse()` for data; avoid string→code entirely
- `dangerouslySetInnerHTML` / `dom-xss` → use `textContent` or sanitize with DOMPurify
- `pickle.*` → use `json.loads()` for serialization; never unpickle external data
- `os.system` / `subprocess-shell-true` → use `subprocess.run(['cmd', 'arg1'], shell=False)`
- `gh-actions-injection` → store event data in env vars before using in `run:` steps
- `weak-crypto` → use `crypto.randomBytes()` / `secrets.token_bytes()`, SHA-256+, AES-GCM
- `prototype-pollution` → use `Object.create(null)`, `Object.freeze()`, avoid dynamic key assignment
- `yaml-unsafe-load` → use `yaml.safe_load()` — always
- `path-traversal` → use `path.resolve()` + validate result starts with allowed base dir
- `prompt-injection-write` → review content before writing to files that will be read by AI agents; never embed instruction-like text in project files
- `c-gets` → use `fgets(buf, sizeof(buf), stdin)` or `getline()` — always specify buffer bounds
- `php-shell-exec` → use `escapeshellarg()` / `escapeshellcmd()`, or avoid shell calls entirely
- `java-runtime-exec` → use `new ProcessBuilder(List.of("cmd", "arg1")).start()` with a String array
- `jinja2-ssti` → use `render_template("file.html", ...)` with a file-based template, never render raw strings
- `hardcoded-secret` → use environment variables (`process.env.MY_SECRET` / `os.environ['MY_SECRET']`)

---

## Path Sanitization
File paths with shell metacharacters can cause command injection in hooks.

**Rejected characters**: `;`, `|`, `&`, `` ` ``, `$`, `(`, `)`, `>`, `<`

PostToolUse hooks reject paths outside the project root (`rel.startsWith('..')`)
and skip `node_modules/` and `.git/`.

## Shared-Skill Verification

Skills imported from `~/shared-skills/` could be tampered with between projects.

**On export** (skill promoted to shared after k=10):
```bash
sha256sum "$SKILL_FILE" >> ~/shared-skills/.checksums
```

**On import** (skill copied into project):
```bash
EXPECTED=$(grep "$SKILL_FILE" ~/shared-skills/.checksums | cut -d' ' -f1)
ACTUAL=$(sha256sum "$SKILL_FILE" | cut -d' ' -f1)
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "⚠ Checksum mismatch — file may have been tampered with"
fi
```

Never import a skill that fails checksum verification without user approval.

## Secret Scanning Command
```bash
grep -rn "AKIA\|sk-\|ghp_\|glpat-\|xoxb-" . \
  --include='*.js' --include='*.py' --include='*.ts' \
  --include='*.json' --include='*.yaml' --include='*.env' \
  2>/dev/null | grep -v node_modules | grep -v .git
```

If any match: **block the operation** and show the file:line.

## Security Event Logging
When an agent handles credentials, log to `.claude/memory/security-events.md`:
```
## {date} — {agent-name}
Action: {what was done with credentials}
Files involved: {list}
```
Append only. Never overwrite security event logs.
