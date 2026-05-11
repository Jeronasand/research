# OSS Dual Bucket Access Release Notes

## Current Release

- Skill: `oss-dual-bucket-access`
- Version: `oss-dual-bucket-access/v1.0.0`
- Previous version: none
- Release type: feat
- Maintainer: `Jeronasand & Codex`

## Summary

新增 OSS 双桶访问 skill：登录桶使用用户 OSS AK 或 STS token 做会话验证，数据源桶必须先询问用户访问模式，再按最小权限执行。

## Changes

- 定义登录桶和数据源桶职责边界。
- 明确数据源桶访问前的必问问题。
- 补充只读、列举、上传同步、浏览器 CORS、预签名 URL、静态站点/CDN、删除/管理等访问模式。
- 补充 skill 专属 env 模板、访问模式参考和人工测试记录。
- 同步 catalog、categories、associations 和 public skills 索引。

## Artifacts

无外部 artifact。

## Verification

- `python3 -c 'import yaml, pathlib, re; p=pathlib.Path("skills/oss-dual-bucket-access/SKILL.md"); s=p.read_text(); m=re.match(r"^---\\n(.*?)\\n---", s, re.S); data=yaml.safe_load(m.group(1)); assert data["name"]=="oss-dual-bucket-access" and data["description"]; print("Skill is valid!")'`
- `git diff --check`
- `npm run sync:data`
- `npm run build`

## GitHub Release

本次 tag 推送后，为该 tag 单独创建 GitHub Release；Release 内容以本文件为准。
