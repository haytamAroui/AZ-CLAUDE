---
name: run
description: >
  Auto-detect the project tech stack and run the appropriate dev server.
  Triggers on: "run the server", "start dev server", "run the app", "start the app",
  "run project", "run dev", "how do I start this", "start this project",
  "run my app", "launch server", "dev server".
  Detects: Node.js, Next.js, Nuxt, Vite, Astro, SvelteKit, Remix, Angular,
  Python (Django, FastAPI, Flask), Rust, Go, Ruby (Rails), PHP (Laravel), Java.
argument-hint: "[stack override | --port <port> | blank for auto-detect]"
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
---

# /run — Run Dev Server

$ARGUMENTS

---

## Step 1 — Parse arguments

**If $ARGUMENTS contains a stack name** (e.g., `/run django`):
→ Skip detection, use the named stack's command from the table in Step 3.

**If $ARGUMENTS contains `--port <number>`**:
→ Append port override to the detected command (e.g., `--port 4000`).

**Default (no arguments)**:
→ Run auto-detection in Step 2.

---

## Step 2 — Auto-detect stack

Run detection in this **exact priority order** — stop at the first match.

Check with: `ls <file>` or `test -f <file>` (do not read file contents unless needed for sub-detection).

### Priority chain

| Priority | File to check | Stack detected | Step to jump to |
|----------|--------------|----------------|-----------------|
| 1 | `package.json` | Node-based — sub-detect framework | Step 2a |
| 2 | `Cargo.toml` | Rust | Step 3 → Rust |
| 3 | `go.mod` | Go | Step 3 → Go |
| 4 | `manage.py` | Django | Step 3 → Django |
| 5 | `pyproject.toml` | Python (FastAPI/Flask) | Step 2b |
| 6 | `requirements.txt` | Python generic | Step 3 → Python generic |
| 7 | `Gemfile` + `config/routes.rb` | Rails | Step 3 → Rails |
| 8 | `composer.json` + `artisan` | Laravel | Step 3 → Laravel |
| 9 | `pom.xml` | Maven/Spring Boot | Step 3 → Java/Maven |
| 10 | `build.gradle` | Gradle/Spring Boot | Step 3 → Java/Gradle |
| 11 | `pubspec.yaml` | Flutter/Dart | Step 3 → Flutter |

If **no file matches**: print `Could not detect stack. Run: /run <stack>` and list available stacks. Stop.

---

### Step 2a — Node sub-detection (package.json found)

**First: check if `"dev"` script exists in package.json:**
```bash
node -e "const p=require('./package.json'); console.log(p.scripts && p.scripts.dev || '')"
```
If non-empty → use `npm run dev` (or `yarn dev` / `pnpm dev` based on lock file presence). Jump to Step 4.

**If no `"dev"` script, check dependencies for framework:**
Read `package.json` dependencies + devDependencies and check for these keys (first match wins):

| Dependency key | Framework | Command | Default port |
|---------------|-----------|---------|--------------|
| `"next"` | Next.js | `npm run dev` | 3000 |
| `"nuxt"` | Nuxt | `npm run dev` | 3000 |
| `"@astrojs/core"` or `"astro"` | Astro | `npm run dev` | 4321 |
| `"@sveltejs/kit"` | SvelteKit | `npm run dev` | 5173 |
| `"vite"` | Vite | `npm run dev` | 5173 |
| `"@remix-run/react"` | Remix | `npm run dev` | 3000 |
| `"@angular/core"` | Angular | `ng serve` | 4200 |
| `"express"` or `"fastify"` or `"hono"` | Node server | `node index.js` or `node src/index.js` | user-defined |
| (none of the above) | Node generic | `npm start` | 3000 |

**If multiple frameworks detected** (e.g., monorepo): list all candidates and ask:
```
Multiple frameworks detected:
  1. Next.js (packages/web)
  2. Express (packages/api)
Which would you like to run? (1/2)
```

Jump to Step 4.

---

### Step 2b — Python sub-detection (pyproject.toml found, no manage.py)

Read `pyproject.toml` and check `[project.dependencies]` or `[tool.poetry.dependencies]`:

| Dependency | Command |
|-----------|---------|
| `fastapi` | `uvicorn main:app --reload` |
| `flask` | `flask run` |
| `starlette` | `uvicorn main:app --reload` |
| (none) | `python -m <package_name>` |

Jump to Step 3.

---

## Step 3 — Command table

| Stack | Command | Default port |
|-------|---------|--------------|
| Rust | `cargo run` | user-defined |
| Go | `go run .` | user-defined |
| Django | `python manage.py runserver` | 8000 |
| FastAPI | `uvicorn main:app --reload` | 8000 |
| Flask | `flask run` | 5000 |
| Python generic | `python app.py` | user-defined |
| Rails | `bundle exec rails server` | 3000 |
| Laravel | `php artisan serve` | 8000 |
| Java/Maven | `mvn spring-boot:run` | 8080 |
| Java/Gradle | `./gradlew bootRun` | 8080 |
| Flutter | `flutter run` | n/a |

---

## Step 4 — Pre-flight check

Before running, check if the target port is already occupied:

**Unix/macOS:** `lsof -ti tcp:<PORT>`
**Windows:** `netstat -ano | findstr ":<PORT> " | grep LISTENING`

If occupied: print
```
Port <PORT> is already in use. Run /kill <PORT> first, then retry.
```
Stop. Do not force-kill automatically — user decides.

---

## Step 5 — Run

Print the detected stack and command before executing:
```
Detected: Next.js
Command:  npm run dev
Port:     3000
```

Then run the command. Stream output to the terminal.

If the process exits with a non-zero code within 5 seconds: print the last 20 lines of output and stop. Do not retry automatically.

---

## Completion rule

The server is running when output contains a "ready" or "listening" line (e.g., `ready on http://localhost:3000`, `Uvicorn running on http://0.0.0.0:8000`).

Print:
```
Server running: http://localhost:<PORT>
Stack: <detected stack>
```

Never say "it should be running." Show the actual server output line.
