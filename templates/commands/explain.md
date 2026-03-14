---
name: explain
description: Explain code, errors, or concepts in plain language — no jargon, 2-3 paragraphs max.
argument-hint: "[code snippet, error message, file name, or concept]"
allowed-tools: Read, Grep
---

# /explain — Plain Language Explanation

Explain this to me like I'm not a developer:

$ARGUMENTS

---

Rules:
- Simple, everyday language — no jargon
- If code was pasted: explain what it does step by step
- If an error was pasted: explain what went wrong and how to fix it
- If a file or folder was named: read it and explain what it's for
- If a concept was asked: explain it with a real-world analogy
- Keep it short — 2-3 paragraphs max unless more detail is asked for

If nothing was provided above, ask:
"What would you like me to explain? You can paste code, an error message, a file name, or ask about any concept."
