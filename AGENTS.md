# AGENTS.md

中文版本: `AGENTS.zh-CN.md`

## Scope

These instructions apply to the whole repository.

## Repository Purpose

This repository stores multiple independent research items. Research items are sorted, versioned, and maintained over time. Do not classify them into topic folders unless the user explicitly changes this rule.

## Research Structure

- Keep the single ordered entry point at `research/INDEX.md`.
- Keep the Chinese mirror index at `research/INDEX.zh-CN.md`.
- Put every research item directly under `research/` with a four-digit sortable prefix: `0001-topic-slug/`, `0002-topic-slug/`.
- Do not create category folders such as `ai/`, `market/`, `product/`, or `tech/`.
- Each research item owns its own version history under `versions/`.
- Keep the latest readable summary in both `README.md` and `README.zh-CN.md`.

Expected shape:

```text
research/
  INDEX.md
  INDEX.zh-CN.md
  0001-topic-slug/
    README.md
    README.zh-CN.md
    product.md
    product.zh-CN.md
    technical.md
    technical.zh-CN.md
    versions/
      product/
        v0.1.0.md
        v0.1.0.zh-CN.md
      technical/
        v0.1.0.md
        v0.1.0.zh-CN.md
    assets/
```

## Research Types

- Product research and technical research must be maintained separately.
- Product research uses `product.md` and `product.zh-CN.md`.
- Technical research uses `technical.md` and `technical.zh-CN.md`.
- `README.md` and `README.zh-CN.md` are entry summaries only; do not put full product and technical analysis back into README.
- Product version snapshots live under `versions/product/`.
- Technical version snapshots live under `versions/technical/`.
- Keep top-level research ordering flat; this split is inside each research item, not a category folder under `research/`.

## Documentation Languages

- Maintain English and Chinese documentation as paired files.
- English files use the base filename: `README.md`, `product.md`, `technical.md`, `CONVENTIONS.md`, `research/INDEX.md`, `versions/product/v0.1.0.md`.
- Chinese files use the `.zh-CN.md` suffix: `README.zh-CN.md`, `product.zh-CN.md`, `technical.zh-CN.md`, `CONVENTIONS.zh-CN.md`, `research/INDEX.zh-CN.md`, `versions/product/v0.1.0.zh-CN.md`.
- Keep paired documents semantically aligned. A conclusion, version, status, source, or path update in one language must be reflected in the other language.
- Do not create category folders for language separation.

## Versioning

- Use `vMAJOR.MINOR.PATCH` filenames for research versions.
- Use `v0.x.y` while the research is exploratory or unstable.
- Bump `MAJOR` when conclusions, scope, or assumptions change incompatibly.
- Bump `MINOR` when new sources, comparisons, or meaningful findings are added.
- Bump `PATCH` for wording fixes, formatting fixes, or citation repairs that do not change conclusions.
- Never overwrite an old version file to represent a new state. Add paired product and/or technical version files, then update the item current files, `README.md`, `README.zh-CN.md`, `research/INDEX.md`, and `research/INDEX.zh-CN.md`.

## Local Skills

- Use `.codex/skills/research-capability` when creating, updating, or reviewing research content.
- Use `.codex/skills/research-repo-conventions` when checking repository structure, naming, version rules, or skill maintenance.
- Keep these repo-local skills alive: if a repeated research workflow gap appears, update the relevant skill instead of only fixing the current document.

## Git

- Write git commit messages according to the repository git commit convention.
- Use `.codex/skills/git-commit-convention` for commit message generation and commit splitting decisions.
- Split unrelated purposes into separate commits. In particular, keep research-content changes separate from repo-local skill or tooling maintenance unless the user asks for one combined commit.
