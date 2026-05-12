# AGENTS.md

## Scope

These instructions apply to the whole repository.

## Repository Purpose

This is a private research repository. It stores processed Web static research packages and publishes them through a two-bucket OSS preview flow.

## Required Structure

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

- Keep `待调研`, `调研中`, and `调研完成` as the fixed priority status directories under `research/`.
- Additional top-level directories such as `工具` are allowed and are rendered as extra catalog sections after the fixed status directories.
- A directory with an `index.html` is one previewable Web package.
- A directory without an `index.html` is a grouping or placeholder directory and may contain package directories below it.
- Keep each package's assets and nested pages inside that package directory.
- Packages may contain subdirectories such as `split/`, `assets/`, and `data/`; package-internal relative HTML links and resources must remain relative so the preview page can sign and load them.
- Do not reintroduce the old React/Vite app shell, `research-data/manifest.json`, private-index workflow, skills catalog, or `temptodo/` inbox unless the user explicitly asks.

## OSS Flow

- preview bucket: `research-preview`
  - public/static website bucket
  - contains `login.html` and `index.html`
- datas bucket: `research-pages`
  - private bucket
  - contains `tree.json` and `research/<状态>/<项目>/...`
- Keep the flow pure static browser AK/SK access.
- Do not add a backend gateway unless the user explicitly asks.
- Never commit AK/SK, STS tokens, signed URLs, session dumps, or local OSS config.

## Commands

- Run `npm run tree` to regenerate local `tree.json`.
- Run `npm run deploy:dry-run` to preview a deployment.
- Run `npm run deploy` to clean datas bucket objects, upload data and preview pages, and verify the result.
- The deployment may delete objects inside `research-pages` and `research-preview`, but must never delete either bucket.

## Git

- Write commit messages according to the repository git commit convention.
- Use the `git-commit-convention` skill when generating commit messages or deciding commit splits.
- Split unrelated purposes into separate commits.
