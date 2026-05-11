# Git Commit Convention Release Notes

## Current Release

- Skill: `git-commit-convention`
- Version: `git-commit-convention/v1.0.7`
- Previous version: `git-commit-convention/v1.0.6`
- Release type: patch
- Maintainer: `Jeronasand & Codex`

## Summary

根据仓库规范和实际 diff 生成 git commit 内容，并在改动混杂多个不同业务目的时默认拆分提交。

## Changes

- 明确依赖/代码迁移和 repo-local skill 安装属于不同提交目的，不能合成一个提交记录。
- 补充 `@mizumessenger/sui-stack-messaging` 依赖/import 替换与 `.codex/skills/git-commit-convention/` 安装的拆分示例。
- 当用户只要求生成提交信息时，直接输出每个拆分组的 commit message；实际 stage/commit 前再请求用户确认。

## Artifacts

无外部 artifact。

## Verification

- `git diff --check`
- basic skill package checks

## GitHub Release

本次 tag 推送后，为该 tag 单独创建 GitHub Release；Release 内容以本文件为准。
