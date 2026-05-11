# React TS Web Init Release Notes

## Current Release

- Skill: `react-ts-web-init`
- Version: `react-ts-web-init/v1.0.0`
- Previous version: none
- Release type: feat
- Maintainer: `Jeronasand & Codex`

## Summary

新增 React + TypeScript Web 项目初始化 skill，默认使用 Vite、React Router 和 Tailwind CSS 官方 Vite 插件，并沉淀组件化目录结构。

## Changes

- 定义 React + TypeScript + Vite 默认初始化流程。
- 明确组件化目录边界：`app`、`components`、`pages`。
- 明确 React Router 路由入口和 catch-all 页面要求。
- 明确 Tailwind CSS 使用 `tailwindcss` + `@tailwindcss/vite`，避免旧版 v3 样板误用。
- 增加可 dry-run 的初始化脚本 `scripts/init_react_ts_web.sh`。
- 增加 `oss-upload-folder` 可选发布关联。
- 同步 catalog、categories、associations 和 public skills 索引。

## Artifacts

无外部 artifact。

## Verification

- `bash -n skills/react-ts-web-init/scripts/init_react_ts_web.sh`
- `python3 -c 'import yaml, pathlib, re; p=pathlib.Path("skills/react-ts-web-init/SKILL.md"); s=p.read_text(); m=re.match(r"^---\\n(.*?)\\n---", s, re.S); data=yaml.safe_load(m.group(1)); assert data["name"]=="react-ts-web-init" and data["description"]; print("Skill is valid!")'`
- `bash skills/react-ts-web-init/scripts/init_react_ts_web.sh --project-dir /tmp/public-skills-react-ts-web-init-test --package-manager npm`
- `cd /tmp/public-skills-react-ts-web-init-test && npm run build`
- `git diff --check`
- `npm run sync:data`
- `npm run build`

## GitHub Release

本次 tag 推送后，为该 tag 单独创建 GitHub Release；Release 内容以本文件为准。
