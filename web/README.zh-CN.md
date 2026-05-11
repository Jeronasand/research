# 调研双桶预览

English version: `README.md`

## 运行

```bash
npm install
npm run sync:data
npm run dev
```

打开 `http://127.0.0.1:5173/`。

`npm run sync:data` 会把待上传数据写到 `web/research-data/`。不要把调研数据放到 `web/public/`，因为 `web/public/` 会被打包进公开预览页面。

## 数据源 Manifest

预览桶是 `research-preview`，地域 endpoint 为 `oss-cn-shenzhen.aliyuncs.com`。
数据源 OSS 桶是 `research-datas`，地域 endpoint 为 `oss-cn-beijing.aliyuncs.com`。它保持 private ACL，并向签名 OSS 请求暴露类似下面的 JSON manifest：

首屏只保留登录功能。登录桶 HEAD 校验成功后，应用使用同一组 OSS AK 或 STS token 签名读取数据源桶。

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

预览应用会读取 manifest 中的已知对象 key，不需要 bucket list 权限。

## OSS CORS

浏览器访问数据源桶需要 CORS 允许：

- methods: `GET`, `HEAD`
- request headers: `Authorization`, `x-oss-date`, `x-oss-security-token`
- origin: 实际预览页面 origin

这个 CORS 规则不会把 `research-datas` 变成公开桶。桶 ACL 可以继续保持 private，读取仍然必须是有效的 OSS 签名请求。
