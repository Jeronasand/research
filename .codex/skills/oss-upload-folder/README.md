# OSS Upload Folder

## 用途

这个 skill 用于把本地文件夹上传或同步到阿里云 OSS。默认使用已经安装好的 OSS 命令行工具，例如 `ossutil` 或 `osscli`，而不是 Node.js。

同时提供一个可选 Node.js 版本，只有当用户明确选择 Node.js 实现时才使用。

## 前提条件

默认 CLI 版本需要目标环境已经安装并配置好：

```bash
command -v ossutil || command -v osscli
```

如果走 Node.js 版本，目标项目需要自行安装：

```bash
npm install ali-oss
```

## 引用方式

在目标仓库的 `.codex/public-skills.yaml` 中选择固定版本：

```yaml
skills:
  - name: oss-upload-folder
    repo: git@github.com:Jeronasand/public-skills.git
    ref: oss-upload-folder/v1.0.3
```

## Agent 安装 Prompt

复制下面这句话给目标仓库里的 Codex/agent：

```text
请从 git@github.com:Jeronasand/public-skills.git 安装 public skill `oss-upload-folder`，固定版本 `oss-upload-folder/v1.0.3`，安装到当前仓库 `.codex/skills/oss-upload-folder`；安装前请检查 `skills/associations.json`，如果存在相关 skill，请先询问我是否一起安装。
```

## 环境变量

如需默认配置，在目标仓库的 skill 目录中复制 env 文件：

```bash
cp .codex/skills/oss-upload-folder/.env.oss-upload-folder.example \
  .codex/skills/oss-upload-folder/.env.oss-upload-folder
```

CLI 版本可使用：

```text
OSS_UPLOAD_CLI=
OSS_UPLOAD_ENDPOINT=
OSS_UPLOAD_DEFAULT_URL=
OSS_UPLOAD_DEFAULT_URLS=
```

Node.js 版本需要：

```text
OSS_NODE_DEFAULT_URL=
OSS_NODE_DEFAULT_URLS=
OSS_NODE_REGION=
OSS_NODE_BUCKET=
OSS_NODE_ENDPOINT=
OSS_NODE_ACCESS_KEY_ID=
OSS_NODE_ACCESS_KEY_SECRET=
```

不要把真实密钥写入仓库，只能放在本地 `.env.oss-upload-folder`。

## CLI 版本

先预览：

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

确认范围后上传：

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/
```

上传到多个桶或多个前缀：

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket-a/site/ \
  --oss-url oss://example-bucket-b/site/ \
  --dry-run
```

常用参数：

- `--endpoint <endpoint>`：指定 OSS endpoint。
- `--include <pattern>`：包含过滤，可重复。
- `--exclude <pattern>`：排除过滤，可重复。
- `--update`：只上传较新的文件。
- `--delete`：删除远端多余文件，危险操作。
- `--dry-run`：只预览不上传。

## Node.js 可选版本

只有用户明确选择 Node.js 版本时使用：

```bash
node .codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_node.mjs \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

Node.js 版本同样支持多个 `--oss-url`。

确认后去掉 `--dry-run` 上传。

## 测试记录

人工测试记录放在：

```text
examples/manual-test.md
```

## 作者和来源

- 作者：`Jeronasand & Codex`
- 来源类型：`derived-original`
- 来源记录：[SOURCE.md](./SOURCE.md)

## 版本

- `v1.0.3`：补充可复制给 agent 的安装 prompt。
- `v1.0.2`：补充独立 RELEASE.md 发布记录。
- 当前版本：`oss-upload-folder/v1.0.3`
- `v1.0.1`：支持多个 `--oss-url` 目标。
- `v1.0.0`：新增 OSS 上传 skill。
