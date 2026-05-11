# Research Repository Conventions

中文版本: `CONVENTIONS.zh-CN.md`

## Purpose

This repository is an ordered, versioned archive for many research items. The repository optimizes for fast lookup, repeatable updates, and clear history.

## Sorting Model

Research items are sorted by numeric prefix and are not grouped by category.

```text
research/
  INDEX.md
  INDEX.zh-CN.md
  0001-topic-slug/
  0002-topic-slug/
```

Rules:

- Pick the next unused four-digit number when creating a research item.
- Use a short lowercase slug after the number.
- Keep all research item folders at the same level under `research/`.
- Do not introduce category directories.

## Research Item Layout

Each research item should use this shape:

```text
research/0001-topic-slug/
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

`README.md` is the current English entry summary. `README.zh-CN.md` is the aligned Chinese entry summary. Full research content must be split by type:

- product research: `product.md` and `product.zh-CN.md`
- technical research: `technical.md` and `technical.zh-CN.md`

All current files should include:

- title
- current version
- status
- last updated date
- scope
- key findings
- open questions
- source list or source notes

`versions/` stores immutable research snapshots. Product snapshots live under `versions/product/`; technical snapshots live under `versions/technical/`. Add a new version for every meaningful update.

`assets/` is optional and should only hold supporting files that belong to that specific research item.

## Documentation Languages

Maintain English and Chinese documents as pairs:

- English: base filename, such as `README.md`, `product.md`, `technical.md`, `CONVENTIONS.md`, `research/INDEX.md`, `versions/product/v0.1.0.md`.
- Chinese: `.zh-CN.md` suffix, such as `README.zh-CN.md`, `product.zh-CN.md`, `technical.zh-CN.md`, `CONVENTIONS.zh-CN.md`, `research/INDEX.zh-CN.md`, `versions/product/v0.1.0.zh-CN.md`.

When a conclusion, version, status, source, or path changes in one language, update the paired language file in the same change set. Do not create language category folders.

## Research Type Rules

Product research and technical research must be separate inside each research item.

Product research should cover:

- positioning
- user roles and scenarios
- feature surface
- business and pricing model
- competitive angle
- product risks and open product questions

Technical research should cover:

- architecture and implementation signals
- deployment and runtime model
- integrations and APIs
- data, auth, and permission boundaries
- observability and operational health
- technical risks and open technical questions

Do not create `research/product/` or `research/technical/` folders. The top-level research list stays sorted by ID; the product/technical split happens inside each research item.

## Version Rules

Use `vMAJOR.MINOR.PATCH`.

- `MAJOR`: conclusion, scope, or key assumption changes incompatibly.
- `MINOR`: new sources, new comparison dimensions, or meaningful new findings.
- `PATCH`: typo, formatting, citation, or wording corrections.

Use `v0.x.y` for drafts and early research. Use `v1.0.0` when the item reaches a stable baseline.

## Index Rules

`research/INDEX.md` and `research/INDEX.zh-CN.md` must stay ordered by ID. They should show ID, topic, current version, status, updated date, and path.

Statuses:

- `draft`: initial material exists but conclusions are not stable.
- `active`: still being updated with new sources or decisions.
- `stable`: current conclusion is usable as a baseline.
- `archived`: retained for history, no active updates expected.

## Skill Rules

Repo-local skills live under `.codex/skills/`.

- `.codex/skills/research-capability`: how to create and update research content.
- `.codex/skills/research-repo-conventions`: how to maintain this repository's structure and rules.
- `.codex/skills/git-commit-convention`: public skill installed at the pinned version for git commit management.

When a repeated workflow rule is discovered, update the relevant skill so future work reuses it.

## Git Commit Rules

Commit content must follow the repository git commit convention. Use the installed `git-commit-convention` skill before committing.

Split commits by purpose:

- research content updates
- repo convention updates
- repo-local skill updates
- dependency or tooling updates

Do not combine unrelated research and tooling changes unless the user explicitly requests one commit.
