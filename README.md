# Research

This private repository stores HTML research documents, HTML skills, and a generated private index for OSS dual-bucket preview.

## Layout

- `temptodo/`: temporary inbox for external Web/HTML files or complete webpage folders before explicit sync
- `research/*.html`: completed research deliverables
- `research/<topic>/index.html`: completed research packages that need local assets
- `research/pending/<topic>/`: pending research requests and working notes
- `research/private-index.json`: generated private repository index
- `skills/<skill-id>/index.html`: HTML skill pages
- `web/`: static preview app that reads private data through signed OSS requests
- `scripts/private-index.mjs`: index generator
- `scripts/package-oss.mjs`: builds separate auth/content OSS payloads
- `scripts/upload-oss.mjs`: uploads the separate payloads with `ossutil`
- `docs/oss-deployment.md`: OSS packaging, upload, and verification runbook

## Workflow

```bash
npm run index:private
npm run package:oss
npm run upload:oss:dry-run
```

For local preview:

```bash
cd web
npm run dev
```

`temptodo/` is not scanned by this workflow. It is processed only after an explicit sync request, then files or webpage folders are classified into `research/`, `research/pending/`, or `skills/`. When an inbox folder has CSS, JS, images, or data files, keep those assets with the target package.

## Access Model

The preview uses a dual-bucket model:

- `research-preview`: public authorization bucket for app shell only
- `research-pages`: private content bucket for `research-data/manifest.json`, research HTML, skill HTML, and `research/private-index.json`

There is no backend. The browser signs OSS `GET` requests using user-provided AK/SK or STS credentials.

## OSS Upload

```bash
npm run package:oss
npm run upload:oss:dry-run
npm run upload:oss
```

Target only one bucket when needed:

```bash
npm run upload:oss -- --target auth
npm run upload:oss -- --target content
```

The upload script uses:

- `dist/oss/auth-bucket/` -> `oss://research-preview/`
- `dist/oss/content-bucket/research-data/` -> `oss://research-pages/research-data/`

Use `npm run verify:oss` after upload. Remote deletion is off by default; use `--delete --yes` only after a dry-run and an explicit cleanup decision.

## Rules

Read `AGENTS.md` and `CONVENTIONS.md` before changing structure, skills, sync logic, or commit scope.
