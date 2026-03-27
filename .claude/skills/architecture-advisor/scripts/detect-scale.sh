#!/usr/bin/env bash
set -euo pipefail
# architecture-advisor/scripts/detect-scale.sh
# Purpose: detect project scale (SMALL/MEDIUM/LARGE) from file count, contributors, age
# Output: structured JSON-like text Claude reads to classify the project

echo "## Project Scale Detection"

# File count (source files only)
SRC_COUNT=$(find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.kt" -o -name "*.swift" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" -not -path "*/__pycache__/*" 2>/dev/null | wc -l | tr -d ' ')
echo "source_files: $SRC_COUNT"

# Contributors
CONTRIBUTORS=$(git shortlog -sn --no-merges 2>/dev/null | wc -l | tr -d ' ' || echo "1")
echo "contributors: $CONTRIBUTORS"

# Project age (days)
FIRST_COMMIT=$(git log --reverse --format="%at" 2>/dev/null | head -1 || echo "")
if [ -n "$FIRST_COMMIT" ]; then
  NOW=$(date +%s)
  AGE_DAYS=$(( (NOW - FIRST_COMMIT) / 86400 ))
  echo "age_days: $AGE_DAYS"
else
  echo "age_days: 0"
fi

# Framework detection
echo ""
echo "## Detected Frameworks"
[ -f "package.json" ] && grep -q "next" package.json 2>/dev/null && echo "- Next.js"
[ -f "package.json" ] && grep -q "react" package.json 2>/dev/null && echo "- React"
[ -f "package.json" ] && grep -q "vue" package.json 2>/dev/null && echo "- Vue"
[ -f "package.json" ] && grep -q "svelte" package.json 2>/dev/null && echo "- Svelte"
[ -f "package.json" ] && grep -q "express" package.json 2>/dev/null && echo "- Express"
[ -f "package.json" ] && grep -q "fastify" package.json 2>/dev/null && echo "- Fastify"
[ -f "pyproject.toml" ] && grep -q "fastapi" pyproject.toml 2>/dev/null && echo "- FastAPI"
[ -f "pyproject.toml" ] && grep -q "django" pyproject.toml 2>/dev/null && echo "- Django"
[ -f "requirements.txt" ] && grep -q "flask" requirements.txt 2>/dev/null && echo "- Flask"
[ -f "go.mod" ] && echo "- Go module"
[ -f "Cargo.toml" ] && echo "- Rust/Cargo"
[ -f "pom.xml" ] && echo "- Java/Maven"
[ -f "build.gradle" ] && echo "- Kotlin/Gradle"

# Database detection
echo ""
echo "## Detected Databases"
grep -rq "prisma\|@prisma" package.json 2>/dev/null && echo "- Prisma ORM"
grep -rq "drizzle" package.json 2>/dev/null && echo "- Drizzle ORM"
grep -rq "supabase" package.json 2>/dev/null && echo "- Supabase"
grep -rq "mongoose\|mongodb" package.json 2>/dev/null && echo "- MongoDB"
grep -rq "redis\|ioredis" package.json 2>/dev/null && echo "- Redis"
grep -rq "sqlalchemy" requirements.txt pyproject.toml 2>/dev/null && echo "- SQLAlchemy"
[ -f "*.db" ] 2>/dev/null || [ -f "*.sqlite" ] 2>/dev/null && echo "- SQLite"

# Scale classification
echo ""
echo "## Classification"
if [ "$SRC_COUNT" -lt 50 ] && [ "$CONTRIBUTORS" -le 2 ]; then
  echo "scale: SMALL"
  echo "guidance: Keep it simple. Flat modules. SQLite or Postgres. No Docker yet. Test critical paths only."
elif [ "$SRC_COUNT" -lt 500 ] && [ "$CONTRIBUTORS" -le 10 ]; then
  echo "scale: MEDIUM"
  echo "guidance: Modular monolith. PostgreSQL. TDD for business logic. Consider deployment automation."
else
  echo "scale: LARGE"
  echo "guidance: Modular monolith + targeted microservices. Full TDD. CI/CD mandatory. Connection pooling."
fi
