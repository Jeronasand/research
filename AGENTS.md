# AGENTS.md

## Scope

These instructions apply to the whole repository.

## Repository Purpose

This is a private research repository. Project-related research deliverables are maintained as Web static packages, indexed into a three-section card catalog, and previewed through the OSS dual-bucket flow.

## Content Structure

- Put external Web or HTML files from other sources in `temptodo/` first. Treat `temptodo/` as an inbox, not as publishable content.
- An inbox item can be a single `.html` file or a full webpage folder containing HTML, CSS, JS, images, JSON, CSV, or other local assets.
- Maintain pending research tasks in `research/pending/tasks.json`; keep its field contract in `research/pending/tasks.schema.json`.
- A pending task can also be a previewable Web package under `research/pending/<topic>/index.html`.
- Put in-progress research Web packages under `research/in-progress/<topic>/`.
- Put completed research Web packages under `research/completed/<topic>/`.
- Each in-progress or completed package must have an `index.html` entry file. Local assets stay inside the same package directory.
- The preview catalog has exactly three main sections: `待调研`, `调研中`, and `已完结调研`.
- The preview frontend indexes only those main sections and their direct item directories. It must not expand every HTML file inside a package into separate catalog items.
- Skills may be HTML pages. Store HTML skills at `skills/<skill-id>/index.html`.
- Keep imported or reusable skill pages traceable through their page-local metadata when available, especially `skillgenome-ai-context`.

## Inbox And Sync

- Do not sync, index, move, or publish files from `temptodo/` just because they exist.
- Only process `temptodo/` when the user explicitly asks to sync.
- During sync, inspect each inbox HTML file and classify it yourself:
  - completed research package: move or copy to `research/completed/<topic>/index.html`
  - in-progress research package: move or copy to `research/in-progress/<topic>/index.html`
  - pending research task: add/update one item in `research/pending/tasks.json`
  - pending source collection or previewable pending package: create/update `research/pending/<topic>/` and reference it from `tasks.json`
  - reusable or workflow skill: create/update `skills/<skill-id>/index.html`
- During sync, inspect each inbox folder as one webpage package. Identify the entry HTML file, preserve relative asset paths, and move/copy the needed assets with the classified target.
- For a completed research package with local assets, use `research/completed/<topic-slug>/index.html` plus assets inside that folder.
- For an in-progress research package with local assets, use `research/in-progress/<topic-slug>/index.html` plus assets inside that folder.
- For an HTML skill package with local assets, use `skills/<skill-id>/index.html` plus assets inside that skill folder.
- Supporting assets must stay beside their classified target, not loose at repo root.
- After classification, refresh `research/private-index.json` and `web/research-data/manifest.json`.
- Leave unclassified inbox files in `temptodo/` and state why they were left there.

## Private Index

- Maintain `research/private-index.json` from the real directory structure.
- Run `node scripts/private-index.mjs` after adding, removing, or renaming pending task JSON, in-progress packages, completed packages, or HTML skills.
- Run `cd web && npm run sync:data` before packaging private OSS data; this refreshes the index and writes `web/research-data/manifest.json`.
- Do not hand-write divergent manifest entries that do not exist in the repo tree.
- `temptodo/` is intentionally excluded from the private index and private bucket payload.

## Dual Bucket Access

- Use the existing dual-bucket scheme.
- Public preview/auth bucket: `research-preview` on `oss-cn-shenzhen.aliyuncs.com`; it only hosts the authorization page and web app shell.
- Private content/data bucket: `research-pages` on `oss-cn-shenzhen.aliyuncs.com`; it stores `research-data/manifest.json`, pending task JSON, pending preview packages, research package payloads, and private index data.
- Keep the flow pure static browser AK/STS. Do not add a backend gateway unless the user explicitly asks for one.
- The authorization page can directly reuse the dual-bucket access skill/page.
- Never commit AK/SK, STS tokens, signed URLs with secrets, or session dumps.

## OSS Package And Upload

- The repository owns its OSS packaging and upload workflow.
- Run `npm run package:oss` from the repo root to build two local payloads:
  - `dist/oss/auth-bucket/` -> `oss://research-preview/`
  - `dist/oss/content-bucket/research-data/` -> `oss://research-pages/research-data/`
- Run `npm run upload:oss:dry-run` before the first real upload or before any risky change.
- Run `npm run upload:oss -- --target auth` to upload only the public authorization/app shell bucket.
- Run `npm run upload:oss -- --target content` to upload only the private content bucket.
- Run `npm run upload:oss` to upload both targets, then verify `index.html` and `research-data/manifest.json`.
- When only private research data changed, run `npm run update:data`; this refreshes the private index, packages `web/research-data/`, uploads only `oss://research-pages/research-data/`, and verifies `research-data/manifest.json`.
- Use `npm run update:data:dry-run` only when you need to preview the private data upload plan.
- Run `npm run data:package` when you only need to refresh local private data payloads without uploading.
- Do not use `--delete` unless the user explicitly asks for remote cleanup; the script requires `--delete --yes`.
- Keep public preview asset verification separate from private content bucket verification.

## Research Packages

- New research deliverables should be simple Web static packages.
- Put active work under `research/in-progress/<topic>/index.html`.
- Move or copy finished work to `research/completed/<topic>/index.html`.
- Include an optional `research.json` beside `index.html` for card metadata: `id`, `title`, `summary`, `tags`, `language`, `version`, `updatedAt`, and `entry`.
- Prefer minimal black-and-white presentation unless the user asks for richer styling.
- Include a meaningful `<title>`.
- If possible, include machine-readable or semi-structured metadata in the page body, such as scope, language, version, status, and last verified date.

## Pending Research

- Pending task cards are maintained in `research/pending/tasks.json`.
- Use `research/pending/tasks.schema.json` as the field contract when creating tasks manually.
- Each task `id` should be a short lowercase slug.
- If a pending task needs local notes, source files, or a previewable Web package, place them under `research/pending/<topic>/` and reference them from the task `inputs` array.
- If `research/pending/<topic>/index.html` exists, the private preview can open that pending card before the task moves to `research/in-progress/`.
- When work starts, put the Web package in `research/in-progress/<topic>/`.
- When the research is complete, put the Web package in `research/completed/<topic>/`, then refresh the private index.

## Skill Maintenance

- Update skills when a recurring workflow rule changes.
- A skill can be a Codex skill folder or an HTML page; in this repository, HTML skill pages under `skills/` are first-class.
- Keep `skills/research-html-private-index/index.html` aligned with this repository's actual HTML, private-index, and dual-bucket workflow.
- Keep `skills/oss-dual-bucket-access/index.html` aligned with the current bucket names and access boundary when the OSS flow changes.

## Git

- Write git commit messages according to the repository git commit convention.
- Use the `git-commit-convention` skill when generating commit messages or deciding commit splits.
- Split unrelated purposes into separate commits. Keep research package content separate from tooling, index, or skill maintenance unless the user asks for one combined commit.
