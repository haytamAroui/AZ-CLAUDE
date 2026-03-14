#!/bin/bash

PASS=0
FAIL=0
ERRORS=""

check() {
  local desc="$1"
  local file="$2"
  local pattern="$3"

  if grep -qi "$pattern" "$file" 2>/dev/null; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    ERRORS="$ERRORS\n  FAILED: $desc\n    File: $file\n    Pattern: $pattern"
    FAIL=$((FAIL + 1))
  fi
}

check_file() {
  local desc="$1"
  local file="$2"
  if [ -f "$file" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    ERRORS="$ERRORS\n  FAILED: $desc\n    File missing: $file"
    FAIL=$((FAIL + 1))
  fi
}

ROOT="$(cd "$(dirname "$0")" && pwd)/templates"
CAP="$ROOT/capabilities"
SHARED="$CAP/shared"
LVL="$CAP/level-builders"
EVOL="$CAP/evolution"
INTEL="$CAP/intelligence"
CMD="$ROOT/commands"
ORCH="$ROOT/agents/orchestrator-init.md"
MANIFEST="$CAP/manifest.md"

echo ""
echo "════════════════════════════════════════════════════"
echo "  AZCLAUDE Feature Tests"
echo "════════════════════════════════════════════════════"

# ─────────────────────────────────────────────
echo ""
echo "[ File Structure — All Templates Present ]"
# ─────────────────────────────────────────────
check_file "manifest.md exists"                          "$MANIFEST"
check_file "CLAUDE.md template exists"                   "$ROOT/CLAUDE.md"
check_file "orchestrator-init.md exists"                 "$ORCH"
check_file "loop-controller.md exists"                   "$ROOT/agents/loop-controller.md"
check_file "env-scan.sh script exists"                   "$ROOT/scripts/env-scan.sh"
check_file "shared/tdd.md exists"                        "$SHARED/tdd.md"
check_file "shared/completion-rule.md exists"            "$SHARED/completion-rule.md"
check_file "shared/session-rhythm.md exists"             "$SHARED/session-rhythm.md"
check_file "shared/friction-log.md exists"               "$SHARED/friction-log.md"
check_file "shared/5-layer-agent.md exists"              "$SHARED/5-layer-agent.md"
check_file "shared/vocabulary-transform.md exists"       "$SHARED/vocabulary-transform.md"
check_file "shared/multi-cli-paths.md exists"            "$SHARED/multi-cli-paths.md"
check_file "shared/quality-check.md exists"              "$SHARED/quality-check.md"
check_file "level1-claudemd.md exists"                   "$LVL/level1-claudemd.md"
check_file "level2-mcp.md exists"                        "$LVL/level2-mcp.md"
check_file "level3-skills.md exists"                     "$LVL/level3-skills.md"
check_file "level4-memory.md exists"                     "$LVL/level4-memory.md"
check_file "level5-agents.md exists"                     "$LVL/level5-agents.md"
check_file "level6-hooks.md exists"                      "$LVL/level6-hooks.md"
check_file "level7-extmcp.md exists"                     "$LVL/level7-extmcp.md"
check_file "level8-orchestrated.md exists"               "$LVL/level8-orchestrated.md"
check_file "evolution/detect.md exists"                  "$EVOL/detect.md"
check_file "evolution/generate.md exists"                "$EVOL/generate.md"
check_file "evolution/evaluate.md exists"                "$EVOL/evaluate.md"
check_file "evolution/cycle2-knowledge.md exists"        "$EVOL/cycle2-knowledge.md"
check_file "evolution/cycle3-topology.md exists"         "$EVOL/cycle3-topology.md"
check_file "evolution/re-derivation.md exists"           "$EVOL/re-derivation.md"
check_file "intelligence/debate.md exists"               "$INTEL/debate.md"
check_file "intelligence/opro.md exists"                 "$INTEL/opro.md"
check_file "intelligence/elo.md exists"                  "$INTEL/elo.md"
check_file "intelligence/pipeline.md exists"             "$INTEL/pipeline.md"
check_file "intelligence/experiment.md exists"           "$INTEL/experiment.md"
check_file "commands/dream.md exists"                    "$CMD/dream.md"
check_file "commands/setup.md exists"                    "$CMD/setup.md"
check_file "commands/fix.md exists"                      "$CMD/fix.md"
check_file "commands/evolve.md exists"                   "$CMD/evolve.md"
check_file "commands/debate.md exists"                   "$CMD/debate.md"
check_file "commands/persist.md exists"                  "$CMD/persist.md"
check_file "commands/level-up.md exists"                 "$CMD/level-up.md"
check_file "commands/ship.md exists"                     "$CMD/ship.md"
check_file "commands/status.md exists"                   "$CMD/status.md"
check_file "commands/explain.md exists"                  "$CMD/explain.md"
check_file "commands/loop.md exists"                     "$CMD/loop.md"
check_file "commands/add.md exists"                      "$CMD/add.md"
check_file "commands/review.md exists"                   "$CMD/review.md"
check_file "commands/test.md exists"                     "$CMD/test.md"
check_file "commands/plan.md exists"                     "$CMD/plan.md"

# ─────────────────────────────────────────────
echo ""
echo "[ Manifest — Capability Index ]"
# ─────────────────────────────────────────────
check "Manifest has version"                     "$MANIFEST" "version:"
check "Manifest has last_updated"                "$MANIFEST" "last_updated:"
check "shared/tdd.md in manifest"                "$MANIFEST" "shared/tdd.md"
check "shared/5-layer-agent.md in manifest"      "$MANIFEST" "shared/5-layer-agent.md"
check "shared/vocabulary-transform.md in manifest" "$MANIFEST" "shared/vocabulary-transform.md"
check "shared/multi-cli-paths.md in manifest"    "$MANIFEST" "shared/multi-cli-paths.md"
check "shared/quality-check.md in manifest"      "$MANIFEST" "shared/quality-check.md"
check "level3-skills.md in manifest"             "$MANIFEST" "level-builders/level3-skills.md"
check "level5-agents.md in manifest"             "$MANIFEST" "level-builders/level5-agents.md"
check "level6-hooks.md in manifest"              "$MANIFEST" "level-builders/level6-hooks.md"
check "level8-orchestrated.md in manifest"       "$MANIFEST" "level-builders/level8-orchestrated.md"
check "evolution/detect.md in manifest"          "$MANIFEST" "evolution/detect.md"
check "evolution/evaluate.md in manifest"        "$MANIFEST" "evolution/evaluate.md"
check "intelligence/debate.md in manifest"       "$MANIFEST" "intelligence/debate.md"
check "intelligence/pipeline.md in manifest"     "$MANIFEST" "intelligence/pipeline.md"
check "intelligence/experiment.md in manifest"   "$MANIFEST" "intelligence/experiment.md"
check "Load once instruction present"            "$MANIFEST" "reads this file ONCE"
check "Never load full list instruction"         "$MANIFEST" "Never load the full list"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — TDD Iron Law ]"
# ─────────────────────────────────────────────
TDD="$SHARED/tdd.md"
check "Iron Law heading present"                 "$TDD" "Iron Law"
check "No production code without failing test"  "$TDD" "NO PRODUCTION CODE"
check "Test framework auto-detection"            "$TDD" "package.json"
check "requirements.txt detection"              "$TDD" "requirements.txt"
check "Cargo.toml detection"                     "$TDD" "Cargo.toml"
check "TDD not for non-developer domains"        "$TDD" "Writer\|Creative\|non-code\|does not apply"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Completion Rule ]"
# ─────────────────────────────────────────────
COMP="$SHARED/completion-rule.md"
check "Completion Rule heading"                  "$COMP" "Completion Rule"
check "Never say 'should work'"                  "$COMP" "should work"
check "Show actual output requirement"           "$COMP" "output\|result\|proof"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Session Rhythm ]"
# ─────────────────────────────────────────────
SR="$SHARED/session-rhythm.md"
check "ORIENT phase defined"                     "$SR" "ORIENT"
check "WORK phase defined"                       "$SR" "WORK"
check "PERSIST phase defined"                    "$SR" "PERSIST"
check "goals.md read at session start"           "$SR" "goals.md"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Friction Log ]"
# ─────────────────────────────────────────────
FRIC="$SHARED/friction-log.md"
check "ops/observations directory"               "$FRIC" "ops/observations"
check "Friction: harder than it should be"       "$FRIC" "harder than it should be"
check "Friction: repeated from last session"     "$FRIC" "repeated"
check "Developer friction signals"               "$FRIC" "Developer"
check "Writer friction signals"                  "$FRIC" "Writer"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — 5-Layer Agent Structure ]"
# ─────────────────────────────────────────────
AGENT="$SHARED/5-layer-agent.md"
check "Frontmatter template present"             "$AGENT" "name: {agent-name}"
check "skills: field in frontmatter"             "$AGENT" "skills:"
check "permissionMode: acceptEdits in template"  "$AGENT" "permissionMode: acceptEdits"
check "disallowedTools in frontmatter"           "$AGENT" "disallowedTools"
check "maxTurns in frontmatter"                  "$AGENT" "maxTurns"
check "mcpServers in frontmatter"                "$AGENT" "mcpServers"
check "Model routing table: opus"                "$AGENT" "opus"
check "Model routing table: sonnet"              "$AGENT" "sonnet"
check "Model routing table: haiku"               "$AGENT" "haiku"
check "Permission mode: plan for reviewers"      "$AGENT" "plan"
check "background: true pattern documented"      "$AGENT" "background: true"
check "isolation: worktree pattern documented"   "$AGENT" "isolation: worktree"
check "Layer 1 PERSONA defined"                  "$AGENT" "PERSONA"
check "Layer 2 SCOPE defined"                    "$AGENT" "SCOPE"
check "Layer 3 TOOLS defined"                    "$AGENT" "TOOLS"
check "Layer 4 CONSTRAINTS defined"              "$AGENT" "CONSTRAINTS"
check "Layer 5 DOMAIN CONTEXT defined"           "$AGENT" "DOMAIN CONTEXT"
check "Domain context > persona rule"            "$AGENT" "Domain knowledge"
check "Positive directives rule"                 "$AGENT" "POSITIVE DIRECTIVES\|positive directive"
check "Counterexample format shown"              "$AGENT" "Counterexample\|Bad:.*Good:"
check "After Completing section present"         "$AGENT" "After Completing"
check "Waste line present"                       "$AGENT" "brilliantly and forgets everything"
check "patterns.md referenced in learning"       "$AGENT" "patterns.md"
check "antipatterns.md referenced in learning"   "$AGENT" "antipatterns.md"
check "decisions.md referenced in learning"      "$AGENT" "decisions.md"
check "codebase-map.md referenced in learning"   "$AGENT" "codebase-map.md"
check "Spec-First reviewer rule present"         "$AGENT" "SPEC COMPLIANCE\|Spec-First"
check "Do NOT begin Step 2 rule"                 "$AGENT" "Do NOT begin Step 2"
check "Subagent passing rule present"            "$AGENT" "Subagent Passing Rule\|pass ONLY"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Vocabulary Transform ]"
# ─────────────────────────────────────────────
VOCAB="$SHARED/vocabulary-transform.md"
check "Research domain: claims, evidence"        "$VOCAB" "claims, evidence"
check "Compliance domain: obligations"           "$VOCAB" "obligations"
check "Medical domain: protocols"                "$VOCAB" "protocols"
check "Finance domain: positions, signals"       "$VOCAB" "positions, signals"
check "Writing domain: drafts, arguments"        "$VOCAB" "drafts, arguments"
check "Notes column present"                     "$VOCAB" "Notes become"
check "Decisions column present"                 "$VOCAB" "Decisions become"
check "Reviews column present"                   "$VOCAB" "Reviews become"
check "Domain-native language rule"              "$VOCAB" "domain.s language gets used"
check "Apply to agent descriptions rule"         "$VOCAB" "agent descriptions"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Multi-CLI Paths ]"
# ─────────────────────────────────────────────
MULTI="$SHARED/multi-cli-paths.md"
check "Claude Code path table"                   "$MULTI" "Claude Code"
check "Gemini CLI path table"                    "$MULTI" "Gemini CLI\|gemini"
check "Cursor path table"                        "$MULTI" "Cursor\|cursor"
check "Directory-presence detection"             "$MULTI" "\[ -d .claude \]\|if.*-d.*claude"
check "CFG variable substitution rule"           "$MULTI" "CFG\|\\\$CFG"
check "Never hardcode .claude rule"              "$MULTI" "Never hardcode"

# ─────────────────────────────────────────────
echo ""
echo "[ Shared — Quality Check ]"
# ─────────────────────────────────────────────
QC="$SHARED/quality-check.md"
check "Environment check section"                "$QC" "Environment Check"
check "CLAUDE.md check"                          "$QC" "CLAUDE.md"
check "goals.md check"                           "$QC" "goals.md"
check "Commands check (all 11)"                  "$QC" "dream\|setup\|fix\|evolve"
check "Unfilled placeholder detection"           "$QC" "{{"
check "Skill quality check section"              "$QC" "Skill Quality\|RECIPE"
check "Completion rule for quality output"       "$QC" "All checks must show\|pass.*declaring"

# ─────────────────────────────────────────────
echo ""
echo "[ Level 3 — Skills + Commands ]"
# ─────────────────────────────────────────────
L3="$LVL/level3-skills.md"
check "3-level progressive disclosure"           "$L3" "3-Level\|3 level\|three.level\|Layer 1.*Metadata"
check "references/ subdir concept"              "$L3" "references/"
check "500-line body limit"                      "$L3" "500 lines\|500-line\|≤ 500\|under 500"
check "Pushy description rule"                   "$L3" "Pushy\|pushy\|under.trigger\|undertrigger"
check "Bad description example"                  "$L3" "Bad description\|❌"
check "Good description example"                 "$L3" "Good description\|✅"
check "10+ trigger scenarios rule"               "$L3" "10+ trigger\|10 + trigger\|Overtriggering"
check "RECIPE vs REFERENCE distinction"          "$L3" "RECIPE\|REFERENCE"
check "Test: The project has → CLAUDE.md"        "$L3" "The project has"
check "Test: To add a → skill"                   "$L3" "To add a"
check "Command value test"                       "$L3" "deleting the command\|same result.*rewrite"
check "Bad command example"                      "$L3" "thin delegator\|Bad command"
check "Good command example"                     "$L3" "encodes decisions\|Good command"
check "Standard commands: add.md"                "$L3" "add.md"
check "Standard commands: review.md"             "$L3" "review.md"
check "Standard commands: test.md"               "$L3" "test.md"
check "Stack-specific: new-page.md"              "$L3" "new-page.md"
check "Stack-specific: new-endpoint.md"          "$L3" "new-endpoint.md"

# ─────────────────────────────────────────────
echo ""
echo "[ Level 5 — Custom Agents ]"
# ─────────────────────────────────────────────
L5="$LVL/level5-agents.md"
check "Co-change analysis before creating agents" "$L5" "Co-Change\|co-change"
check "git log co-change command"                "$L5" "git log.*diff-filter\|git log.*name-only"
check "Same commits = same agent rule"           "$L5" "same commits.*same agent\|same agent"
check "Testing is a responsibility rule"         "$L5" "Testing is a responsibility"
check "3 focused agents > 6 overlapping"         "$L5" "3 focused\|focused agents.*overlapping"
check "Framework collision detection"            "$L5" "langgraph\|crewai\|autogen"
check "cc- prefix for collision"                 "$L5" "cc-"
check "Not a routing agent rule"                 "$L5" "routing.*belongs in CLAUDE"
check "Pass micro-sections not monoliths"        "$L5" "micro-section\|micro.section"

# ─────────────────────────────────────────────
echo ""
echo "[ Level 6 — Hooks ]"
# ─────────────────────────────────────────────
L6="$LVL/level6-hooks.md"
check "3-layer session safety"                   "$L6" "3-Layer\|3 Layer\|three.layer\|Layer 1.*CLAUDE.md"
check "Layer 1: CLAUDE.md instruction"           "$L6" "Layer 1"
check "Layer 2: UserPromptSubmit hook"           "$L6" "Layer 2"
check "Layer 3: Stop hook"                       "$L6" "Layer 3"
check "PUSH-based not PULL-based"                "$L6" "PUSH-based\|push.based"
check "Global vs project split"                  "$L6" "The split"
check "PostToolUse auto-format section"          "$L6" "PostToolUse\|Auto-Format"
check "prettier command"                         "$L6" "prettier"
check "ruff format command"                      "$L6" "ruff format"
check "black fallback for Python"                "$L6" "black"
check "gofmt command"                            "$L6" "gofmt"
check "CLAUDE_FILE_PATH env var"                 "$L6" "CLAUDE_FILE_PATH"
check "|| true safety on all formatters"         "$L6" "|| true"
check "Session-marker based injection"           "$L6" "session.marker\|session marker\|PPID\|session start"
check "UserPromptSubmit hook behavior"           "$L6" "UserPromptSubmit"
check "Stop hook friction stub"                  "$L6" "friction"

# ─────────────────────────────────────────────
echo ""
echo "[ Level 8 — Decision Matrix ]"
# ─────────────────────────────────────────────
L8="$LVL/level8-orchestrated.md"
check "Decision matrix present"                  "$L8" "Decision Matrix\|decision matrix"
check "8-question matrix"                        "$L8" "8 questions\|8 question\|[1-8]\. "
check "Intelligence layer (Level 8)"             "$L8" "Level 8"
check "Knowledge layer (Level 9)"                "$L8" "Level 9"
check "Self-improving loop (Level 10)"           "$L8" "Level 10"
check "/evolve vs /level-up distinction"         "$L8" "level-up.*evolve\|evolve.*level-up"
check "Only add what matrix says yes to"         "$L8" "overhead.*value\|matrix.*yes"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Detect ]"
# ─────────────────────────────────────────────
DET="$EVOL/detect.md"
check "3-layer retrieval: Layer 1 Search"        "$DET" "Layer 1.*Search\|Layer 1: Search"
check "3-layer retrieval: Layer 2 Filter"        "$DET" "Layer 2.*Filter\|Layer 2: Filter"
check "3-layer retrieval: Layer 3 Read"          "$DET" "Layer 3.*Read\|Layer 3: Read"
check "git log in Layer 1"                       "$DET" "git log"
check "grep keyword search across memory"        "$DET" "grep"
check "Friction scan present"                    "$DET" "Friction scan\|friction scan"
check "ops/observations in friction scan"        "$DET" "ops/observations"
check "Context Rot Classification"               "$DET" "CONTEXT ROT CLASSIFICATION\|Context Rot"
check "CE Pyramid reference"                     "$DET" "CE Pyramid\|Pyramid"
check "SEQUENCE SCAN heading"                    "$DET" "SEQUENCE SCAN\|Sequence Scan"
check "3+ sessions threshold"                    "$DET" "3+ separate sessions\|3.*sessions"
check "INTENTION-OUTCOME SCAN heading"           "$DET" "INTENTION-OUTCOME\|Intention-Outcome"
check "Gap threshold: 2+ occurrences"            "$DET" "2 friction\|2+ occurrences\|appear.*2"
check "Single-occurrence is noise"               "$DET" "Single-occurrence.*noise"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Generate ]"
# ─────────────────────────────────────────────
GEN="$EVOL/generate.md"
check "Contract-First principle"                 "$GEN" "Contract-First\|DUCTILE"
check "Doc-Quality-as-Signal"                    "$GEN" "Doc-Quality\|doc.quality"
check "Self-Applicability Check"                 "$GEN" "Self-Applicability\|QChunker"
check "Frontmatter required in generated files"  "$GEN" "frontmatter\|---"
check "Manifest update rule"                     "$GEN" "manifest"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Evaluate ]"
# ─────────────────────────────────────────────
EVA="$EVOL/evaluate.md"
check "Five Quality Criteria"                    "$EVA" "Five Quality Criteria\|5 Quality\|Quality Criteria"
check "Pass-k Thresholds"                        "$EVA" "Pass-k\|pass.k"
check "TAG: GENERAL or NARROW"                   "$EVA" "GENERAL\|NARROW"
check "Goals Update step"                        "$EVA" "Goals Update\|GOALS UPDATE"
check "Session Summary"                          "$EVA" "Session Summary\|SESSION SUMMARY"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Cycle 2 Knowledge ]"
# ─────────────────────────────────────────────
CY2="$EVOL/cycle2-knowledge.md"
check "HARVEST step present"                     "$CY2" "HARVEST"
check "CONSOLIDATE step present"                 "$CY2" "CONSOLIDATE"
check "PRUNE step present"                       "$CY2" "PRUNE"
check "ENRICH step present"                      "$CY2" "ENRICH"
check "LOG step present"                         "$CY2" "LOG"
check "Importance scoring formula"               "$CY2" "importance.*frequency\|frequency.*recency\|frequency × 3"
check "frequency × 3 weight"                     "$CY2" "frequency.*3\|× 3"
check "recency × 2 weight"                       "$CY2" "recency.*2\|× 2"
check "impact × 5 weight"                        "$CY2" "impact.*5\|× 5"
check "Importance threshold: 30 = promote"       "$CY2" "30\|promote"
check "Archive not delete rule"                  "$CY2" "archive\|Archive"
check "knowledge-index.md enrichment"            "$CY2" "knowledge-index"
check "key_questions format"                     "$CY2" "key_questions"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Cycle 3 Topology ]"
# ─────────────────────────────────────────────
CY3="$EVOL/cycle3-topology.md"
check "INVENTORY step present"                   "$CY3" "INVENTORY"
check "MEASURE step present"                     "$CY3" "MEASURE"
check "OPTIMIZE step present"                    "$CY3" "OPTIMIZE"
check "RECORD step present"                      "$CY3" "RECORD"
check "PRUNE AGENTS step present"                "$CY3" "PRUNE AGENTS\|Prune Agents"
check "UPDATE PIPELINES step present"            "$CY3" "UPDATE PIPELINES\|Update Pipelines"
check "Usage score axis"                         "$CY3" "Usage score\|usage.*score"
check "Quality score axis"                       "$CY3" "Quality score\|quality.*score"
check "topology-map.json schema"                 "$CY3" "topology-map.json"
check "pipelines array in schema"                "$CY3" "\"pipelines\""
check "agents array in schema"                   "$CY3" "\"agents\""
check "influence_score in schema"                "$CY3" "influence_score"
check "Context bleed violation rule"             "$CY3" "full context window.*violation\|context.*violation"

# ─────────────────────────────────────────────
echo ""
echo "[ Evolution — Re-Derivation ]"
# ─────────────────────────────────────────────
REDER="$EVOL/re-derivation.md"
check "Threshold: 10 friction logs"              "$REDER" "10.*friction\|friction.*10"
check "Threshold: 5 same pattern"                "$REDER" "5.*pattern\|pattern.*5"
check "Architectural problem not a patch"        "$REDER" "architectural problem"
check "Step 1: Summarize friction"               "$REDER" "Step 1"
check "Step 2: Identify the pattern"             "$REDER" "Step 2"
check "Step 3: Propose architectural change"     "$REDER" "Step 3"
check "Step 4: Present to user before change"    "$REDER" "Step 4"
check "Step 5: Implement if approved"            "$REDER" "Step 5"
check "Reset friction after re-derivation"       "$REDER" "reset\|Reset"
check "Archive processed observations"           "$REDER" "archive\|Archive"

# ─────────────────────────────────────────────
echo ""
echo "[ Intelligence — Debate ]"
# ─────────────────────────────────────────────
DEB="$INTEL/debate.md"
check "MAXIMALIST role defined"                  "$DEB" "MAXIMALIST"
check "SKEPTIC role defined"                     "$DEB" "SKEPTIC"
check "Fact-check phase present"                 "$DEB" "FACT CHECK\|fact.check"
check "VERIFIED tag defined"                     "$DEB" "\[VERIFIED\]"
check "UNVERIFIED tag defined"                   "$DEB" "\[UNVERIFIED\]"
check "FALSE tag defined"                        "$DEB" "\[FALSE\]"
check "Truth wins not volume"                    "$DEB" "Truth wins\|truth.*volume"
check "Order-independence check"                 "$DEB" "Order-Independence\|order.independence\|position bias"
check "Comparative Binary Framing [Elo-Evolve]"  "$DEB" "Comparative Binary Framing\|Elo-Evolve"
check "Second-order cognition"                   "$DEB" "second.order\|Second-order"
check "Adjusted evidence score"                  "$DEB" "adjusted.*evidence\|evidence.*score"

# ─────────────────────────────────────────────
echo ""
echo "[ Intelligence — OPRO ]"
# ─────────────────────────────────────────────
OPRO="$INTEL/opro.md"
check "OPRO history file"                        "$OPRO" "prompt-history.json"
check "Top scoring instructions signal"          "$OPRO" "top.*scoring\|top 5"
check "Bottom instructions as negative signal"   "$OPRO" "bottom\|negative signal"
check "APE: 3 variants generated"                "$OPRO" "3.*variant\|Variant A\|3 instruction"
check "Variant A"                                "$OPRO" "Variant A"
check "Variant B"                                "$OPRO" "Variant B"
check "Variant C"                                "$OPRO" "Variant C"
check "Write winner back to history"             "$OPRO" "history\|feeds.*next\|write.*back"

# ─────────────────────────────────────────────
echo ""
echo "[ Intelligence — ELO ]"
# ─────────────────────────────────────────────
ELO="$INTEL/elo.md"
check "Pairwise comparison protocol"             "$ELO" "Pairwise\|pairwise"
check "Authoritative ownership rule"             "$ELO" "Authoritative\|authoritative"
check "Comparative Binary Framing"               "$ELO" "Comparative Binary Framing"
check "ELO update formula"                       "$ELO" "elo.*32\|K.*factor\|expected_score"
check "Adjusted evidence score"                  "$ELO" "adjusted_evidence_score"
check "elo-rankings.json schema"                 "$ELO" "elo-rankings.json"
check "debate_elo in schema"                     "$ELO" "debate_elo"
check "agent_elo in schema"                      "$ELO" "agent_elo"
check "pattern_elo in schema"                    "$ELO" "pattern_elo"
check "Cap at 1100 if evidence < 0.5"            "$ELO" "1100\|cap.*ELO\|cap ELO"

# ─────────────────────────────────────────────
echo ""
echo "[ Intelligence — Pipeline ]"
# ─────────────────────────────────────────────
PIPE="$INTEL/pipeline.md"
check "Pipeline Validity Check"                  "$PIPE" "Pipeline Validity Check\|Validity Check"
check "Sequential building block"                "$PIPE" "Sequential"
check "Parallel building block"                  "$PIPE" "Parallel"
check "Reflect building block"                   "$PIPE" "Reflect"
check "Debate building block"                    "$PIPE" "Debate"
check "Summarize building block"                 "$PIPE" "Summarize"
check "Tool-use building block"                  "$PIPE" "Tool-use\|Tool.use"
check "Context passing rule: no bleed"           "$PIPE" "NEVER pass the full context\|no.*bleed"
check "Feature pipeline template"                "$PIPE" "Feature Pipeline\|feature.*pipeline"
check "Fix pipeline template"                    "$PIPE" "Fix Pipeline\|fix.*pipeline"
check "Review pipeline template"                 "$PIPE" "Review Pipeline\|review.*pipeline"
check "Architecture pipeline template"           "$PIPE" "Architecture Pipeline\|architecture.*pipeline"
check "Pipeline schema defined"                  "$PIPE" "Pipeline Schema\|Pipeline:"
check "Knowledge passing structured JSON"        "$PIPE" "structured.*JSON\|JSON.*not prose"
check "Pipeline map in memory"                   "$PIPE" "pipeline-map.md"

# ─────────────────────────────────────────────
echo ""
echo "[ Intelligence — Experiment Agent ]"
# ─────────────────────────────────────────────
EXP="$INTEL/experiment.md"
check "isolation: worktree in frontmatter"       "$EXP" "isolation: worktree"
check "Hypothesis protocol"                      "$EXP" "Hypothesis\|hypothesis"
check "Success criteria defined"                 "$EXP" "Success.*criteria\|success.*criteria"
check "Log success to patterns.md"               "$EXP" "patterns.md"
check "Log failure to antipatterns.md"           "$EXP" "antipatterns.md"
check "Never discard without logging"            "$EXP" "Never discard\|without logging"
check "Merge decision criteria"                  "$EXP" "Merge.*decision\|merge.*criteria"

# ─────────────────────────────────────────────
echo ""
echo "[ Orchestrator-Init — Steps 1-7 ]"
# ─────────────────────────────────────────────
check "Step 1: Scale Detection"                  "$ORCH" "Step 1"
check "env-scan.sh reference"                    "$ORCH" "env-scan.sh"
check "Scale modes: STANDARD"                    "$ORCH" "STANDARD"
check "Scale modes: SKIM"                        "$ORCH" "SKIM"
check "Scale modes: MINIMAL"                     "$ORCH" "MINIMAL"
check "Scale modes: STRUCTURE-ONLY"              "$ORCH" "STRUCTURE-ONLY"
check "Step 2: Signal Extraction"                "$ORCH" "Step 2"
check "Category detection table"                 "$ORCH" "Category\|category"
check "Code category"                            "$ORCH" "Code"
check "Creative category"                        "$ORCH" "Creative"
check "Research category"                        "$ORCH" "Research"
check "Business category"                        "$ORCH" "Business"
check "Skip rules per category"                  "$ORCH" "Skip\|skip"
check "Framework collision warning"              "$ORCH" "Framework collision\|framework.*collision"
check "Step 3: Domain Profile"                   "$ORCH" "Step 3"
check "vocabulary-transform.md reference"        "$ORCH" "vocabulary-transform"
check "blueprint.json written in Step 3"         "$ORCH" "blueprint.json"
check "category field in blueprint"              "$ORCH" "\"category\""
check "complexity field in blueprint"            "$ORCH" "\"complexity\""
check "skip_levels field in blueprint"           "$ORCH" "skip_levels"
check "Step 4: Constraint Cascade"               "$ORCH" "Step 4\|Constraint Cascade"
check "TDD-in-Writer trap documented"            "$ORCH" "TDD.*Writer\|Writer.*TDD"
check "Memory intensity check"                   "$ORCH" "memory.*maintenance\|maintenance.*memory"
check "Step 5: Fill CLAUDE.md"                   "$ORCH" "Step 5"
check "Step 6: Create goals.md"                  "$ORCH" "Step 6"
check "Step 7: Knowledge Index"                  "$ORCH" "Step 7"
check "knowledge-index.md creation"             "$ORCH" "knowledge-index.md"
check "Completion Rule: show both files"         "$ORCH" "Completion Rule\|Show both"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /fix ]"
# ─────────────────────────────────────────────
FIX="$CMD/fix.md"
check "Phase 1: REPRODUCE"                       "$FIX" "REPRODUCE\|Phase 1"
check "Phase 2: INVESTIGATE"                     "$FIX" "INVESTIGATE\|Phase 2"
check "Phase 3: HYPOTHESIZE"                     "$FIX" "HYPOTHESIZE\|Phase 3"
check "Phase 4: FIX"                             "$FIX" "Phase 4.*FIX\|FIX.*Phase 4"
check "Completion rule present"                  "$FIX" "Completion Rule\|should work\|proof"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /setup ]"
# ─────────────────────────────────────────────
SETUP="$CMD/setup.md"
check "Spawns orchestrator-init"                 "$SETUP" "orchestrator-init"
check "Quality check after setup"                "$SETUP" "quality-check\|quality check"
check "No overwrite on existing CLAUDE.md"       "$SETUP" "not overwrite\|existing\|re-run"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /persist ]"
# ─────────────────────────────────────────────
PER="$CMD/persist.md"
check "goals.md update"                          "$PER" "goals.md"
check "Friction log written"                     "$PER" "friction\|ops/observations"
check "Session summary"                          "$PER" "session.*summary\|summary"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /ship ]"
# ─────────────────────────────────────────────
SHIP="$CMD/ship.md"
check "git status check"                         "$SHIP" "git status\|git diff"
check "Secrets check before commit"              "$SHIP" "secret\|\.env\|credentials"
check "git push present"                         "$SHIP" "git push"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /evolve ]"
# ─────────────────────────────────────────────
EVV="$CMD/evolve.md"
check "Routes to evolution capabilities"         "$EVV" "detect\|generate\|evaluate"
check "Cycle composition by need"                "$EVV" "cycle\|Cycle"
check "Loop controller check in /evolve"         "$EVV" "loop-controller"
check "Delegates to loop controller if exists"   "$EVV" "delegate\|Delegate"

# ─────────────────────────────────────────────
echo ""
echo "[ Commands — /level-up ]"
# ─────────────────────────────────────────────
LU="$CMD/level-up.md"
check "Detects current level"                    "$LU" "current level\|detect.*level\|level.*detect"
check "Loads ONE level-builder"                  "$LU" "ONE\|one level"

# ─────────────────────────────────────────────
echo ""
echo "[ CLI Installer — bin/cli.js ]"
# ─────────────────────────────────────────────
CLI="$(cd "$(dirname "$0")" && pwd)/bin/cli.js"
check_file "bin/cli.js exists"                   "$CLI"
check "All 11 commands in COMMANDS array"        "$CLI" "dream.*setup.*fix.*evolve.*debate\|loop.*ship.*status"
check "CLI_TABLE with 5 entries"                 "$CLI" "CLI_TABLE"
check "Claude Code entry in CLI_TABLE"           "$CLI" "Claude Code"
check "Gemini CLI entry in CLI_TABLE"            "$CLI" "Gemini CLI"
check "OpenCode entry in CLI_TABLE"              "$CLI" "OpenCode"
check "Codex CLI entry in CLI_TABLE"             "$CLI" "Codex CLI"
check "Cursor entry in CLI_TABLE"                "$CLI" "Cursor"
check "detectCLI function"                       "$CLI" "detectCLI"
check "executable detection in PATH"             "$CLI" "execSync.*--version\|exe.*--version"
check "HOME dir fallback detection"              "$CLI" "hooksDir.*existsSync\|existsSync.*hooksDir"
check "substitutePaths function"                 "$CLI" "substitutePaths"
check "path substitution replaces .claude/"      "$CLI" "replace.*\.claude\|\.claude.*replace"
check "installRulesFile function"                "$CLI" "installRulesFile"
check "rulesFile parameter used"                 "$CLI" "rulesFile"
check "installGlobalHooks function"              "$CLI" "installGlobalHooks"
check "hooksDir null guard"                      "$CLI" "hooksDir.*null\|!.*hooksDir\|cli\.hooksDir"
check "_azclaude marker"                         "$CLI" "_azclaude"
check "UserPromptSubmit hook installed"          "$CLI" "UserPromptSubmit"
check "Stop hook installed"                      "$CLI" "Stop"
check "Windows compatibility warning"            "$CLI" "Windows\|win32"
check "installCapabilities function"             "$CLI" "installCapabilities"
check "installCommands function"                 "$CLI" "installCommands"
check "installAgents function"                   "$CLI" "installAgents"
check "createDirectories function"               "$CLI" "createDirectories"
check "ensureSharedSkillsDir function"           "$CLI" "ensureSharedSkillsDir"
check "knowledge-index.md stub creation"        "$CLI" "knowledge-index"

# ─────────────────────────────────────────────
echo ""
echo "[ Loop Controller — Level 10 Agent ]"
# ─────────────────────────────────────────────
LC="$ROOT/agents/loop-controller.md"
check_file "loop-controller.md agent exists"             "$LC"
check "model: opus"                                      "$LC" "model:.*opus"
check "Three cycles documented"                          "$LC" "Cycle 1\|Cycle 2\|Cycle 3"
check "Re-derivation check present"                      "$LC" "re-derivation\|Re-Derivation"
check "Delegates to capability files"                    "$LC" "evolution/detect\|evolution/generate"
check "Max improvements rule"                            "$LC" "Max 5\|max 5"
check "Never delete user files rule"                     "$LC" "Never delete\|never delete"
check "Completion rule with metrics"                     "$LC" "Knowledge Health\|metrics"
check "Level 10 builder creates loop controller"         "$LVL/level8-orchestrated.md" "loop-controller"
check "Level 10 complete when criteria"                  "$LVL/level8-orchestrated.md" "loop-controller.*exists\|exists.*loop-controller"

# ─────────────────────────────────────────────
echo ""
echo "[ Security — shared/security.md ]"
# ─────────────────────────────────────────────
SEC="$SHARED/security.md"
check_file "shared/security.md exists"                 "$SEC"
check "Hook integrity concept present"                 "$SEC" "integrity\|sha-256\|hash"
check "Path sanitization rules documented"             "$SEC" "Path sanitization\|metacharacter"
check "Context injection protection present"           "$SEC" "injection\|inject.*context"
check "Credential handling rules present"              "$SEC" "Credential\|secret\|api key"
check "Shared-skill verification concept present"      "$SEC" "checksum\|verify.*skill"
check "Agent permission scoping present"               "$SEC" "least privilege\|permission"

# ─────────────────────────────────────────────
echo ""
echo "[ Core Developer Commands — add / review / test / plan ]"
# ─────────────────────────────────────────────
ADD="$CMD/add.md"
check "/add: AskUserQuestion for vague input"           "$ADD" "AskUserQuestion"
check "/add: TaskCreate for step tracking"              "$ADD" "TaskCreate"
check "/add: TDD — write failing test first"            "$ADD" "failing test"
check "/add: exit-code gate on test run"                "$ADD" "EXIT"
check "/add: pushy description (10+ triggers)"         "$ADD" "implement\|build\|create\|new endpoint\|new component"

REV="$CMD/review.md"
check "/review: EnterPlanMode at start"                 "$REV" "EnterPlanMode"
check "/review: ExitPlanMode at end"                    "$REV" "ExitPlanMode"
check "/review: spec compliance checked first"          "$REV" "Spec compliance"
check "/review: STOP if spec fails"                     "$REV" "STOP if spec"
check "/review: mcp__ide__getDiagnostics in quality"   "$REV" "mcp__ide__getDiagnostics"
check "/review: blocking vs suggestion distinction"     "$REV" "blocking\|suggestion"

TST="$CMD/test.md"
check "/test: mcp__ide__getDiagnostics first"           "$TST" "mcp__ide__getDiagnostics"
check "/test: detect test framework"                    "$TST" "Detect Test Framework\|test framework"
check "/test: exit-code gate"                           "$TST" "EXIT"
check "/test: paste full output (no summarize)"        "$TST" "full output\|never summarize"

PLAN="$CMD/plan.md"
check "/plan: EnterPlanMode at start"                   "$PLAN" "EnterPlanMode"
check "/plan: ExitPlanMode before approval gate"        "$PLAN" "ExitPlanMode"
check "/plan: AskUserQuestion if vague"                 "$PLAN" "AskUserQuestion"
check "/plan: TaskCreate for each step"                 "$PLAN" "TaskCreate"
check "/plan: approval gate before any code"           "$PLAN" "Approve this plan\|approval"
check "/plan: no code written during plan"             "$PLAN" "Do not write any code\|no code written"
check "/plan: risk level stated"                       "$PLAN" "Risk:.*low.*medium.*high\|risk level"
check "/plan: 4+ files trigger guidance"               "$PLAN" "4+ files\|4\+"

SHIP="$CMD/ship.md"
check "/ship: pre-ship gate mcp__ide__getDiagnostics"  "$SHIP" "mcp__ide__getDiagnostics"
check "/ship: pre-ship gate tests must pass"           "$SHIP" "Pre-ship.*blocked\|tests.*pass\|test command.*EXIT"
check "/ship: secret scan before staging"              "$SHIP" "Secret Scan\|secret\|credential"

check "session-rhythm: mcp__ide__getDiagnostics ORIENT" "$SHARED/session-rhythm.md" "mcp__ide__getDiagnostics"
check "session-rhythm: TaskCreate in ORIENT"           "$SHARED/session-rhythm.md" "TaskCreate"
check "session-rhythm: TaskUpdate in WORK"             "$SHARED/session-rhythm.md" "TaskUpdate"

check "orchestrator-init: TaskCreate for init steps"   "$ORCH" "TaskCreate"
check "orchestrator-init: TaskUpdate per step"         "$ORCH" "TaskUpdate"

check "level3-skills: references native-tools.md"      "$LVL/level3-skills.md" "native-tools"
check "level3-skills: copy /add /review /test pattern" "$LVL/level3-skills.md" "add\.md.*review\.md.*test\.md\|add.md\|review.md"

check "CLI installer: add command registered"          "$CLI" "'add'"
check "CLI installer: review command registered"       "$CLI" "'review'"
check "CLI installer: test command registered"         "$CLI" "'test'"
check "CLI installer: plan command registered"         "$CLI" "'plan'"
check "/fix: mcp__ide__getDiagnostics has fallback"   "$CMD/fix.md" "unavailable\|if available\|if.*empty"
check "/test: mcp__ide__getDiagnostics has fallback"  "$CMD/test.md" "unavailable\|if available\|skip this step"
check "/ship: mcp__ide__getDiagnostics has fallback"  "$CMD/ship.md" "unavailable\|if available\|skip"
check "/status: mcp__ide__getDiagnostics has fallback" "$CMD/status.md" "unavailable\|if available\|skip"
check "/review: mcp__ide__getDiagnostics has fallback" "$CMD/review.md" "unavailable\|if available\|skip"
check "level3-skills: correct install path check"      "$LVL/level3-skills.md" "re-run.*npx azclaude\|npx azclaude"

check "CLI installer: sanitizePath function exists"    "$CLI" "sanitizePath"
check "CLI installer: generateIntegrityHash exists"    "$CLI" "generateIntegrityHash"
check "CLI installer: verifyIntegrity exists"          "$CLI" "verifyIntegrity"
check "level6-hooks.md: CLAUDE_FILE_PATH sanitization" "$L6" "case.*CLAUDE_FILE_PATH.*in"
check "manifest.md: security.md listed"                "$MANIFEST" "shared/security.md"

# ─────────────────────────────────────────────
echo ""
echo "[ Native Claude Code Tools Integration ]"
# ─────────────────────────────────────────────
NT="$CAP/shared/native-tools.md"
check_file "native-tools.md exists"                    "$NT"
check "native-tools: AskUserQuestion documented"       "$NT" "AskUserQuestion"
check "native-tools: TaskCreate documented"            "$NT" "TaskCreate"
check "native-tools: EnterPlanMode documented"         "$NT" "EnterPlanMode"
check "native-tools: EnterWorktree documented"         "$NT" "EnterWorktree"
check "native-tools: CronCreate documented"            "$NT" "CronCreate"
check "native-tools: mcp__ide__getDiagnostics documented" "$NT" "mcp__ide__getDiagnostics"
check "native-tools: WebSearch documented"             "$NT" "WebSearch"
check "native-tools: tool→skill mapping table present" "$NT" "Wire into"
check "manifest.md: native-tools.md listed"            "$MANIFEST" "shared/native-tools.md"

DREAM="$CMD/dream.md"
check "/dream: uses AskUserQuestion for intake"        "$DREAM" "AskUserQuestion"
check "/dream: uses TaskCreate per level"              "$DREAM" "TaskCreate"
check "/dream: uses EnterPlanMode for scan"            "$DREAM" "EnterPlanMode"
check "/dream: uses WebSearch for unfamiliar stack"    "$DREAM" "WebSearch"

LOOP="$CMD/loop.md"
check "/loop: uses CronCreate (not prose timer)"       "$LOOP" "CronCreate"
check "/loop: uses CronList"                           "$LOOP" "CronList"
check "/loop: uses CronDelete for stop"                "$LOOP" "CronDelete"
check "/loop: interval→cron mapping table"             "$LOOP" "Cron expression"

FIX="$CMD/fix.md"
check "/fix Phase 1: mcp__ide__getDiagnostics"         "$FIX" "mcp__ide__getDiagnostics"
check "/fix Phase 3: EnterWorktree for medium confidence" "$FIX" "EnterWorktree"
check "/fix self-correction: WebSearch for lib errors" "$FIX" "WebSearch"

SETUP="$CMD/setup.md"
check "/setup: AskUserQuestion if domain ambiguous"    "$SETUP" "AskUserQuestion"
check "/setup: TaskCreate for step tracking"           "$SETUP" "TaskCreate"
check "/setup: TaskUpdate to in_progress"              "$SETUP" "in_progress"

EVOLVE="$CMD/evolve.md"
check "/evolve: EnterWorktree for isolation"           "$EVOLVE" "EnterWorktree"
check "/evolve: ExitWorktree after evaluate"           "$EVOLVE" "ExitWorktree"
check "/evolve: CronCreate for scheduling"             "$EVOLVE" "CronCreate"

LU="$CMD/level-up.md"
check "/level-up: TaskCreate for level being built"    "$LU" "TaskCreate"

STATUS="$CMD/status.md"
check "/status: mcp__ide__getDiagnostics in health"   "$STATUS" "mcp__ide__getDiagnostics"

DEBATE="$CMD/debate.md"
check "/debate: AskUserQuestion if args vague"         "$DEBATE" "AskUserQuestion"
check "/debate: EnterPlanMode during analysis"         "$DEBATE" "EnterPlanMode"
check "/debate: ExitPlanMode before recording"         "$DEBATE" "ExitPlanMode"

echo ""
echo "════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo "  Results: $PASS passed, $FAIL failed, $TOTAL total"
echo "════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  printf "$ERRORS\n"
  echo ""
  exit 1
else
  echo ""
  echo "  All tests passed."
  echo ""
fi
