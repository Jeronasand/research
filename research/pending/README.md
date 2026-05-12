# 待调研

待调研目录只维护任务索引，不直接作为前端预览包目录。

## Canonical Task File

- `tasks.json`: 前端卡片目录读取的待调研任务清单
- `tasks.schema.json`: 字段规范

## Field Rules

- `id`: 必填，小写 slug，全局唯一。
- `title`: 必填，卡片标题。
- `priority`: 建议填写 `P0`、`P1`、`P2`。
- `summary`: 建议填写一句话背景。
- `request`: 建议填写需要调研回答的问题。
- `expectedOutput`: 建议填写期望产物，例如 `产品调研 HTML + 技术调研 HTML`。
- `targetPath`: 建议填写后续静态包目录，例如 `research/in-progress/<id>/`。
- `tags`: 可选，字符串数组。
- `inputs`: 可选，输入材料数组；每项可包含 `type`、`label`、`path`、`url`、`note`。
- `owner`: 可选，负责人。
- `createdAt` / `updatedAt`: 可选，`YYYY-MM-DD`。

启动调研后，把产出的 Web 静态包放到 `research/in-progress/<id>/`，入口文件为 `index.html`。
