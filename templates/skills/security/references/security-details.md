# Security Details — Full Reference

## Code Vulnerability Patterns (pre-tool-use.js)

AZCLAUDE's PreToolUse hook scans all Edit/Write/MultiEdit operations against these patterns.
Warnings → stderr (write proceeds). Secrets → exit 2 (write blocked).

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
| `hardcoded-secret` | AWS/GH/GL/Slack/npm/GCP/Stripe/SendGrid/PEM key tokens | Any | Credential exposure | **Block** |

**Fix guidance per pattern:**
- `child-process-exec` → use `execFile()` or `spawnSync(['cmd', ['arg1']])` (no shell interpolation)
- `eval` / `new Function` → use `JSON.parse()` for data; avoid string→code entirely
- `dangerouslySetInnerHTML` / `dom-xss` → use `textContent` or sanitize with DOMPurify
- `pickle.*` → use `json.loads()` for serialization; never unpickle external data
- `os.system` → use `subprocess.run(['cmd', 'arg1'], shell=False)`
- `gh-actions-injection` → store event data in env vars before using in `run:` steps
- `weak-crypto` → use `crypto.randomBytes()` / `secrets.token_bytes()`, SHA-256+, AES-GCM
- `prototype-pollution` → use `Object.create(null)`, `Object.freeze()`, avoid dynamic key assignment
- `yaml-unsafe-load` → use `yaml.safe_load()` — always
- `path-traversal` → use `path.resolve()` + validate result starts with allowed base dir
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
