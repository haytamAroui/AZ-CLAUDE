# Toolchain Gate — Verify Before Ship

This capability is loaded by the orchestrator, milestone-builder, and /setup.
It defines how agents detect, install, and verify the project's toolchain — and how
logs flow between agents as context for fix dispatches.

---

## Stack-to-Command Mapping

The source of truth for every verification command. Agents never guess — they look up.

| Stack signal | Quick verify (Tier 1) | Scoped test (Tier 2) | Full build (Tier 3) | Install deps | Install tool |
|-------------|----------------------|---------------------|--------------------|--------------|----|
| `Cargo.toml` | `cargo check 2>&1` | `cargo test {scope} 2>&1` | `cargo build 2>&1` | `cargo fetch` | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh -s -- -y` |
| `package.json` + TS | `npx tsc --noEmit 2>&1` | `npm test -- --testPathPattern={scope} 2>&1` | `npm run build 2>&1` | `npm install` | `curl -fsSL https://fnm.vercel.app/install \| bash && fnm install --lts` |
| `package.json` (JS only) | `npx eslint src/ 2>&1 \|\| true` | `npm test 2>&1` | `npm run build 2>&1` | `npm install` | same as above |
| `pyproject.toml` / `requirements.txt` | `python -m py_compile {files} 2>&1` | `python -m pytest {scope} -x 2>&1` | `python -m pytest 2>&1` | `pip install -r requirements.txt` or `pip install -e .` | `curl -fsSL https://pyenv.run \| bash` |
| `go.mod` | `go vet ./... 2>&1` | `go test ./{scope}/... 2>&1` | `go build ./... 2>&1` | `go mod download` | `curl -fsSL https://go.dev/dl/ (manual)` |
| `Gemfile` | `ruby -c {files} 2>&1` | `bundle exec rspec {scope} 2>&1` | `bundle exec rspec 2>&1` | `bundle install` | `curl -fsSL https://get.rvm.io \| bash` |
| `pubspec.yaml` | `dart analyze 2>&1` | `dart test {scope} 2>&1` | `dart compile exe 2>&1` | `dart pub get` | manual |
| `Makefile` (C/C++) | `make -n 2>&1` | `make test 2>&1` | `make 2>&1` | — | system package manager |
| `*.sln` / `*.csproj` | `dotnet build --no-restore 2>&1` | `dotnet test {scope} 2>&1` | `dotnet build 2>&1` | `dotnet restore` | `winget install Microsoft.DotNet.SDK.8` |

**Multi-stack projects:** If both `Cargo.toml` and `package.json` exist, chain: `cargo check && npx tsc --noEmit`.
Store all applicable commands in the `Verify:` field, joined by `&&`.

**Custom overrides:** If the project has a `Makefile` with a `check` target, or `package.json` has a `"check"` script, prefer those over the table above. Project conventions beat defaults.

---

## Toolchain Detection Protocol

Run by env-scan.sh and /setup. Output determines the `Verify:` field in CLAUDE.md.

### Step 1: Detect stack files
```bash
ls package.json Cargo.toml go.mod pyproject.toml requirements.txt Gemfile pubspec.yaml *.sln *.csproj Makefile 2>/dev/null
```

### Step 2: Check tool availability
```bash
# For each detected stack, check the runtime
command -v node   2>/dev/null && node --version   || echo "node=missing"
command -v cargo  2>/dev/null && cargo --version   || echo "cargo=missing"
command -v python3 2>/dev/null && python3 --version || echo "python=missing"
command -v go     2>/dev/null && go version         || echo "go=missing"
command -v ruby   2>/dev/null && ruby --version     || echo "ruby=missing"
command -v dotnet 2>/dev/null && dotnet --version   || echo "dotnet=missing"
```

### Step 3: Check dependencies installed
```bash
[ -d node_modules ] && echo "node_deps=installed" || echo "node_deps=missing"
[ -d target ]       && echo "rust_deps=fetched"   || echo "rust_deps=missing"
[ -d venv ] || [ -d .venv ] && echo "py_venv=found" || echo "py_venv=missing"
[ -d vendor ]       && echo "vendor=found"         || echo "vendor=missing"
```

### Step 4: Check for custom verify scripts
```bash
# package.json custom scripts
node -e "const p=require('./package.json'); console.log(p.scripts?.check || p.scripts?.typecheck || p.scripts?.lint || 'none')" 2>/dev/null
# Makefile targets
grep -q '^check:' Makefile 2>/dev/null && echo "makefile_check=true"
```

### Step 5: Compose verify command
Use the mapping table + any custom overrides detected in Step 4.
Write result to CLAUDE.md `Verify:` field.

---

## Toolchain Bootstrap Protocol

Run by orchestrator before first dispatch, or by /setup at project init.

### Mode: Interactive (/setup, /add, /fix)
```
1. Detect missing tools (Step 2 above)
2. If missing: WARN user, ASK before installing
   "cargo is not installed but Cargo.toml exists. Install Rust via rustup? (y/n)"
3. If user says no → log: "Verification disabled for Rust — cargo not available"
4. If user says yes → install, verify, continue
5. Install dependencies if missing (npm install, cargo fetch, etc.)
6. Run quick_verify once as smoke test
```

### Mode: Autonomous (/copilot)
```
1. Detect missing tools
2. If missing AND installer available → install automatically
   Log to .claude/logs/bootstrap.log
3. If missing AND no installer → WARN in goals.md, continue without verification
   "⚠ Verification degraded: {tool} not available. Agents will skip Tier 1 checks."
4. Install dependencies
5. Run quick_verify
6. FAIL → fix before ANY agent dispatches (this IS the foundation)
```

### Bootstrap log
All install output goes to `.claude/logs/bootstrap.log`:
```bash
{install_command} 2>&1 | tee .claude/logs/bootstrap.log
```

---

## Verification Tiers

### Tier 1: Static Verification (MANDATORY — every agent, every mode)

**What:** Type-check, lint, or syntax-check without building or running tests.
**Cost:** 2–30 seconds.
**Catches:** Type errors, missing imports, syntax errors, undeclared variables.

```bash
# Agent runs this BEFORE reporting done
{quick_verify_cmd} 2>&1 | tee .claude/logs/verify-log-M{N}.md
```

**Rules:**
- If errors exist in YOUR files → fix them (counts as a self-correction attempt)
- If errors exist in OTHER files → report but do NOT fix
- If tool is not installed → skip with warning in verify log
- MUST run even in worktree mode — the worktree has its own clean state

### Tier 2: Scoped Test Verification (MANDATORY — every agent)

**What:** Run tests scoped to the agent's files only.
**Cost:** 10–60 seconds.
**Catches:** Logic errors, regression, missing test coverage.

```bash
# Parallel mode: scoped to agent's directory
{scoped_test_cmd} 2>&1 | tee -a .claude/logs/verify-log-M{N}.md

# Sequential mode: full test suite
{full_test_cmd} 2>&1 | tee -a .claude/logs/verify-log-M{N}.md
```

### Tier 3: Full Build Verification (verification waves only — NOT per-agent)

**What:** Full compilation, bundling, linking.
**Cost:** 30–300 seconds.
**Catches:** Linking errors, bundle issues, cross-module type mismatches.

```bash
# Orchestrator runs this after merging ALL agents in a wave
{full_build_cmd} 2>&1 | tee .claude/logs/build-wave{N}.log
```

**Tier 3 is NEVER run by individual agents.** It's too slow and in parallel mode it would verify a partial codebase.

---

## Log Protocol

### Log directory structure

```
.claude/logs/
├── bootstrap.log              ← Level 1: toolchain install output
├── verify-log-M1A.md          ← Level 2: per-agent Tier 1+2 output
├── verify-log-M1B.md
├── verify-log-M2A.md
├── runtime-M1A.log            ← runtime crash output (when agent runs the app)
├── runtime-M2C.log
├── build-wave1.log            ← post-merge full build (Tier 3)
├── build-wave2.log
├── integration-final.log      ← final integration test output
└── session-summary.log        ← stop.js writes final tally
```

### Log Type 1: Verify Logs (per agent)

Written by milestone-builder after running Tier 1+2. Format:

```markdown
## Verify Log — M{N}: {title}

### Tier 1: Static ({command})
Status: PASS | FAIL
Errors: {count}
Warnings: {count}
{first 50 lines of output if errors or warnings}

### Tier 2: Scoped Tests ({command})
Status: PASS | FAIL
Tests: {pass}/{total}, {failures} failures, {duration}
{first 30 lines of output if failures}

### Tier 3: Build
Status: SKIPPED (per-agent — runs in verification wave only)

### Self-Correction History
Attempt 1: {what happened}
  Fix: {what was changed}
Attempt 2: {result}
```

### Log Type 2: Runtime Logs (crash capture)

Written when an agent runs the application and it crashes. The agent captures stderr:

```bash
# Run app with timeout, capture all output, don't let crash stop execution
timeout 15 {run_command} 2>&1 | tee .claude/logs/runtime-M{N}.log; exit 0
```

The `exit 0` prevents Claude Code from treating the crash as a Bash tool failure.
The agent then reads the log and has full stack trace context to diagnose the issue.

**When to capture runtime logs:**
- Agent's milestone involves a new endpoint, route, or page → run the app briefly
- Agent's milestone changes startup logic → run the app to verify it starts
- Agent's milestone changes a background job → run it once to verify
- Do NOT run the full app for every milestone — only when the milestone directly affects runtime behavior

### Log Type 3: Build Logs (verification wave)

Written by the orchestrator after merging all agents in a wave:

```bash
# After all Wave N branches merged:
{full_build_cmd} 2>&1 | tee .claude/logs/build-wave{N}.log
echo "EXIT=$?" >> .claude/logs/build-wave{N}.log
```

If the build fails, the orchestrator reads the log, identifies which file caused the error,
traces it back to which agent's merge introduced it, and dispatches a fix agent.

---

## Log Relay — Logs as Context for Fix Agents

**This is the key architectural insight: logs are not just records — they are inputs to future agents.**

When the orchestrator dispatches a fix agent after a post-merge failure, it constructs the prompt from logs:

```markdown
## Fix Agent — Post-Wave {N} Build Failure

### Build Log
<build-log>
{contents of .claude/logs/build-wave{N}.log — last 100 lines}
</build-log>

### Agent Verify Logs Summary
{for each agent in this wave:}
- M{A}: {PASS/FAIL} — {error count} errors, {warning count} warnings
  {any warnings that look related to the build failure}

### Runtime Logs (if any)
{contents of .claude/logs/runtime-M{X}.log if it exists for this wave}

### Diagnosis
The build error at {file}:{line} was introduced by M{X}'s merge.
M{X}'s verify log shows: {relevant warning or pass-despite-issue}
The type mismatch suggests {analysis}.

### Your Task
Fix the errors in the build log. The verify logs and diagnosis above give you
full context. Do NOT re-investigate — the logs tell the story.
```

**Rules for log relay:**
- Include only the RELEVANT portion of each log (last 100 lines of build, relevant warnings from verify)
- Never relay the full bootstrap.log — it's only useful for debugging install issues
- Verify logs are small (< 2KB each) — safe to include in full
- Build logs can be large — tail to last 100 lines
- Runtime logs can be large — include only the stack trace (grep for "Error:", "panic:", "FATAL")

---

## CLAUDE.md Verify Field

`/setup` writes this to the project's CLAUDE.md after running toolchain detection:

```markdown
## Verify
Quick: {Tier 1 command}
Test: {Tier 2 command}
Build: {Tier 3 command}
```

Example for a Rust + Svelte project:
```markdown
## Verify
Quick: cargo check && npx svelte-check
Test: cargo test && npm test
Build: cargo build --release && npm run build
```

Every agent reads this field. No agent guesses the verify command.
If the field is missing → agent runs toolchain detection inline (slower but safe).

---

## Cleanup Protocol

Logs accumulate across waves. Clean up after ship:

```bash
# After /ship completes successfully:
mkdir -p .claude/logs/archive
mv .claude/logs/*.log .claude/logs/*.md .claude/logs/archive/ 2>/dev/null
echo "Archived $(date -u +%Y-%m-%dT%H:%M:%S)" > .claude/logs/archive/README.md
```

**Do NOT delete logs before ship** — they may be needed for fix agents.
**Do NOT commit logs to git** — add `.claude/logs/` to `.gitignore`.

---

## Integration Points

| Component | How it uses toolchain-gate |
|-----------|--------------------------|
| `/setup` | Runs detection protocol, writes `Verify:` to CLAUDE.md |
| `env-scan.sh` | Outputs `toolchain` + `verify_cmd` in JSON |
| `problem-architect` | Reads `Verify:` field, adds `Verify:` to Team Spec per milestone |
| `milestone-builder` | Runs Tier 1+2 exit gate, writes verify-log, captures runtime logs |
| `orchestrator` | Runs bootstrap, runs Tier 3 between waves, relays logs to fix agents |
| `blueprint` | Includes toolchain check in Wave 0 foundation |
| `.gitignore` | Must include `.claude/logs/` |
