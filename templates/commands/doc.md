---
name: doc
description: >
  Generate or update documentation from code. JSDoc, docstrings, README sections,
  API docs, inline comments. Reads the actual code — never guesses signatures.
  Triggers on: "document", "add docs", "generate docs", "update README",
  "add JSDoc", "add docstrings", "API docs", "explain this code in docs".
argument-hint: "[file, function, or 'readme' to update]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /doc — Generate Documentation

$ARGUMENTS

---

## Phase 1: Detect Scope

If $ARGUMENTS is blank, use **AskUserQuestion**:
- What needs documenting? (specific file, function, or project-level README)
- What format? (JSDoc, docstring, README section, API reference)

Detect documentation style already in the project:
```bash
# Check existing doc patterns
grep -r "\/\*\*" --include="*.ts" --include="*.js" -l | head -5
grep -r '"""' --include="*.py" -l | head -5
grep -r "\/\/\/" --include="*.go" -l | head -5
```

**Rule: match the existing doc style.** If the project uses JSDoc, write JSDoc. If it uses Google-style docstrings, use that. Never introduce a new doc format.

---

## Phase 2: Read the Code

Read every function/class/module you're documenting. Extract:
- Function signature (params, return type)
- What it actually does (read the implementation)
- Edge cases and error conditions
- Dependencies and side effects

**Never document from memory or inference.** Read the code, then write the doc.

```bash
# For a specific file
cat {file} | head -100
# For all exports
grep -n "export\|module.exports\|def \|func \|public " {file}
```

---

## Phase 3: Write Documentation

### For inline docs (JSDoc / docstrings):
- One doc block per public function/method/class
- Include: description, @param types, @returns, @throws
- Skip private/internal functions unless explicitly asked
- Keep descriptions to 1-2 sentences — what it does, not how

### For README sections:
- Read existing README first — update, don't duplicate
- Sections: Installation, Usage, API, Configuration, Examples
- Include real code examples that actually work
- Run any example code to verify it works:
```bash
# Verify example works
node -e "{example code}" 2>&1 | head -10
```

### For API reference:
- Group by module/file
- Table format: `| Function | Params | Returns | Description |`
- Include example usage for each endpoint/function

---

## Phase 4: Verify

1. Check docs match the actual code — no stale signatures
2. If examples were written: run them to verify
3. Lint check if doc linter exists:
```bash
# Check for doc linters
npx tsc --noEmit 2>&1 | grep "JSDoc" | head -5
```

---

## Completion Rule

Show:
1. List of documented items: `file:line — function/class name`
2. Sample of the generated docs (first 2-3 blocks)
3. Verification that examples work (if applicable)

Do not say "docs updated" without showing what was written.
