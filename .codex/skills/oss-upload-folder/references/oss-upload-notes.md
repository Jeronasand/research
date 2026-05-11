# OSS Upload Notes

## CLI First

Use the CLI implementation first. It expects `ossutil` or `osscli` to already be installed and configured by the user or target environment.

Recommended preview:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

Recommended upload:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/
```

## Filters

Use repeated filters when needed:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --exclude "*.map" \
  --exclude ".DS_Store" \
  --dry-run
```

## Multiple Buckets

Repeat `--oss-url` to upload the same local directory to multiple buckets or prefixes:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket-a/site/ \
  --oss-url oss://example-bucket-b/site/ \
  --dry-run
```

Each target is validated independently. Bucket-root uploads are blocked for every target.

## Delete Sync

Use `--delete` only for strict mirror behavior:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --delete \
  --dry-run
```

Run without `--dry-run` only after checking the remote delete scope.

## Node.js Option

Use the Node.js script only when the user explicitly selects that implementation. The target project must provide `ali-oss`:

```bash
npm install ali-oss
```

The Node.js script reads `OSS_NODE_*` values from `.env.oss-upload-folder` in the skill directory. Do not rely on the host environment.
The Node.js script also supports repeated `--oss-url` values.

## Troubleshooting

- `OSS CLI not found`: install `ossutil` or `osscli`, or pass `--cli <path-or-command>`.
- `AccessDenied`: check CLI config, RAM policy, bucket permissions, and endpoint.
- Unexpected upload scope: rerun with `--dry-run`, check `--local-dir`, trailing slash, include/exclude filters, and target prefix.
- Node.js `Cannot find package 'ali-oss'`: install `ali-oss` in the target project or use the CLI implementation.
