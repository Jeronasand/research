---
name: research-repo-conventions
description: Use when checking or changing this repository's bilingual research structure, product/technical research split, naming rules, versioning rules, local skills, AGENTS.md instructions, or git commit workflow.
---

# Research Repo Conventions

## Overview

Use this skill when maintaining the repository itself rather than a single research conclusion. It keeps the bilingual research archive ordered, versioned, and consistent.

## Structure Rules

- `research/INDEX.md` is the English ordered index.
- `research/INDEX.zh-CN.md` is the Chinese mirror index.
- Research item directories live directly under `research/`.
- Use `NNNN-topic-slug` names, where `NNNN` is the next unused four-digit number.
- Do not add category folders.
- Keep `README.md` and `README.zh-CN.md` as entry summaries.
- Keep product research in `product.md` and `product.zh-CN.md`.
- Keep technical research in `technical.md` and `technical.zh-CN.md`.
- Keep product snapshots under `versions/product/`.
- Keep technical snapshots under `versions/technical/`.

## Research Type Rules

- Product research and technical research must be separate.
- Product research covers positioning, users, scenarios, features, business/pricing model, competitors, and product risks.
- Technical research covers architecture, deployment, APIs/integrations, data/auth/permission boundaries, observability, operations, and technical risks.
- Do not create top-level `research/product/` or `research/technical/` folders.

## Language Rules

- English files use the base filename: `README.md`, `product.md`, `technical.md`, `CONVENTIONS.md`, `research/INDEX.md`, `versions/product/v0.1.0.md`.
- Chinese files use the `.zh-CN.md` suffix: `README.zh-CN.md`, `product.zh-CN.md`, `technical.zh-CN.md`, `CONVENTIONS.zh-CN.md`, `research/INDEX.zh-CN.md`, `versions/product/v0.1.0.zh-CN.md`.
- Do not create language category folders.
- Keep paired files aligned for version, status, date, conclusion, source, and path changes.

## Version Rules

- Use `vMAJOR.MINOR.PATCH`.
- `MAJOR`: incompatible conclusion, scope, or assumption change.
- `MINOR`: meaningful new source, comparison, or finding.
- `PATCH`: wording, formatting, typo, or citation fix.
- Add paired product and/or technical version files for each meaningful state; do not overwrite historical snapshots.

## Skill Rules

- Repo-local skills live in `.codex/skills/`.
- `research-capability` owns the research creation and update workflow.
- `research-repo-conventions` owns repository rules.
- `git-commit-convention` is installed for git version management and commit message decisions.
- If a workflow rule will recur, update the relevant skill instead of leaving it only in chat.

## Git Rules

- Follow the installed `git-commit-convention` skill for commit messages.
- Split unrelated purposes into separate commits.
- Treat `.codex/skills/` updates as repository maintenance unless the user defines a tighter release unit.
- Do not mix research-content updates and repo-skill updates in one commit unless requested.

## Validation

Before finishing structure or skill changes, run `git diff --check`. For skill changes, also run the skill creator validator when available.
