# Research Repository Conventions

## Current Contract

This private repository is organized around HTML deliverables:

```text
temptodo/
  待调研.html
  external-web-package/
    index.html
    assets/
research/
  private-index.json
  pending/
    README.md
    tasks.json
    tasks.schema.json
    topic-slug/
      index.html
      assets/
      notes-or-inputs.*
  in-progress/
    topic-slug/
      index.html
      assets/
      data/
      research.json
  completed/
    topic-slug/
      index.html
      assets/
      data/
      research.json
skills/
  research-html-private-index/
    index.html
  oss-dual-bucket-access/
    index.html
web/
  scripts/sync-research-data.mjs
scripts/
  package-oss.mjs
  upload-oss.mjs
  verify-oss.mjs
```

## External Web Inbox

- `temptodo/` is the temporary inbox for Web or HTML files copied from other places.
- Files in `temptodo/` are not part of the canonical repository structure yet.
- An inbox item may be either a single HTML file or a folder containing a complete webpage package.
- Webpage packages may contain CSS, JS, images, fonts, JSON, CSV, or other data files used by the entry HTML.
- Do not include `temptodo/` files in `research/private-index.json`, `web/research-data/manifest.json`, or OSS private data payloads.
- Do not move or rewrite inbox files until the user explicitly asks to sync.

When syncing `temptodo/`, classify each file by content:

- completed research report or finished analysis: `research/completed/<topic-slug>/index.html` plus its assets
- active research report that is not final yet: `research/in-progress/<topic-slug>/index.html` plus its assets
- rough request or task brief: one item in `research/pending/tasks.json`
- source dump, local task materials, or a previewable pending Web package: `research/pending/<topic>/`, referenced from the matching `tasks.json` item
- reusable workflow or skill page: `skills/<skill-id>/index.html` plus its assets
- assets used by a classified HTML page: place beside that target page or under its target folder

After classification, refresh the generated index and data payload.

## Research Catalog

- The private preview is a card catalog with exactly three main sections: `待调研`, `调研中`, and `已完结调研`.
- `待调研` is generated from `research/pending/tasks.json`.
- Pending cards can be previewable when the task has `packagePath` or `research/pending/<id>/index.html`.
- `调研中` is generated from direct child directories under `research/in-progress/`.
- `已完结调研` is generated from direct child directories under `research/completed/`.
- The frontend opens a research package by loading its `index.html` and shows a return-to-catalog button.
- The frontend must not expand every HTML file inside a package into separate cards.

## Research Packages

- Active research packages live as `research/in-progress/<topic-slug>/index.html`.
- Completed research packages live as `research/completed/<topic-slug>/index.html`.
- Keep each package self-contained enough to render in the private preview.
- Prefer simple, readable HTML. Use minimal monochrome styling by default.
- Use directory names that make the topic clear, for example `asksurf-ai-data-api-research`.
- Optional package metadata lives in `research.json` beside `index.html`.
- `research.json` may include `id`, `title`, `summary`, `tags`, `language`, `version`, `updatedAt`, and `entry`.

## Pending Research

- Pending card data lives in `research/pending/tasks.json`.
- The field contract lives in `research/pending/tasks.schema.json`.
- Use `research/pending/<topic>/` for local notes, source files, task materials, or a previewable pending Web package.
- `tasks.json` can include `packagePath` and `entry`; if omitted, the indexer still tries `research/pending/<id>/index.html`.
- When work starts, create or copy the Web package to `research/in-progress/<topic>/`.
- When the research is complete, move or copy the Web package to `research/completed/<topic>/` and refresh the private index.

## HTML Skills

- Skills can be represented as `skills/<skill-id>/index.html`.
- Skill HTML should include a clear title and, when practical, a `skillgenome-ai-context` JSON script block.
- Imported skill pages should preserve source repository, version, update time, and provenance metadata.
- Repository-specific workflow skills should describe the actual local workflow rather than generic advice.

## Private Index JSON

`research/private-index.json` is generated from the repo tree and should contain:

- pending task entries from `research/pending/tasks.json`
- optional pending preview package entries from `research/pending/<task-id>/index.html`
- in-progress research package entries
- completed research package entries
- HTML skill entries
- dual-bucket access metadata
- object keys for upload to `research-pages`

It must not include `temptodo/`; that directory is an unsynced inbox.

Refresh it with:

```bash
node scripts/private-index.mjs
```

Generate private bucket payloads with:

```bash
cd web
npm run sync:data
```

The generated upload root is `web/research-data/`.

## Dual Bucket Rules

- `research-preview`: public preview/auth bucket, app shell and authorization UI only.
- `research-pages`: private content/data bucket, sectioned manifest, pending task JSON, pending preview packages, research packages, and private index only.
- `research-data/manifest.json`: private data manifest consumed by the preview app.
- Browser access uses OSS AK/SK or STS to create signed `GET` requests directly against the private data bucket.
- Do not add backend gateway code unless explicitly requested.
- Validate public preview assets and private data assets separately.

## OSS Packaging And Upload

Root npm scripts are the canonical OSS workflow:

```bash
npm run package:oss
npm run upload:oss:dry-run
npm run upload:oss
npm run verify:oss
```

For data-only changes, use the direct private-data workflow:

```bash
npm run update:data
```

`update:data` refreshes `research/private-index.json`, regenerates `web/research-data/`, packages `dist/oss/content-bucket/research-data/`, uploads only `oss://research-pages/research-data/`, and verifies `research-data/manifest.json`. Use `npm run update:data:dry-run` only when you need a preview.

The package step creates:

- `dist/oss/auth-bucket/` for `oss://research-preview/`
- `dist/oss/content-bucket/research-data/` for `oss://research-pages/research-data/`
- `dist/oss/upload-plan.json` as the local deployment manifest

Upload rules:

- Use `ossutil sync`, not ad hoc object copies.
- Always use explicit endpoint and region flags.
- Auth bucket endpoint/region: `oss-cn-shenzhen.aliyuncs.com` / `cn-shenzhen`.
- Content bucket endpoint/region: `oss-cn-shenzhen.aliyuncs.com` / `cn-shenzhen`.
- Run dry-run first for new prefixes or broad changes.
- `--delete` is destructive and requires `--delete --yes`.
- Do not upload `web/research-data/` to the public auth bucket.
- Do not upload `web/dist/` into the private content bucket.

## Git Commit Rules

- Follow the repository git commit convention.
- Use `type: subject` style when the installed git convention does not require a more specific template.
- Split commits by purpose:
  - research package content
  - private index or data-sync tooling
  - web preview behavior
  - skill page updates
  - docs or governance updates
- Do not stage unrelated dirty files.
