# AGENTS.md

## Scope

These instructions apply to the whole repository.

## Repository Purpose

This is a private research repository. Project-related research deliverables are maintained as standalone HTML files, indexed from the directory structure, and previewed through the OSS dual-bucket flow.

## Content Structure

- Put external Web or HTML files from other sources in `temptodo/` first. Treat `temptodo/` as an inbox, not as publishable content.
- An inbox item can be a single `.html` file or a full webpage folder containing HTML, CSS, JS, images, JSON, CSV, or other local assets.
- Put completed research HTML documents directly under `research/`.
- Put pending research requests in their own directories under `research/pending/<topic>/`.
- Do not introduce category folders unless the user explicitly changes this rule.
- Skills may be HTML pages. Store HTML skills at `skills/<skill-id>/index.html`.
- Keep imported or reusable skill pages traceable through their page-local metadata when available, especially `skillgenome-ai-context`.

## Inbox And Sync

- Do not sync, index, move, or publish files from `temptodo/` just because they exist.
- Only process `temptodo/` when the user explicitly asks to sync.
- During sync, inspect each inbox HTML file and classify it yourself:
  - completed research deliverable: move or copy to `research/<topic-and-version>.html`
  - pending research request or source collection: create/update `research/pending/<topic>/`
  - reusable or workflow skill: create/update `skills/<skill-id>/index.html`
- During sync, inspect each inbox folder as one webpage package. Identify the entry HTML file, preserve relative asset paths, and move/copy the needed assets with the classified target.
- For a completed research package with local assets, use `research/<topic-slug>/index.html` plus assets inside that folder instead of flattening everything into `research/*.html`.
- For an HTML skill package with local assets, use `skills/<skill-id>/index.html` plus assets inside that skill folder.
- Supporting assets must stay beside their classified target, not loose at repo root.
- After classification, refresh `research/private-index.json` and `web/research-data/manifest.json`.
- Leave unclassified inbox files in `temptodo/` and state why they were left there.

## Private Index

- Maintain `research/private-index.json` from the real directory structure.
- Run `node scripts/private-index.mjs` after adding, removing, or renaming research HTML, pending research directories, or HTML skills.
- Run `cd web && npm run sync:data` before packaging private OSS data; this refreshes the index and writes `web/research-data/manifest.json`.
- Do not hand-write divergent manifest entries that do not exist in the repo tree.
- `temptodo/` is intentionally excluded from the private index and private bucket payload.

## Dual Bucket Access

- Use the existing dual-bucket scheme.
- Public preview/auth bucket: `research-preview` on `oss-cn-shenzhen.aliyuncs.com`; it only hosts the authorization page and web app shell.
- Private content/data bucket: `research-datas` on `oss-cn-beijing.aliyuncs.com`; it stores `research-data/manifest.json`, research HTML, skill HTML, and private index data.
- Keep the flow pure static browser AK/STS. Do not add a backend gateway unless the user explicitly asks for one.
- The authorization page can directly reuse the dual-bucket access skill/page.
- Never commit AK/SK, STS tokens, signed URLs with secrets, or session dumps.

## OSS Package And Upload

- The repository owns its OSS packaging and upload workflow.
- Run `npm run package:oss` from the repo root to build two local payloads:
  - `dist/oss/auth-bucket/` -> `oss://research-preview/`
  - `dist/oss/content-bucket/research-data/` -> `oss://research-datas/research-data/`
- Run `npm run upload:oss:dry-run` before the first real upload or before any risky change.
- Run `npm run upload:oss -- --target auth` to upload only the public authorization/app shell bucket.
- Run `npm run upload:oss -- --target content` to upload only the private content bucket.
- Run `npm run upload:oss` to upload both targets, then verify `index.html` and `research-data/manifest.json`.
- Do not use `--delete` unless the user explicitly asks for remote cleanup; the script requires `--delete --yes`.
- Keep public preview asset verification separate from private content bucket verification.

## Research HTML

- New research deliverables should be simple HTML files.
- Prefer minimal black-and-white presentation unless the user asks for richer styling.
- Include a meaningful `<title>`.
- If possible, include machine-readable or semi-structured metadata in the page body, such as scope, language, version, status, and last verified date.

## Pending Research

- Each pending item gets a directory under `research/pending/`.
- Use a short lowercase slug or date-prefixed slug.
- Add a concise `README.md` with the topic, status, requested output, and known inputs.
- Move the result into `research/*.html` when the research is complete, then refresh the private index.

## Skill Maintenance

- Update skills when a recurring workflow rule changes.
- A skill can be a Codex skill folder or an HTML page; in this repository, HTML skill pages under `skills/` are first-class.
- Keep `skills/research-html-private-index/index.html` aligned with this repository's actual HTML, private-index, and dual-bucket workflow.
- Keep `skills/oss-dual-bucket-access/index.html` aligned with the current bucket names and access boundary when the OSS flow changes.

## Git

- Write git commit messages according to the repository git commit convention.
- Use the `git-commit-convention` skill when generating commit messages or deciding commit splits.
- Split unrelated purposes into separate commits. Keep research HTML changes separate from tooling, index, or skill maintenance unless the user asks for one combined commit.
