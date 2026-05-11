---
name: bucket-upload-policy
description: "Decide when skill-related artifacts should be uploaded to object storage instead of committed to the repository, and produce OSS/S3-safe artifact references. Use when a skill involves PDFs, images, videos, binary assets, large examples, generated archives, screenshots, or other non-code/non-doc files that should live in OSS or S3 with only links and metadata kept in git."
---

# Bucket Upload Policy

Use this skill to keep public skill repositories small and clean by moving large or binary artifacts to object storage.

## Default Rule

Do not commit large non-code artifacts to the repository. Upload them to a bucket and commit only:

- Public URL.
- Storage URI.
- File name.
- Size.
- SHA-256 checksum when practical.
- Source attribution.
- Short usage note.

Examples of artifacts that should usually be uploaded:

- PDF source material.
- Images and screenshots.
- Videos and audio.
- Zip archives.
- Binary samples.
- Large generated fixtures.
- Large model/tool output files.

## Public Skills OSS Target

For this repository, the default OSS artifact target is:

```text
Region: oss-cn-shenzhen
Bucket: public-skills
Public domain: public-skills.jeronasand.cn
OSS URI prefix: oss://public-skills/
```

Use skill-specific prefixes:

```text
oss://public-skills/skills/<skill-name>/<version>/
https://public-skills.jeronasand.cn/skills/<skill-name>/<version>/
```

## Credential Rule

Never commit access keys or secrets.

For OSS, configure credentials in the local OSS CLI config with `ossutil config` or the equivalent local CLI setup. The typical local config location is user-home scoped, such as:

```text
~/.ossutilconfig
```

If the installed OSS CLI uses a different config path, inspect the CLI help and keep that path local to the machine. Do not copy it into the repo.

For S3, use normal AWS CLI credentials or profiles, such as:

```text
~/.aws/credentials
~/.aws/config
```

## Upload Workflow

1. Decide whether the file belongs in git.
   - Keep source code, Markdown docs, small text examples, and small config templates in git.
   - Upload large or binary artifacts to OSS/S3.

2. Choose storage prefix:

```text
skills/<skill-name>/<version>/<filename>
```

3. Run a dry-run upload with the storage-specific upload skill.

For OSS:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./artifact-upload/<skill-name>/<version> \
  --oss-url oss://public-skills/skills/<skill-name>/<version>/ \
  --endpoint oss-cn-shenzhen.aliyuncs.com \
  --dry-run
```

For S3:

```bash
.codex/skills/aws-s3-upload-folder/scripts/upload_folder_to_s3.sh \
  --local-dir ./artifact-upload/<skill-name>/<version> \
  --s3-uri s3://example-bucket/skills/<skill-name>/<version>/ \
  --dry-run
```

4. Upload after verifying scope.

5. Commit an artifact manifest or source note, not the binary file.

## Manifest Shape

Use this shape in `references/` or `examples/` when a skill depends on uploaded artifacts:

```markdown
# Artifact Manifest

| File | Public URL | Storage URI | Size | SHA-256 | Source |
| --- | --- | --- | --- | --- | --- |
| example.pdf | https://public-skills.jeronasand.cn/skills/example/v1.0.0/example.pdf | oss://public-skills/skills/example/v1.0.0/example.pdf | 123 KB | ... | community PDF |
```

## Related Skills

- Use `oss-upload-folder` for Alibaba Cloud OSS uploads.
- Use `aws-s3-upload-folder` for Amazon S3 uploads.
