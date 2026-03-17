# Security Details — Full Reference

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
