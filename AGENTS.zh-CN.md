# AGENTS.md 中文说明

English version: `AGENTS.md`

## 适用范围

这些指令适用于整个仓库。实际生效入口仍是 `AGENTS.md`，本文件是中文对照。

## 仓库目的

这个仓库保存多个独立调研。调研需要排序、版本管理，并随着时间持续维护。除非用户明确改变规则，否则不要把调研按主题放进分类目录。

## 调研结构

- 英文排序入口保留在 `research/INDEX.md`。
- 中文镜像排序入口保留在 `research/INDEX.zh-CN.md`。
- 每个调研直接放在 `research/` 下，使用四位数字前缀：`0001-topic-slug/`、`0002-topic-slug/`。
- 不创建 `ai/`、`market/`、`product/`、`tech/` 之类的分类目录。
- 每个调研在自己的 `versions/` 下维护版本历史。
- 当前可读摘要同时维护在 `README.md` 和 `README.zh-CN.md`。

预期结构：

```text
research/
  INDEX.md
  INDEX.zh-CN.md
  0001-topic-slug/
    README.md
    README.zh-CN.md
    product.md
    product.zh-CN.md
    technical.md
    technical.zh-CN.md
    versions/
      product/
        v0.1.0.md
        v0.1.0.zh-CN.md
      technical/
        v0.1.0.md
        v0.1.0.zh-CN.md
    assets/
```

## 调研类型

- 产品调研和技术调研必须分开维护。
- 产品调研使用 `product.md` 和 `product.zh-CN.md`。
- 技术调研使用 `technical.md` 和 `technical.zh-CN.md`。
- `README.md` 和 `README.zh-CN.md` 只作为入口总览；不要把完整产品分析和技术分析重新混回 README。
- 产品版本快照放在 `versions/product/`。
- 技术版本快照放在 `versions/technical/`。
- 顶层调研排序仍保持扁平；这个拆分发生在每个调研条目内部，不是在 `research/` 下创建分类目录。

## 文档语言

- 英文和中文文档需要成对维护。
- 英文文件使用基础文件名：`README.md`、`product.md`、`technical.md`、`CONVENTIONS.md`、`research/INDEX.md`、`versions/product/v0.1.0.md`。
- 中文文件使用 `.zh-CN.md` 后缀：`README.zh-CN.md`、`product.zh-CN.md`、`technical.zh-CN.md`、`CONVENTIONS.zh-CN.md`、`research/INDEX.zh-CN.md`、`versions/product/v0.1.0.zh-CN.md`。
- 成对文档要保持语义一致。结论、版本、状态、来源或路径在一个语言文件中更新时，另一个语言文件也必须同步更新。
- 不要为了语言拆分创建分类目录。

## 版本管理

- 调研版本文件使用 `vMAJOR.MINOR.PATCH`。
- 调研还处于探索或不稳定阶段时使用 `v0.x.y`。
- 当结论、范围或假设发生不兼容变化时升级 `MAJOR`。
- 当新增来源、对比或有意义结论时升级 `MINOR`。
- 只修正文案、格式或引用且不改变结论时升级 `PATCH`。
- 不要覆盖旧版本文件来表示新状态。应新增成对产品和/或技术版本文件，然后更新条目当前文件、`README.md`、`README.zh-CN.md`、`research/INDEX.md` 和 `research/INDEX.zh-CN.md`。

## 本地 Skills

- 创建、更新或审查调研内容时使用 `.codex/skills/research-capability`。
- 检查仓库结构、命名、版本规则或 skill 维护时使用 `.codex/skills/research-repo-conventions`。
- 保持这些仓库本地 skill 持续演进：如果发现重复出现的调研工作流缺口，应更新相关 skill，而不是只修当前文档。

## Git

- git commit 内容按仓库 git 提交规范编写。
- 使用 `.codex/skills/git-commit-convention` 生成提交信息并判断是否需要拆分提交。
- 不同目的的改动应拆成不同提交。尤其是调研内容改动和仓库本地 skill 或工具维护，除非用户要求合并，否则不要放进同一个提交。
