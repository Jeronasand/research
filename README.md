# Research

中文版本: `README.zh-CN.md`

This repository stores many independent research items. Items are sorted by numeric prefix and versioned over time.

Start with:

- `AGENTS.md` for repository instructions
- `AGENTS.zh-CN.md` for Chinese repository instructions
- `CONVENTIONS.md` for repository rules
- `CONVENTIONS.zh-CN.md` for Chinese repository rules
- `research/INDEX.md` for the ordered English research list
- `research/INDEX.zh-CN.md` for the ordered Chinese research list
- `.codex/skills/research-capability` for creating or updating research
- `.codex/skills/research-repo-conventions` for maintaining repo structure

Research items are not grouped into categories. Create each item directly under `research/` as `0001-topic-slug/`, `0002-topic-slug/`, and keep product/technical history in paired version files under `versions/product/` and `versions/technical/`.

Within each research item, keep product research and technical research separate:

- product research: `product.md` and `product.zh-CN.md`
- technical research: `technical.md` and `technical.zh-CN.md`
- product snapshots: `versions/product/vMAJOR.MINOR.PATCH.md`
- technical snapshots: `versions/technical/vMAJOR.MINOR.PATCH.md`

## Dual Bucket Preview

The preview app lives in `web/`.

```bash
cd web
npm install
npm run sync:data
npm run dev
```

Open `http://127.0.0.1:5173/`.

`npm run sync:data` writes generated upload data to `web/research-data/`. That folder is not part of the public static preview bundle; upload it to `research-datas`, not to `research-preview`.

The preview uses two OSS buckets:

- preview bucket: `research-preview` on `oss-cn-shenzhen.aliyuncs.com`, public-read static hosting for the web page only.
- data-source bucket: `research-datas` on `oss-cn-beijing.aliyuncs.com`, private ACL, read by browser-side signed OSS requests after the user enters OSS AK or STS credentials.

The preview opens as a login-only page. There is no backend. The browser validates access by generating a short-lived signed `GET` URL for the private data-source manifest, then generates signed URLs for the selected research documents.

No real credentials are committed. The data bucket does not use public ACL; browser OSS reads still require CORS for `GET` from the preview origin.
