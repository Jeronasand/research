# 调研双桶预览

English version: `README.md`

## 运行

```bash
npm install
npm run sync:data
npm run dev
```

打开 `http://127.0.0.1:5173/`。

`npm run sync:data` 会把待上传数据写到 `web/research-data/`。它不会进入公开静态包。不要把调研数据放到 `web/public/`。

## 数据源 Manifest

预览桶是 `research-preview`，地域 endpoint 为 `oss-cn-shenzhen.aliyuncs.com`，只用于公开静态网页托管。
数据源 OSS 桶是 `research-datas`，地域 endpoint 为 `oss-cn-beijing.aliyuncs.com`。它保持 private ACL，并向签名 OSS 请求暴露类似下面的 JSON manifest：

首屏只保留登录功能。这里没有后端服务。用户输入 OSS AK 或 STS 后，浏览器会为数据源 manifest 生成短期有效的签名 `GET` URL；这个请求成功后，应用继续用同一组凭证为选中的调研文档 key 生成签名 URL。

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

- methods: `GET`
- origin: 实际预览页面 origin

这个 CORS 规则不会把 `research-datas` 变成公开桶。桶 ACL 可以继续保持 private，读取仍然必须是有效的 OSS 签名请求。
