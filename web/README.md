# Research Dual Bucket Preview

中文版本: `README.zh-CN.md`

## Run

```bash
npm install
npm run sync:data
npm run dev
```

Open `http://127.0.0.1:5173/`.

`npm run sync:data` scans the private repository structure, refreshes `research/private-index.json`, and writes upload-ready private data to `web/research-data/`. This generated folder is not copied into the public static bundle.

## Content Model

- Research deliverables are HTML files under `research/*.html`.
- Pending research topics live under `research/pending/<topic>/`.
- Skills may also be HTML pages under `skills/<skill-id>/index.html`.
- The generated private index is `research/private-index.json`.
- The generated OSS manifest is `web/research-data/manifest.json`.

The preview can render both Markdown and HTML, but new research and skill deliverables should use HTML.

## Dual Bucket Access

The preview uses the established dual-bucket scheme:

- preview bucket: `research-preview` on `oss-cn-shenzhen.aliyuncs.com`, public static hosting for the authorization/app shell only.
- data bucket: `research-pages` on `oss-cn-shenzhen.aliyuncs.com`, private ACL, read by browser-side signed OSS `GET` requests after the user enters OSS AK or STS credentials.
- manifest key: `research-data/manifest.json`.

The first screen is authorization-only. There is no backend. After authorization, the browser signs short-lived `GET` URLs for the private manifest and selected HTML objects.

## OSS CORS

The private data bucket needs CORS for:

- methods: `GET`
- origin: the actual preview origin and local dev origins

CORS does not make `research-pages` public. Bucket ACL stays private; reads still require valid signed OSS requests.

## Package And Upload From Repo Root

Use the root OSS workflow when publishing:

```bash
npm run package:oss
npm run upload:oss:dry-run
npm run upload:oss
```

This keeps the two buckets separate:

- `dist/oss/auth-bucket/` -> `oss://research-preview/`
- `dist/oss/content-bucket/research-data/` -> `oss://research-pages/research-data/`
