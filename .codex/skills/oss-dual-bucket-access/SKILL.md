---
name: oss-dual-bucket-access
description: "Plan and operate Alibaba Cloud OSS dual-bucket access: one login bucket authenticates with a user-provided OSS access key or STS token, and one data-source bucket is accessed only after asking the user which access mode is required."
---

# OSS Dual Bucket Access

Use this skill when a project needs two Alibaba Cloud OSS buckets with different responsibilities:

- Login bucket: used only to authenticate or prove a user session with the user's OSS access key or STS token.
- Data-source bucket: used for product data, documents, images, preview assets, app bundles, or other source objects. Its access mode must be confirmed before use.

## Required Question

Before touching the data-source bucket, ask the user what kind of access they need unless they already specified it clearly:

```text
数据源 OSS 桶需要哪种访问方式：只读下载、列举+下载、上传/同步、浏览器端 CORS 读取、预签名 URL/临时授权、静态站点/CDN 读取，还是删除/管理类操作？
```

If the answer includes write, sync, delete, CORS, bucket policy, website hosting, or CDN changes, state the side effect and require explicit confirmation before executing it.

## Bucket Boundary

- Do not reuse login-bucket credentials for the data-source bucket unless the user explicitly says the same AK or STS is intended to access both.
- Keep login bucket and data bucket names, endpoints, prefixes, and credentials separate in notes, env files, commands, and final reports.
- Treat the login bucket as an auth/session surface, not as a fallback data store.
- Treat the data bucket as least-privilege: grant only the access mode the user chose.
- Never write real access keys, secrets, STS tokens, cookies, account IDs, or private object paths into committed files or examples.

## Environment Setup

If defaults are useful, copy the skill-local env template in the target repository:

```bash
cp .codex/skills/oss-dual-bucket-access/.env.oss-dual-bucket-access.example \
  .codex/skills/oss-dual-bucket-access/.env.oss-dual-bucket-access
```

Load only this skill-local env file. Do not silently fall back to a project root `.env`.

## Workflow

1. Identify the two buckets and their endpoints:
   - login bucket name, endpoint, and optional prefix;
   - data bucket name, endpoint, and optional prefix.
2. Confirm the login credential type:
   - long-lived OSS AK pair;
   - STS access key, secret, security token, and expiry time.
3. Validate login-bucket access with the least intrusive command available for the installed CLI or SDK, usually a list/head operation against a narrow prefix.
4. Ask the required data-bucket access question.
5. Select the matching access mode from `references/access-modes.md`.
6. Run a dry run or read-only probe first whenever the operation can mutate objects, bucket policy, CORS, website config, CDN config, or lifecycle rules.
7. Report exactly which bucket was used for login, which bucket was used for data, which credentials were used in principle, and which actions were only planned versus executed.

## Access Modes

Read `references/access-modes.md` when the user chooses a data-bucket mode or when you need to explain tradeoffs.

Common mappings:

- `read-object`: download known object keys without listing the bucket.
- `list-and-read`: list prefixes and download selected objects.
- `upload-sync`: upload, mirror, or sync local output into a data prefix; use `oss-upload-folder` if installed.
- `browser-cors-read`: browser app reads OSS objects directly with CORS and scoped credentials.
- `presigned-url`: server or agent generates temporary URLs for selected objects.
- `static-website-cdn`: public/static site or CDN-backed read path.
- `admin-delete-policy`: delete, lifecycle, bucket policy, CORS, or website config changes; require explicit confirmation.

## Safety Checks

- Prefer `ossutil` or `osscli` if already installed; otherwise use the target repo's existing OSS SDK.
- For STS, check that the token has not expired before trying data access.
- For browser access, verify CORS origin, methods, headers, and exposed headers against the actual app URL.
- For data writes, run dry-run mode first when the chosen tool supports it.
- For deletes and bucket-level config changes, show the exact bucket, prefix, and command before running.
- Keep examples placeholder-only.

## Related Skills

- `oss-upload-folder`: optional follow-up when the data bucket needs upload or sync.
- `bucket-upload-policy`: optional precheck when deciding whether large artifacts should live in OSS instead of git.
