# Research Dual Bucket Preview

中文版本: `README.zh-CN.md`

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Data Source Manifest

The preview bucket is `research-preview` on `oss-cn-shenzhen.aliyuncs.com`.
The data-source OSS bucket is `research-datas` on `oss-cn-beijing.aliyuncs.com` and should expose a JSON manifest like:

The first screen is login-only. The app only exposes the data-source bucket form and document preview after the login bucket HEAD validation succeeds.

```json
{
  "title": "Research Repository",
  "updated": "2026-05-11",
  "items": [
    {
      "id": "0001-product-en",
      "title": "AiToEarn Product Research",
      "type": "product",
      "language": "en",
      "version": "v0.2.0",
      "key": "research-data/0001-aitoearn/product.md"
    }
  ]
}
```

The preview reads known keys from the manifest. It does not require bucket listing.

## OSS CORS

Browser access needs CORS on the data-source bucket for:

- methods: `GET`, `HEAD`
- request headers: `Authorization`, `x-oss-date`, `x-oss-security-token`
- origin: the actual preview origin
