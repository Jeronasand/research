# OSS Upload Folder Release Notes

## Current Release

- Skill: `oss-upload-folder`
- Version: `oss-upload-folder/v1.0.3`
- Previous version: `oss-upload-folder/v1.0.2`
- Release type: patch
- Maintainer: `Jeronasand & Codex`

## Summary

使用 OSS CLI 优先的安全流程上传本地文件夹到一个或多个 OSS 目标，并提供可选 Node.js 版本。

## Changes

- 补充可复制给 agent 的安装 prompt。
- 明确安装前需要检查 `skills/associations.json`，有相关 skill 时先询问用户是否一起安装。

## Artifacts

无外部 artifact。

## Verification

- `git diff --check`
- basic skill package checks

## GitHub Release

本次 tag 推送后，为该 tag 单独创建 GitHub Release；Release 内容以本文件为准。
