# 调研双桶预览

English version: `README.md`

## 运行

```bash
npm install
npm run sync:data
npm run dev
```

打开 `http://127.0.0.1:5173/`。

`npm run sync:data` 会扫描私有仓库目录结构，刷新 `research/private-index.json`，并把待上传的私有数据写到 `web/research-data/`。这个生成目录不会进入公开静态包。

## 内容模型

- 调研交付物统一放在 `research/*.html`。
- 待调研主题单独放在 `research/pending/<topic>/`。
- skill 也可以是 HTML 页面，放在 `skills/<skill-id>/index.html`。
- 私有仓库索引是 `research/private-index.json`。
- OSS 数据 manifest 是 `web/research-data/manifest.json`。

预览端兼容 Markdown 和 HTML，但新增调研文档和 skill 交付物优先使用 HTML。

## 双桶访问

预览继续使用既有双桶方案：

- 预览桶：`research-preview`，endpoint `oss-cn-shenzhen.aliyuncs.com`，只托管公开授权页和应用壳。
- 数据桶：`research-pages`，endpoint `oss-cn-shenzhen.aliyuncs.com`，保持 private ACL，用户输入 OSS AK 或 STS 后由浏览器签名读取。
- manifest key：`research-data/manifest.json`。

首屏只做授权，没有后端服务。授权后，浏览器为私有 manifest 和选中的 HTML 对象生成短期有效的签名 `GET` URL。

开启“记住 AK/SK”后，凭证只会保存在当前浏览器的 `localStorage`，下次访问会自动授权。可通过“忘记凭证”清除本机保存副本。

## OSS CORS

私有数据桶需要 CORS 允许：

- methods: `GET`
- origin: 实际预览页面域名和本地开发域名

CORS 不会把 `research-pages` 变成公开桶。桶 ACL 继续保持 private，读取仍必须携带有效 OSS 签名。

## 从仓库根目录打包上传

发布时使用根目录 OSS 流程：

```bash
npm run package:oss
npm run upload:oss:dry-run
npm run upload:oss
```

这会保持两个桶分开：

- `dist/oss/auth-bucket/` -> `oss://research-preview/`
- `dist/oss/content-bucket/research-data/` -> `oss://research-pages/research-data/`
