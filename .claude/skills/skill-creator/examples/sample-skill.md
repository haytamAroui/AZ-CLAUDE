# Example: Security Review Skill

## Input
User asked: "create a skill for security reviews"

## Output: Generated SKILL.md

```yaml
---
name: security-review
description: >
  Security analysis and credential scanning. Use when writing, reviewing,
  fixing, or auditing code for: API keys, secrets, tokens, passwords,
  credentials, .env files, hardcoded values, AKIA, sk-, ghp_, bearer
  tokens, JWT secrets, database connection strings, private keys, SSH keys,
  OAuth secrets, webhook secrets, encryption keys. Also use for: input
  validation, SQL injection, XSS, CSRF, command injection, path traversal,
  eval(), os.system(), exec(), shell commands, file permissions, CORS,
  authentication, authorization, rate limiting, data exposure, error
  leaking stack traces. Trigger on: /review, /ship, security check,
  audit, vulnerability, penetration test, compliance check, OWASP,
  secure coding, hardening. Even if the user doesn't explicitly mention
  security, use this skill whenever code touches authentication, payments,
  user data, file uploads, or external APIs.
---

# Security Review

## When This Fires
Activated for any code change touching security-sensitive areas: auth,
payments, user data, file I/O, external APIs, or credential management.

## Workflow
1. Run the secret scanner. Do NOT read the script file, just execute it:
   ```bash
   bash .claude/skills/security-review/scripts/scan-secrets.sh
   ```
2. Read the output. If matches found, flag each as Critical/High/Medium.
3. Check for OWASP Top 10 patterns in the changed files.
4. Produce a structured review with file:line references.

## Rules
- Always scan for hardcoded secrets before any /ship operation
- Always check input validation on user-facing endpoints
- Always flag eval(), exec(), os.system() with severity High
- Report findings as Critical > High > Medium > Low

## Example
See examples/sample-review.md for a complete security review output.

## References
For OWASP patterns: `references/owasp-patterns.md`
For credential patterns: `references/secret-patterns.md`
```

## Output: Generated script

```bash
#!/usr/bin/env bash
set -euo pipefail
# Scan for hardcoded secrets in the project
echo "## Secret Scan Results"
result=$(grep -rn "AKIA\|sk-\|ghp_\|glpat-\|xoxb-\|password.*=.*['\"]" \
  --include="*.js" --include="*.ts" --include="*.py" \
  --include="*.json" --include="*.yaml" --include="*.env" \
  . 2>/dev/null | grep -v node_modules | grep -v .git || true)
if [ -n "$result" ]; then
  count=$(echo "$result" | wc -l)
  echo "Found $count potential secret(s):"
  echo "$result"
else
  echo "No hardcoded secrets detected."
fi
```
