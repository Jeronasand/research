# Research Repository Conventions

## Current Contract

This repository follows a simple dual-bucket static preview model:

```text
preview/
  login.html
  index.html
research/
  待调研/
  调研中/
  调研完成/
  <extra-section>/
upload.js
tree.json
```

## Research Packages

- These three status directories under `research/` are fixed priority sections:
  - `research/待调研/`
  - `research/调研中/`
  - `research/调研完成/`
- Additional top-level directories such as `research/工具/` are valid extra catalog sections.
- A directory with an `index.html` is one Web static package.
- A directory without an `index.html` is a grouping or placeholder directory and may contain package directories below it.
- Package assets and nested pages stay inside the package directory.
- Subdirectories such as `split/`, `assets/`, and `data/` are allowed. Use relative package-internal links so the preview page can sign and load nested HTML pages and resources.
- Do not add generated manifest formats other than `tree.json` unless the user changes the contract.

## Tree Index

`tree.json` is generated from the real directory tree:

```json
{
  "待调研": [{"type": "package", "name": "project-a", "path": "project-a"}],
  "调研中": [{"type": "package", "name": "project-b", "path": "project-b"}],
  "调研完成": [],
  "工具": [{"type": "package", "name": "tool-a", "path": "tool-a"}]
}
```

Generate it with:

```bash
npm run tree
```

## OSS Buckets

- preview bucket: `research-preview`
  - public/static website bucket
  - contains only `login.html` and `index.html`
- datas bucket: `research-pages`
  - private data bucket
  - contains `tree.json` and `research/<状态>/<项目>/...`

The datas bucket must allow browser CORS from the preview domain for signed `GET` requests.

## Deployment

Use one command for the whole flow:

```bash
npm run deploy
```

This command cleans objects in the datas bucket, uploads the current `research/` tree and `tree.json`, uploads the preview pages, and verifies the key objects. It never deletes either bucket.

Use dry-run before risky deployments:

```bash
npm run deploy:dry-run
```

## Git

- Follow `type: subject` commit messages.
- Keep unrelated changes out of the same commit.
- Never commit AK/SK, STS token, signed URLs, session dumps, or local OSS config.
