# Git Commit Convention

## 用途

这个 skill 用于帮助 Codex 根据目标仓库的真实改动和本地提交规范生成 git commit 内容，也可以在用户要求提交时辅助完成检查、暂存、提交和结果汇报。

## 适用场景

- 用户要求“帮我写 commit message”。
- 用户要求“按照仓库规范提交”。
- 仓库有 `AGENTS.md`、`CONTRIBUTING.md`、`.gitmessage` 或其他提交规范。
- 仓库有 `CONVENTIONS.md` 或其他项目约定文件，里面定义了提交单元、发布单元、tag 或生成文件规则。
- 需要根据 staged/unstaged diff 判断提交类型和提交摘要。

## 引用方式

在目标仓库的 `.codex/public-skills.yaml` 中选择固定版本：

```yaml
skills:
  - name: git-commit-convention
    repo: git@github.com:Jeronasand/public-skills.git
    ref: git-commit-convention/v1.0.7
```

## 常用输出

当仓库只要求 `type: subject` 时，输出类似：

```text
feat: add git commit convention skill
docs: update repository usage guide
fix: correct validation command
```

## 混乱改动处理

如果当前 diff 同时包含多个不相关目的，例如功能改动、bug 修复、格式化、生成文件、文档调整混在一起，Codex 不能直接合成一个 commit。

Codex 必须优先读取仓库自己的规则文件，例如 `AGENTS.md`、`CONVENTIONS.md`、`CONTRIBUTING.md`、`.gitmessage` 和 README 中的协作说明。如果仓库规则定义了提交单元、发布单元、生成文件归属或 tag 规则，应按这些本地规则判断拆分边界。

Codex 应默认把不同业务目的拆成不同提交。只有在用户明确要求合并为一个提交，或仓库规则明确把这些文件定义为同一个提交/发布单元时，才可以合并。

例如下面这种提交记录是错误的，因为“业务依赖/代码迁移”和“repo-local skill 安装”不是同一个提交目的：

```text
chore: update messaging package and commit skill
```

应该拆成两个提交：

```text
chore: update messaging package
chore: install git commit convention skill
```

如果 Codex 要实际 stage 和 commit，应先说明建议拆分的提交组，并询问用户确认。只有用户确认后，才可以按组分别 stage 和 commit；如果用户明确要求一个 commit，则使用一个能准确覆盖整体范围的提交信息。

## Agent 安装 Prompt

复制下面这句话给目标仓库里的 Codex/agent：

```text
请从 git@github.com:Jeronasand/public-skills.git 安装 public skill `git-commit-convention`，固定版本 `git-commit-convention/v1.0.7`，安装到当前仓库 `.codex/skills/git-commit-convention`；安装前请检查 `skills/associations.json`，如果存在相关 skill，请先询问我是否一起安装。
```

## 环境变量

这个 skill 不需要环境变量。

## 作者和来源

- 作者：`Jeronasand & Codex`
- 来源类型：`original`
- 来源记录：[SOURCE.md](./SOURCE.md)

## 版本

- `v1.0.7`：明确依赖/代码迁移和 repo-local skill 安装等不同业务目的必须拆成多个提交记录。
- 当前版本：`git-commit-convention/v1.0.7`
- `v1.0.6`：读取仓库约定文件，并按仓库定义的提交/发布单元判断拆分提交。
- `v1.0.5`：补充可复制给 agent 的安装 prompt。
- `v1.0.4`：当改动内容混乱或跨多个主题时，先提示用户是否分开提交。
- `v1.0.3`：补充独立 RELEASE.md 发布记录。
- `v1.0.2`：补充中文 README。
- `v1.0.1`：补充来源记录。
- `v1.0.0`：新增 git 提交规范 skill。
