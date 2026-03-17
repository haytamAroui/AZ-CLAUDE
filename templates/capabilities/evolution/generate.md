---
name: evolution-generate
description: >
  Load after detect.md has produced a PLAN with specific gaps listed. Load when
  about to write a new skill, agent, or capability file. Load when detect found
  a stale doc, a missing capability, or a broken skill and you are about to fix it.
  Do NOT load before detect — generate without a PLAN produces noise.
tokens: ~250
---

## GENERATE

Run for each item in the PLAN that passed DETECT.

---

### Step 1: Contract-First [DUCTILE]

Before writing any skill or agent, define the contract:

```
Component: {name}

Input:    What context this component receives to do its job
Output:   What it produces in the success case
Failures: What happens when input is wrong or incomplete
```

The contract is the acceptance test. If you cannot fill all three fields clearly,
the component is under-specified. Do not generate it yet — clarify first.

---

### Step 2: Documentation-Quality-as-Signal [DUCTILE]

Before generating, read any existing documentation for this capability:
- < 2 sentences of docs = under-specified component → clarify before building
- Contradictory docs = Confusion rot → classify and resolve first
- No docs at all = treat as net-new, contract-first applies fully

Sparse documentation is a signal, not a gap to fill with code.

---

### Step 3: Generate the File

Write the capability file following the architecture rules:
- ≤ 150 lines
- YAML frontmatter required (name, description, tokens estimate)
- One capability per file — if it's growing beyond 150 lines, split it
- No file reads another file by default — explicit pointers only

**Frontmatter format:**
```yaml
---
name: {capability-name}
description: >
  One paragraph: what this does, when it fires, trigger words.
tokens: ~{estimate}
---
```

---

### Step 4: Self-Applicability Check [QChunker]

After writing the file, read it as if you are an unfamiliar agent seeing it for the first time:
- Can an unfamiliar agent apply this immediately, without reading other files?
- Is it self-contained for its scope?
- Binary: **pass** or **fail**. No partial credit.

If it fails: revise until it passes. Do not ship a file that fails self-applicability.

---

### Step 4.5: Pressure-Test Scenarios (enforcement skills only)

If the skill enforces a process gate (completion, review, TDD, checkpoint):
Load `shared/pressure-test.md` and add a `## Pressure Tests` section to the skill.

Write one scenario per pressure type: time pressure, sunk cost, authority, false confidence.
A skill that can be argued out of is not a skill — it's a suggestion.

Skip this step only if the skill is purely guidance (vocabulary, patterns, reference material).

---

### Step 5: Consider Hook Generation [Hookify]

If the detected friction is **behavioral** (user keeps correcting the same mistake,
Claude keeps producing unwanted output), generate a hook instead of rewriting a prompt.

**When to generate a hook instead of a skill/agent:**
- Same correction appears 3+ times across sessions → PreToolUse or PostToolUse hook
- Pattern is mechanical (e.g., "always run tests after edit") → PostToolUse hook
- Pattern is preventive (e.g., "never use eval()") → PreToolUse hook with matcher

**Hook generation template:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{"type": "command", "command": "bash .claude/hooks/check-pattern.sh"}]
    }]
  }
}
```

**Rule:** Hooks are for mechanical enforcement. Skills are for guided workflows.
If the fix requires reasoning, write a skill. If it requires pattern matching, write a hook.

---

### Step 6: Add to Manifest

After generating a new capability file, add one row to `capabilities/manifest.md`:
```
| {file-path} | {trigger description} | ~{tokens} |
```

This is the ONLY change to existing files. Nothing else needs to change.
The dispatch in CLAUDE.md already says "read manifest.md for unknown capabilities."
