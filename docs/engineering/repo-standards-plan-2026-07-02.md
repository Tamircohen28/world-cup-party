# Repo standards remediation plan — world-cup-party

_Date: 2026-07-02 · Profile: app-gold · Source: repo-standards-review-2026-07-02.md_

The repo passes S1–S7 standards. All remediation is multi-agent (L1–L7), delegated to
`multi-agent-repo`, plus a small `agent:check` wiring task.

## Phase 0 — IP scan
Already CLEAN. No action.

## Phase 1–4 — Standards scaffolding
No real gaps. Banner, CODEOWNERS, docs tree, CI already present. (S4-01 is a false positive.)

## Phase 5 — Multi-agent (primary work)
Delegate to `multi-agent-repo` on branch `feat/repo-standards-setup`:
- L1-01: generate canonical `AGENTS.md`
- L2-02: reference `AGENTS.md` from `CLAUDE.md`
- L3-01: `.cursor/rules/`
- L4-02: portable skills directory
- L5-01: `docs/agent-guidelines/`
- L6-03 / L6-04: `agent:check` / validate command in Makefile + package.json, documented in CI
- L7-01: `check-agent-drift` script

## Phase 6 — Docs review
Run `docs-review`; fix any P1.

## Phase 7 — Exit gate
`assert-contract.sh` → app-gold P1/P2/P3 must be 0. Commit, push, open PR. Never merge here.
