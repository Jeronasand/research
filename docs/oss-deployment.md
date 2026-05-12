# OSS Deployment

This repository publishes two separate OSS payloads.

## Targets

| Purpose | Local payload | OSS target | Endpoint | Region |
| --- | --- | --- | --- | --- |
| Authorization/app shell | `dist/oss/auth-bucket/` | `oss://research-preview/` | `oss-cn-shenzhen.aliyuncs.com` | `cn-shenzhen` |
| Private content data | `dist/oss/content-bucket/research-data/` | `oss://research-datas/research-data/` | `oss-cn-beijing.aliyuncs.com` | `cn-beijing` |

## Package

```bash
npm run package:oss
```

This command:

- refreshes `research/private-index.json`
- generates `web/research-data/manifest.json`
- builds the static preview app
- writes `dist/oss/auth-bucket/`
- writes `dist/oss/content-bucket/research-data/`
- writes `dist/oss/upload-plan.json`

## Dry Run

```bash
npm run upload:oss:dry-run
```

Run this before the first real upload, before broad changes, and before any `--delete` use.

## Upload

```bash
npm run upload:oss
```

Upload one target only:

```bash
npm run upload:oss -- --target auth
npm run upload:oss -- --target content
```

Use an ossutil profile or config file when needed:

```bash
npm run upload:oss -- --profile default
npm run upload:oss -- --config-file ~/.ossutilconfig
```

Remote deletion is disabled by default. Only use it after a dry-run:

```bash
npm run upload:oss -- --delete --yes
```

## Verify

```bash
npm run verify:oss
```

This checks:

- `oss://research-preview/index.html`
- `oss://research-datas/research-data/manifest.json`

Keep these checks separate. A public preview upload can pass while the private content bucket still fails because of ACL, RAM, CORS, or region mismatch.
