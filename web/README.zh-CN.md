# 调研双桶预览

English version: `README.md`

## 运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5173/`。

## 数据源 Manifest

预览桶是 `research-preview`，地域 endpoint 为 `oss-cn-shenzhen.aliyuncs.com`。
数据源 OSS 桶是 `research-datas`，地域 endpoint 为 `oss-cn-beijing.aliyuncs.com`，需要暴露类似下面的 JSON manifest：

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
