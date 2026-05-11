# Research Dual Bucket Preview

中文版本: `README.zh-CN.md`

## Run

```bash
npm install
npm run sync:data
npm run dev
```

Open `http://127.0.0.1:5173/`.

`npm run sync:data` writes upload-ready data to `web/research-data/`. It is not copied into the public static bundle. Do not place research data under `web/public/`.

## Data Source Manifest

The preview bucket is `research-preview` on `oss-cn-shenzhen.aliyuncs.com`. It only hosts the public static web page.
The data-source OSS bucket is `research-datas` on `oss-cn-beijing.aliyuncs.com`. It stays private and should expose a JSON manifest to signed OSS requests like:

The first screen is login-only. There is no backend. After the user enters OSS AK or STS credentials, the browser signs a `GET` request to the data-source manifest. If that request succeeds, the same credentials sign reads for the selected research document keys.

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

- methods: `GET`
- request headers: `Authorization`, `x-oss-date`, `x-oss-security-token`
- origin: the actual preview origin

This CORS rule does not make `research-datas` public. The bucket ACL can stay private; reads still require a valid signed OSS request.
