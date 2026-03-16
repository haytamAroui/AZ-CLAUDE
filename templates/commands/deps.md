---
name: deps
description: >
  Audit project dependencies. Find outdated, vulnerable, and unused packages.
  Triggers on: "audit", "dependencies", "outdated packages", "vulnerable",
  "unused imports", "npm audit", "security scan", "check deps", "update packages".
argument-hint: "[optional: 'outdated', 'security', 'unused', or blank for full audit]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
---

# /deps — Dependency Audit

$ARGUMENTS

---

## Step 1: Detect Package Manager

```bash
ls package.json package-lock.json yarn.lock pnpm-lock.yaml requirements.txt \
   pyproject.toml Cargo.toml go.mod Gemfile 2>/dev/null
```

---

## Step 2: Outdated Check

```bash
# Node.js
npm outdated 2>&1

# Python
pip list --outdated 2>&1 | head -20

# Go
go list -m -u all 2>&1 | head -20
```

Classify each outdated package:
| Type | Risk | Action |
|------|------|--------|
| Patch (1.0.0 → 1.0.1) | Low | Update immediately |
| Minor (1.0.0 → 1.1.0) | Medium | Review changelog, then update |
| Major (1.0.0 → 2.0.0) | High | Use `/migrate` — breaking changes likely |

---

## Step 3: Security Audit

```bash
# Node.js
npm audit 2>&1

# Python
pip audit 2>&1 || safety check 2>&1

# Go
govulncheck ./... 2>&1
```

For each vulnerability:
```
Package:    {name}
Severity:   {critical|high|medium|low}
CVE:        {ID}
Fix:        {version that patches it}
```

---

## Step 4: Unused Dependencies (if $ARGUMENTS includes 'unused' or is blank)

```bash
# Node.js — check package.json deps vs actual imports
cat package.json | grep -A 100 '"dependencies"' | grep '"' | sed 's/.*"\(.*\)".*/\1/' | while read pkg; do
  grep -r "$pkg" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
    -l 2>/dev/null | head -1 | grep -q . || echo "UNUSED: $pkg"
done

# Python — check imports vs requirements
cat requirements.txt 2>/dev/null | sed 's/[>=<].*//' | while read pkg; do
  grep -r "$pkg" --include="*.py" -l 2>/dev/null | head -1 | grep -q . || echo "UNUSED: $pkg"
done
```

---

## Output Format

```
## Dependency Audit — {project name}

### Outdated ({count})
| Package | Current | Latest | Type | Risk |
|---------|---------|--------|------|------|

### Vulnerabilities ({count})
| Package | Severity | CVE | Fix Version |
|---------|----------|-----|-------------|

### Unused ({count})
| Package | Last import found |
|---------|-------------------|

### Recommended Actions
1. {highest priority action}
2. {next action}
3. {next action}
```

Do not say "audit complete" without showing the tables.
