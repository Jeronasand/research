---
name: research-capability
description: Use when creating, updating, reviewing, or versioning bilingual English/Chinese research items in this repository. Product research and technical research must be separate. Applies to new research, source-backed investigation, research comparison updates, version bumps, or improving the research workflow skill itself.
---

# Research Capability

## Overview

Use this skill to produce ordered, versioned bilingual research records in this repository. Keep research practical, source-aware, and easy to update later.

## Workflow

1. Inspect `research/INDEX.md`, `research/INDEX.zh-CN.md`, and the target research item, if it already exists.
2. For new research, allocate the next four-digit ID and create `research/NNNN-topic-slug/`.
3. Keep `README.md` and `README.zh-CN.md` as entry summaries.
4. Put product research in `product.md` and `product.zh-CN.md`.
5. Put technical research in `technical.md` and `technical.zh-CN.md`.
6. Store product snapshots in `versions/product/`.
7. Store technical snapshots in `versions/technical/`.
8. Store each meaningful snapshot in paired files such as `versions/product/vMAJOR.MINOR.PATCH.md` and `versions/product/vMAJOR.MINOR.PATCH.zh-CN.md`.
9. Update both `research/INDEX.md` and `research/INDEX.zh-CN.md` after creating or changing an item.

## Research Item Shape

Use this layout:

```text
research/NNNN-topic-slug/
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

Use `assets/` only when supporting files are needed.

## Versioning

- Use `v0.x.y` for drafts and exploratory research.
- Use `v1.0.0` when a stable baseline exists.
- Bump `MAJOR` for incompatible conclusion, scope, or assumption changes.
- Bump `MINOR` for meaningful new sources, comparisons, or findings.
- Bump `PATCH` for wording, formatting, or citation repairs.
- Do not overwrite old version files for a new state.
- Keep English and Chinese version numbers aligned.

## Bilingual Documents

- English files use the base filename: `README.md`, `product.md`, `technical.md`, `research/INDEX.md`, `versions/product/v0.1.0.md`.
- Chinese files use the `.zh-CN.md` suffix: `README.zh-CN.md`, `product.zh-CN.md`, `technical.zh-CN.md`, `research/INDEX.zh-CN.md`, `versions/product/v0.1.0.zh-CN.md`.
- Update paired English and Chinese files in the same change set.
- Keep versions, statuses, dates, conclusions, paths, and sources semantically aligned across languages.

## Product Vs Technical Split

Do not mix product research and technical research in one long document.

Product research covers positioning, user roles, scenarios, feature surface, business/pricing model, competitors, and product risks.

Technical research covers architecture, implementation signals, deployment, APIs/integrations, data/auth/permissions, observability, operational health, and technical risks.

`README.md` and `README.zh-CN.md` should only summarize the item and link to the separated files.

## Source Handling

- Browse or verify current facts when the research depends on recent data, product behavior, pricing, laws, releases, or live documentation.
- Include source titles, URLs, and access or publication dates when useful.
- Separate confirmed facts from assumptions and open questions.
- Do not preserve secrets from logs, screenshots, or payload dumps.

## README Template

Each item `README.md` and `README.zh-CN.md` should stay concise and current.

English template:

```markdown
# Topic Title

Current version: v0.1.0
Status: draft
Last updated: YYYY-MM-DD

## Scope

## Key Findings

## Details

## Open Questions

## Sources
```

Product and technical files use the same header metadata but contain their own scope, findings, risks, next steps, and sources.

Chinese template:

```markdown
# 主题标题

当前版本: v0.1.0
状态: draft
最后更新: YYYY-MM-DD

## 范围

## 关键结论

## 详情

## 待确认问题

## 来源
```

## Skill Improvement

If a repeated research workflow gap appears, update this skill. Keep research-content changes and skill-maintenance changes separate when committing unless the user asks otherwise.
