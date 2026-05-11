# 调研仓库

English version: `README.md`

这个仓库用于保存多个独立调研。调研按数字前缀排序，并随着时间进行版本管理。

优先阅读：

- `AGENTS.md`：英文仓库指令
- `AGENTS.zh-CN.md`：中文仓库指令
- `CONVENTIONS.md`：英文仓库规范
- `CONVENTIONS.zh-CN.md`：中文仓库规范
- `research/INDEX.md`：英文调研排序列表
- `research/INDEX.zh-CN.md`：中文调研排序列表
- `.codex/skills/research-capability`：创建或更新调研
- `.codex/skills/research-repo-conventions`：维护仓库结构

调研条目不按类别分组。每个调研直接创建在 `research/` 下，例如 `0001-topic-slug/`、`0002-topic-slug/`，并把产品/技术历史分别保存在 `versions/product/` 和 `versions/technical/` 下的成对版本文件中。

每个调研条目内部，产品调研和技术调研必须分开：

- 产品调研：`product.md` 和 `product.zh-CN.md`
- 技术调研：`technical.md` 和 `technical.zh-CN.md`
- 产品快照：`versions/product/vMAJOR.MINOR.PATCH.md`
- 技术快照：`versions/technical/vMAJOR.MINOR.PATCH.md`

## 双桶预览

预览应用在 `web/`。

```bash
cd web
npm install
npm run sync:data
npm run dev
```

打开 `http://127.0.0.1:5173/`。

`npm run sync:data` 会把待上传数据生成到 `web/research-data/`。这个目录不会进入公开的静态预览包；它只能上传到 `research-datas`，不要上传到 `research-preview`。

预览使用两个 OSS 桶：

- 登录桶：`research-preview`，地域 endpoint 为 `oss-cn-shenzhen.aliyuncs.com`，使用用户 OSS AK 或 STS token，对探测对象发起签名 HEAD 请求来校验会话。
- 数据源桶：`research-datas`，地域 endpoint 为 `oss-cn-beijing.aliyuncs.com`，保持 private ACL，登录后由浏览器端签名 OSS 请求读取。

预览打开后只显示登录页。登录桶校验成功后，使用同一组 OSS AK 或 STS token 对私有数据源桶发起签名读取。

仓库不会提交真实密钥。数据桶不使用公开 ACL；浏览器端 OSS 读取仍需要 CORS 允许 `GET`/`HEAD`，并允许请求头 `Authorization`、`x-oss-date`、`x-oss-security-token`。
