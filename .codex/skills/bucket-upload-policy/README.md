# Bucket Upload Policy

## 用途

这个 skill 用于规范：当某个 skill 涉及 PDF、图片、截图、视频、压缩包、二进制样例、大型测试文件等非代码/非 Markdown 文档资产时，不直接把这些文件提交进仓库，而是上传到 OSS 或 S3。

仓库里只保留链接、来源、校验信息和使用说明。

## 适用场景

- skill 来源包含 PDF。
- skill 需要截图、图片或视频作为参考。
- skill 需要较大的样例文件或二进制测试文件。
- skill 生成的产物需要长期公开访问。
- 希望仓库保持轻量，避免提交大文件、图片或无关二进制内容。

## 本仓库默认 OSS 目标

```text
地区: oss-cn-shenzhen
Bucket: public-skills
域名: public-skills.jeronasand.cn
OSS URI: oss://public-skills/
```

推荐路径：

```text
oss://public-skills/skills/<skill-name>/<version>/
https://public-skills.jeronasand.cn/skills/<skill-name>/<version>/
```

## 密钥配置在哪里

密钥不要写入仓库。

OSS 上传使用本机 OSS CLI 的本地配置。通常通过：

```bash
ossutil config
```

配置后密钥一般在用户目录下的本地配置文件，例如：

```text
~/.ossutilconfig
```

如果使用的是新版或不同 OSS CLI，实际路径以该 CLI 的 `config` / `help` 输出为准。无论路径在哪里，都只保留在本机，不提交到 git。

S3 上传使用 AWS CLI 本地配置：

```text
~/.aws/credentials
~/.aws/config
```

也不要提交到仓库。

## OSS 上传命令

使用 `oss-upload-folder` skill：

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./artifact-upload/<skill-name>/<version> \
  --oss-url oss://public-skills/skills/<skill-name>/<version>/ \
  --endpoint oss-cn-shenzhen.aliyuncs.com \
  --dry-run
```

确认 dry-run 范围后再去掉 `--dry-run`。

## S3 上传命令

使用 `aws-s3-upload-folder` skill：

```bash
.codex/skills/aws-s3-upload-folder/scripts/upload_folder_to_s3.sh \
  --local-dir ./artifact-upload/<skill-name>/<version> \
  --s3-uri s3://example-bucket/skills/<skill-name>/<version>/ \
  --dry-run
```

## 仓库内保留什么

仓库里保留 manifest，而不是大文件本身：

```markdown
| File | Public URL | Storage URI | Size | SHA-256 | Source |
| --- | --- | --- | --- | --- | --- |
| source.pdf | https://public-skills.jeronasand.cn/skills/example/v1.0.0/source.pdf | oss://public-skills/skills/example/v1.0.0/source.pdf | 123 KB | ... | community PDF |
```

## 作者和来源

- 作者：`Jeronasand & Codex`
- 来源类型：`original`
- 来源记录：[SOURCE.md](./SOURCE.md)

## 版本

- `v1.0.3`：修正 OSS 公开域名为 `public-skills.jeronasand.cn`。
- `v1.0.2`：补充可复制给 agent 的安装 prompt。
- `v1.0.1`：补充独立 RELEASE.md 发布记录。
- 当前版本：`bucket-upload-policy/v1.0.3`

## Agent 安装 Prompt

复制下面这句话给目标仓库里的 Codex/agent：

```text
请从 git@github.com:Jeronasand/public-skills.git 安装 public skill `bucket-upload-policy`，固定版本 `bucket-upload-policy/v1.0.3`，安装到当前仓库 `.codex/skills/bucket-upload-policy`；安装前请检查 `skills/associations.json`，如果存在相关 skill，请先询问我是否一起安装。
```
