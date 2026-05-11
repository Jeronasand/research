# 调研仓库规范

English version: `CONVENTIONS.md`

## 目的

这个仓库是一个有序、可版本管理的多调研归档库。仓库优先保证快速查找、可重复更新和清晰历史。

## 排序模型

调研按数字前缀排序，不按类别分组。

```text
research/
  INDEX.md
  INDEX.zh-CN.md
  0001-topic-slug/
  0002-topic-slug/
```

规则：

- 新建调研时使用下一个未占用的四位数字编号。
- 编号后使用简短的小写 slug。
- 所有调研条目都直接放在 `research/` 下同一层级。
- 不创建类别目录。

## 调研条目结构

每个调研条目使用以下结构：

```text
research/0001-topic-slug/
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

`README.md` 是当前英文入口总览。`README.zh-CN.md` 是对应的中文入口总览。完整调研内容必须按类型拆分：

- 产品调研：`product.md` 和 `product.zh-CN.md`
- 技术调研：`technical.md` 和 `technical.zh-CN.md`

所有当前文件都应包含：

- 标题
- 当前版本
- 状态
- 最后更新日期
- 范围
- 关键结论
- 待确认问题
- 来源列表或来源说明

`versions/` 保存不可变的调研快照。产品快照放在 `versions/product/`；技术快照放在 `versions/technical/`。每次有意义的更新都新增一个版本。

`assets/` 是可选目录，只保存属于该调研条目的支持文件。

## 文档语言

英文和中文文档需要成对维护：

- 英文：使用基础文件名，例如 `README.md`、`product.md`、`technical.md`、`CONVENTIONS.md`、`research/INDEX.md`、`versions/product/v0.1.0.md`。
- 中文：使用 `.zh-CN.md` 后缀，例如 `README.zh-CN.md`、`product.zh-CN.md`、`technical.zh-CN.md`、`CONVENTIONS.zh-CN.md`、`research/INDEX.zh-CN.md`、`versions/product/v0.1.0.zh-CN.md`。

当结论、版本、状态、来源或路径在一个语言文件中变化时，必须在同一次改动中更新另一个语言文件。不要为了语言创建分类目录。

## 调研类型规则

产品调研和技术调研必须在每个调研条目内部拆开。

产品调研应覆盖：

- 定位
- 用户角色和场景
- 功能表面
- 商业和定价模型
- 竞争角度
- 产品风险和产品待确认问题

技术调研应覆盖：

- 架构和实现信号
- 部署和运行模型
- 集成和 API
- 数据、认证和权限边界
- 可观测性和运维健康度
- 技术风险和技术待确认问题

不要创建 `research/product/` 或 `research/technical/` 目录。顶层调研列表仍按 ID 排序；产品/技术拆分发生在每个调研条目内部。

## 版本规则

使用 `vMAJOR.MINOR.PATCH`。

- `MAJOR`：结论、范围或核心假设发生不兼容变化。
- `MINOR`：新增来源、新增对比维度或新增有意义的结论。
- `PATCH`：错别字、格式、引用或措辞修正。

草稿和早期调研使用 `v0.x.y`。当调研达到稳定基线时使用 `v1.0.0`。

## 索引规则

`research/INDEX.md` 和 `research/INDEX.zh-CN.md` 必须按 ID 排序。索引应展示 ID、主题、当前版本、状态、更新时间和路径。

状态：

- `draft`：已有初始材料，但结论尚不稳定。
- `active`：仍在持续更新来源或决策。
- `stable`：当前结论可作为可用基线。
- `archived`：保留历史，不再预期主动更新。

## Skill 规则

仓库本地 skill 放在 `.codex/skills/`。

- `.codex/skills/research-capability`：负责创建和更新调研内容。
- `.codex/skills/research-repo-conventions`：负责维护仓库结构和规则。
- `.codex/skills/git-commit-convention`：固定安装的公共 skill，用于 git 版本管理和提交信息。

如果发现会重复出现的工作流规则，应更新对应 skill，让后续工作复用。

## Git 提交规则

提交内容必须遵循仓库 git 提交规范。提交前使用已安装的 `git-commit-convention` skill。

按目的拆分提交：

- 调研内容更新
- 仓库规范更新
- 仓库本地 skill 更新
- 依赖或工具更新

除非用户明确要求合并，否则不要把无关的调研和工具改动放在同一个提交里。
