# Repo standards review — world-cup-party

_Date: 2026-07-02 · Profile: app-gold_

## Executive summary

The repo is already in strong shape against Tamir Cohen app-gold standards: README has
badges, hero banner, prerequisites, quick-start, and a license line; the `docs/**` tree is
complete (user + engineering + decisions + architecture + build-and-release); GitHub CI runs
lint / typecheck / test / build / secret-scan on `ubuntu-latest`; dependabot, PR template,
issue templates, CODEOWNERS, LICENSE, and branch protection (1 required review) are all present.
The **employer-IP scan is CLEAN**.

The only remaining gaps are the **multi-agent (L1–L7)** standards — the repo has `CLAUDE.md`
but no canonical `AGENTS.md`, no Cursor rules, no `docs/agent-guidelines/`, no portable skills
dir, and no agent validation command. These are delegated to `multi-agent-repo`.

## Severity summary

| Severity | Count |
|----------|-------|
| P1 | 4 (all multi-agent) |
| P2 | 4 (multi-agent) + 0 real standards |
| P3 | 0 |

## Standards gaps (S1–S7)

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| S4-01 | P2 | Gap scorer reports "CODEOWNERS missing" | **False positive** — `.github/CODEOWNERS` exists (`* @TamirCohen28`) |

No real S1–S7 standards gaps. README, docs, CI/CD, branch governance, hygiene all pass.

## Employer IP scan

**RESULT: CLEAN** — no employer (Wix) IP patterns found. `.npmrc` correctly pins
`registry=https://registry.npmjs.org` (overrides global Wix registry). The `base44` references
are the app's BaaS provider (base44.app), not employer IP.

## Multi-agent appendix (S8 / L1–L7)

| ID | Sev | Finding |
|----|-----|---------|
| L1-01 | P1 | `AGENTS.md` missing at repo root |
| L2-02 | P1 | `CLAUDE.md` does not reference `AGENTS.md` |
| L6-03 | P1 | No `agent:check` / validate command in Makefile or package.json |
| L6-04 | P1 | CI exists but no documented agent validation command |
| L3-01 | P2 | `.cursor/rules/` directory missing |
| L4-02 | P2 | No portable skills directory |
| L5-01 | P2 | `docs/agent-guidelines/` missing |
| L7-01 | P2 | No `check-agent-drift` script |

All delegated to `multi-agent-repo` (polish phase 5).

## Docs read-only notes

README and `docs/**` are complete and well-structured. No P1 docs issues observed. A full
`docs-review` pass runs during polish phase 6.

## Next steps

1. `plan` mode → phase the multi-agent remediation.
2. `polish` mode → branch `feat/repo-standards-setup`, delegate to `multi-agent-repo`, open PR.
