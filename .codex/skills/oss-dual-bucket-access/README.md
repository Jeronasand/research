# OSS Dual Bucket Access

## 用途

这个 skill 用于处理阿里云 OSS 双桶访问：

- 一个 OSS 桶作为登录桶，用用户提供的 OSS AK 或 STS token 做登录、会话校验或身份验证。
- 一个 OSS 桶作为数据源桶，数据读取、列举、上传、同步、浏览器访问、签名 URL、静态站点或管理类操作都必须先问清楚用户要做哪种访问。

核心原则：登录桶和数据源桶职责分离，数据源桶按用户确认的访问方式做最小权限访问。

## 适用场景

- 私有控制台需要用户用自己的 OSS AK 或 STS 登录。
- 登录桶只负责证明用户具备某个 OSS 会话，不承载业务数据。
- 业务数据、文档、图片、构建产物或技能数据放在另一个 OSS 数据源桶。
- 数据源桶的访问方式不确定，需要 agent 先询问用户是只读、列举、上传同步、浏览器 CORS、签名 URL、静态站点/CDN 还是删除/管理。

## 引用方式

在目标仓库的 `.codex/public-skills.yaml` 中选择固定版本：

```yaml
skills:
  - name: oss-dual-bucket-access
    repo: git@github.com:Jeronasand/public-skills.git
    ref: oss-dual-bucket-access/v1.0.0
```

## Agent 安装 Prompt

复制下面这句话给目标仓库里的 Codex/agent：

```text
请从 git@github.com:Jeronasand/public-skills.git 安装 public skill `oss-dual-bucket-access`，固定版本 `oss-dual-bucket-access/v1.0.0`，安装到当前仓库 `.codex/skills/oss-dual-bucket-access`；安装前请检查 `skills/associations.json`，如果存在相关 skill，请先询问我是否一起安装。
```

## 环境变量

如需默认配置，在目标仓库的 skill 目录中复制 env 文件：

```bash
cp .codex/skills/oss-dual-bucket-access/.env.oss-dual-bucket-access.example \
  .codex/skills/oss-dual-bucket-access/.env.oss-dual-bucket-access
```

登录桶变量：

```text
OSS_LOGIN_ENDPOINT=
OSS_LOGIN_BUCKET=
OSS_LOGIN_PREFIX=
OSS_LOGIN_ACCESS_KEY_ID=
OSS_LOGIN_ACCESS_KEY_SECRET=
OSS_LOGIN_STS_TOKEN=
OSS_LOGIN_STS_EXPIRES_AT=
```

数据源桶变量：

```text
OSS_DATA_ENDPOINT=
OSS_DATA_BUCKET=
OSS_DATA_PREFIX=
OSS_DATA_ACCESS_MODE=
OSS_DATA_ACCESS_KEY_ID=
OSS_DATA_ACCESS_KEY_SECRET=
OSS_DATA_STS_TOKEN=
OSS_DATA_STS_EXPIRES_AT=
```

不要把真实密钥写入仓库，只能放在本地 `.env.oss-dual-bucket-access` 或用户明确指定的本机凭证配置中。

## 必问问题

数据源桶访问前，agent 必须先问：

```text
数据源 OSS 桶需要哪种访问方式：只读下载、列举+下载、上传/同步、浏览器端 CORS 读取、预签名 URL/临时授权、静态站点/CDN 读取，还是删除/管理类操作？
```

如果用户已经明确说出访问方式，可以直接进入对应流程；如果涉及写入、同步、删除、CORS、Bucket Policy、静态站点或 CDN 配置，执行前仍然需要确认副作用。

## 相关 skill

- `oss-upload-folder`：当数据源桶需要上传或同步本地目录时建议一起安装。
- `bucket-upload-policy`：当需要判断大文件或二进制 artifact 是否应该进入 OSS 时建议一起安装。

## 测试记录

人工测试记录放在：

```text
examples/manual-test.md
```

## 作者和来源

- 作者：`Jeronasand & Codex`
- 来源类型：`original`
- 来源记录：[SOURCE.md](./SOURCE.md)

## 版本

- 当前版本：`oss-dual-bucket-access/v1.0.0`
- `v1.0.0`：新增 OSS 双桶访问规划 skill，明确登录桶 AK/STS 登录和数据源桶访问模式必问规则。
