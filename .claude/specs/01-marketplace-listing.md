# Spec: Claude Code Marketplace Listing
id: 01-marketplace-listing
created: 2026-03-22
status: done
clarified: 2026-03-22
version: 1

---

## Goal
Get AZCLAUDE listed on the Claude Code plugin marketplace so users can discover and install it with one click. The plugin files exist but are stale (v0.4.12, wrong repo URLs, old counts). This spec covers updating them to v0.4.18 accuracy and submitting the listing.

## User Stories
- As a Claude Code user, I want to find AZCLAUDE in the marketplace so I can install it without knowing the npm package name
- As a Claude Code user, I want to see an accurate description (33 commands, 13 agents) so I know what I'm getting before installing
- As haytamAroui, I want the listing to point to the correct repo (AZ-CLAUDE-COPILOT) so users land on the right GitHub page

## Acceptance Criteria

1. Given `.claude-plugin/plugin.json`, when read, then `version` is `0.4.18`, `description` mentions "33 commands, 13 agents", `repository` points to `haytamAroui/AZ-CLAUDE-COPILOT`, and `homepage` points to `AZ-CLAUDE-COPILOT`
2. Given `.claude-plugin/marketplace.json`, when read, then `plugins[0].version` is `0.4.18`, `source.repo` is `haytamAroui/AZ-CLAUDE-COPILOT`, `description` mentions "33 commands, 13 agents", and all URLs reference `AZ-CLAUDE-COPILOT`
3. Given both plugin files updated, when `bash tests/test-features.sh` runs, then all tests pass (1357+)
4. Given the updated files, when a marketplace reviewer reads the description, then the spec-driven workflow (/spec, /analyze, /constitute) and smart onboarding banner are mentioned as key features
5. Given the listing is live, when a user installs via marketplace, then `npx azclaude-copilot@latest` is the documented install command (not `setup --full`)

## Data Model Changes
- `.claude-plugin/plugin.json` — update: version, description (counts + new features), repository URL, homepage URL
- `.claude-plugin/marketplace.json` — update: version, description (counts + new features), source.repo URL, homepage URL

## API / Interface Changes
No API changes. File-only updates.

## Out of Scope (this version)
- Creating a GitHub release page with full changelog
- Adding screenshots or demo GIFs to the listing
- Translating the description to other languages
- Automating plugin file version bumps as part of the release process

## Failure Modes
| Scenario | Expected behavior |
|----------|-------------------|
| Marketplace submission rejected | Review rejection reason, fix listed issues, resubmit |
| Wrong repo URL in plugin.json | Users land on old AZ-CLAUDE repo — test URLs before submit |
| Description too long for marketplace | Trim to fit limit while keeping key features visible |

## Constraints
- Performance: none
- Security: no credentials or tokens in plugin files
- Backwards compatibility: plugin file format must match Claude Code marketplace schema
- Dependencies: requires knowing the exact marketplace submission URL/process

## Open Questions
- [x] What is the exact Claude Code marketplace submission process? → Web form submission (resolved 2026-03-22)
