# React TS Web Init

## 用途

这个 skill 用于初始化或规范化一个 Web 前端项目，默认技术栈为：

- React + TypeScript。
- Vite。
- 组件化开发目录。
- React Router 路由管理。
- Tailwind CSS，使用官方 Vite 插件方式接入。

适合空仓库初始化、已有 Web 项目补齐基础工程结构，或让 Codex 在目标仓库中按统一规范创建前端应用。

## 默认工程约定

推荐结构：

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    layout/
      AppShell.tsx
  pages/
    HomePage.tsx
    AboutPage.tsx
    NotFoundPage.tsx
  styles.css
  main.tsx
```

默认使用：

- `npm create vite@latest <project> -- --template react-ts`
- `react-router`
- `tailwindcss`
- `@tailwindcss/vite`

Tailwind 入口使用：

```css
@import "tailwindcss";
```

Vite 配置使用：

```ts
import tailwindcss from "@tailwindcss/vite";
```

## 引用方式

在目标仓库的 `.codex/public-skills.yaml` 中选择固定版本：

```yaml
skills:
  - name: react-ts-web-init
    repo: git@github.com:Jeronasand/public-skills.git
    ref: react-ts-web-init/v1.0.0
```

## Agent 安装 Prompt

复制下面这句话给目标仓库里的 Codex/agent：

```text
请从 git@github.com:Jeronasand/public-skills.git 安装 public skill `react-ts-web-init`，固定版本 `react-ts-web-init/v1.0.0`，安装到当前仓库 `.codex/skills/react-ts-web-init`；安装前请检查 `skills/associations.json`，如果存在相关 skill，请先询问我是否一起安装。
```

## 快速初始化

先 dry-run：

```bash
.codex/skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir . \
  --package-manager npm \
  --dry-run
```

确认后执行：

```bash
.codex/skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir . \
  --package-manager npm
```

验证：

```bash
npm run build
```

如果目标仓库已有 `pnpm-lock.yaml`、`yarn.lock` 或 `bun.lockb`，应优先沿用该仓库的包管理器，不要强行改成 `npm`。

## 已有项目改造

已有项目不要直接覆盖。先检查：

- `package.json`
- 锁文件
- `vite.config.*`
- `src/`
- 现有路由和 CSS 方案

再补齐：

- `react-router` 路由入口。
- `tailwindcss` 和 `@tailwindcss/vite`。
- `src/app/`、`src/components/`、`src/pages/` 的组件化边界。
- `npm run build` 或仓库等价构建命令。

## 可选关联 skill

如果初始化后的 Web 项目需要把 `dist/` 发布到阿里云 OSS，可选安装：

- `oss-upload-folder`

安装前必须根据 `skills/associations.json` 主动询问用户，不要静默安装。

## 官方参考

- Tailwind CSS Vite 安装文档：<https://tailwindcss.com/docs/installation/using-vite>
- React Router Declarative 安装文档：<https://reactrouter.com/start/declarative/installation>
- React Router 路由文档：<https://reactrouter.com/start/framework/routing>

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

- 当前版本：`react-ts-web-init/v1.0.0`
- `v1.0.0`：新增 React + TypeScript + Vite + React Router + Tailwind CSS Web 初始化 skill，并关联可选 OSS 上传发布流程。
