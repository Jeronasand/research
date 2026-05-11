---
name: oss-upload-folder
description: "Upload a local folder to Alibaba Cloud OSS with a preview-first workflow. Use when Codex needs to publish, mirror, or sync a directory to an OSS bucket/prefix, especially static site output such as dist/. Prefer the installed OSS CLI path by default; use the optional Node.js implementation only when the user explicitly chooses the Node version."
---

# OSS Upload Folder

Use this skill to upload a local directory to Alibaba Cloud OSS safely. The default path uses an installed OSS command-line tool (`ossutil` or `osscli`), not Node.js.

## Choose Implementation

- Default: use `scripts/upload_folder_to_oss_cli.sh`.
- Optional Node.js version: use `scripts/upload_folder_to_oss_node.mjs` only when the user asks for the Node.js implementation or the target project already manages OSS uploads through Node.

## Environment Setup

If the skill needs default configuration, copy the skill-local env template in the target repository:

```bash
cp .codex/skills/oss-upload-folder/.env.oss-upload-folder.example \
  .codex/skills/oss-upload-folder/.env.oss-upload-folder
```

The scripts load only `.env.oss-upload-folder` from this skill directory. Do not rely on host-level `.env` files or ambient project env files.

For the CLI path, credentials may come from the installed CLI's own config. For the Node.js path, fill the `OSS_NODE_*` variables in `.env.oss-upload-folder`.

## CLI Workflow

1. Confirm the CLI exists:

```bash
command -v ossutil || command -v osscli
```

2. Run a preview first:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

3. Run the upload after checking the preview:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/
```

## Supported CLI Options

- `--local-dir <path>`: local folder to upload.
- `--oss-url <oss://bucket/prefix/>`: OSS destination, repeatable for multiple buckets or prefixes.
- `--cli <ossutil|osscli>`: force CLI command; otherwise auto-detect.
- `--endpoint <endpoint>`: OSS endpoint.
- `--include <pattern>`: include filter, repeatable.
- `--exclude <pattern>`: exclude filter, repeatable.
- `--update`: upload only newer files when supported by the CLI.
- `--delete`: delete remote objects not present locally when supported by the CLI.
- `--dry-run`: preview actions without uploading.
- `--yes`: skip dangerous-action confirmation for `--delete`.

## Optional Node.js Workflow

Use this only when the user chooses the Node version. The target project must install `ali-oss` first:

```bash
npm install ali-oss
```

Then fill `.codex/skills/oss-upload-folder/.env.oss-upload-folder` with the `OSS_NODE_*` values and run:

```bash
node .codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_node.mjs \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

Remove `--dry-run` for the real upload.

## Safety Rules

- Always run `--dry-run` before the first real upload to a new prefix.
- For multi-bucket uploads, pass multiple `--oss-url` values and verify every target in dry-run output.
- Avoid bucket-root uploads unless the user explicitly requests them.
- Keep a trailing slash in the OSS prefix for folder-like behavior.
- Treat `--delete` as dangerous; require explicit confirmation unless `--yes` is provided.
- Never write real access keys into docs, examples, commits, or test records.

## References

- See `references/oss-upload-notes.md` for patterns and troubleshooting.
- See `examples/manual-test.md` for the public manual test record format.
