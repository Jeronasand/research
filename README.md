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

- login bucket: `research-preview` on `oss-cn-shenzhen.aliyuncs.com`, validates a user session with OSS AK or STS token through a signed HEAD request to a probe object.
- data-source bucket: `research-datas` on `oss-cn-beijing.aliyuncs.com`, stays private and is read by browser-side signed OSS requests after login.

The preview opens as a login-only page. After the login bucket validation succeeds, the same OSS AK or STS token signs reads against the private data-source bucket.

No real credentials are committed. The data bucket does not use public ACL; browser OSS reads still require CORS for `GET`/`HEAD` and request headers `Authorization`, `x-oss-date`, and `x-oss-security-token`.
