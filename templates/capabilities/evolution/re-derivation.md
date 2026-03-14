---
name: evolution-re-derivation
description: >
  Re-Derivation Protocol. Triggered when friction logs exceed threshold.
  Not a patch — a full architectural rethink of a broken design.
  Load when: friction logs >= 10 AND same pattern appears >= 5 times.
tokens: ~150
---

## RE-DERIVATION PROTOCOL

This fires when patching has stopped working. This is an architectural problem — not a content problem.
Adding more rules to a broken architecture makes it worse, not better.

### Trigger Threshold
```bash
ls ops/observations/ | wc -l
grep -r "{pattern}" ops/observations/ | wc -l
```

If friction logs ≥ 10 AND same pattern appears in ≥ 5 logs:
→ Do NOT patch again.
→ Do NOT add another rule.
→ Run this protocol.

---

### Step 1: Summarize Friction
Read all matching friction logs. Write a 3-sentence summary:
- What keeps failing
- What has already been tried
- What the current design assumed that turned out to be wrong

---

### Step 2: Identify the Pattern
Name the architectural assumption that is failing.
Not the symptom — the root assumption.

Example: "We assumed agents would read their full instruction file. They don't — they skim."

---

### Step 3: Propose Architectural Change
One specific change to the structure, not the content.
Examples:
- Split a monolithic file into micro-sections
- Move a rule from agent instructions to CLAUDE.md (always-hot)
- Replace agent-spawning with direct skill execution
- Add a manifest entry instead of embedding logic in CLAUDE.md

---

### Step 4: Present to User Before Changing
Write a Re-Derivation Proposal:
```
## Re-Derivation Proposal

**Pattern**: {what keeps failing}
**Root assumption that failed**: {what the design assumed}
**Proposed change**: {one architectural change}
**Files affected**: {list}
**Expected result**: {what improves}
```

Do NOT implement until the user approves. Architectural changes affect everything.

---

### Step 5: Implement if Approved
Make the change. Archive processed friction logs:
```bash
mkdir -p ops/observations/archive
mv ops/observations/{matching-logs} ops/observations/archive/
```

Reset friction counter. The architectural change starts a new baseline.
