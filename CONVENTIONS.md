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
  financial_crypto_equity_data_sources_supplement_0.2.html
  pending/
    topic-slug/
      README.md
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

- research report or finished analysis: `research/<topic-and-version>.html`
- research report with local assets: `research/<topic-slug>/index.html` plus its assets
- rough request, source dump, or task brief: `research/pending/<topic>/`
- reusable workflow or skill page: `skills/<skill-id>/index.html` plus its assets
- assets used by a classified HTML page: place beside that target page or under its target folder

After classification, refresh the generated index and data payload.

## Research Documents

- Completed single-file research lives as `research/*.html`.
- Completed packaged research with local assets lives as `research/<topic-slug>/index.html`.
- Keep each HTML file self-contained enough to render in the private preview.
- Prefer simple, readable HTML. Use minimal monochrome styling by default.
- Use names that make topic and version clear, for example `financial_crypto_equity_data_sources_supplement_0.2.html`.
- Do not create topic category folders for completed HTML unless the user changes the repository model.

## Pending Research

- Pending work lives under `research/pending/<topic>/`.
- Each pending directory should contain a `README.md`.
- Use the pending directory for collection, notes, source links, and request context before an HTML deliverable exists.
- When the research is complete, add the final HTML file under `research/` and refresh the private index.

## HTML Skills

- Skills can be represented as `skills/<skill-id>/index.html`.
- Skill HTML should include a clear title and, when practical, a `skillgenome-ai-context` JSON script block.
- Imported skill pages should preserve source repository, version, update time, and provenance metadata.
- Repository-specific workflow skills should describe the actual local workflow rather than generic advice.

## Private Index JSON

`research/private-index.json` is generated from the repo tree and should contain:

- completed research HTML entries
- HTML skill entries
- pending research directories
- dual-bucket access metadata
- object keys for upload to `research-datas`

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
- `research-datas`: private content/data bucket, indexed HTML and manifest only.
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

The package step creates:

- `dist/oss/auth-bucket/` for `oss://research-preview/`
- `dist/oss/content-bucket/research-data/` for `oss://research-datas/research-data/`
- `dist/oss/upload-plan.json` as the local deployment manifest

Upload rules:

- Use `ossutil sync`, not ad hoc object copies.
- Always use explicit endpoint and region flags.
- Auth bucket endpoint/region: `oss-cn-shenzhen.aliyuncs.com` / `cn-shenzhen`.
- Content bucket endpoint/region: `oss-cn-beijing.aliyuncs.com` / `cn-beijing`.
- Run dry-run first for new prefixes or broad changes.
- `--delete` is destructive and requires `--delete --yes`.
- Do not upload `web/research-data/` to the public auth bucket.
- Do not upload `web/dist/` into the private content bucket.

## Git Commit Rules

- Follow the repository git commit convention.
- Use `type: subject` style when the installed git convention does not require a more specific template.
- Split commits by purpose:
  - research HTML content
  - private index or data-sync tooling
  - web preview behavior
  - skill page updates
  - docs or governance updates
- Do not stage unrelated dirty files.
