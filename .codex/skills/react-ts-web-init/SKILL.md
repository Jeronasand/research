---
name: react-ts-web-init
description: "Initialize or normalize a React + TypeScript web project with componentized structure, React Router route management, and Tailwind CSS through the official Vite plugin. Use when Codex needs to scaffold a frontend app, convert an empty repo into a Vite React TS app, or enforce a clean web project baseline."
---

# React TS Web Init

Use this skill when a web frontend project needs a standard React + TypeScript baseline:

- React + TypeScript via Vite.
- Componentized development with separated `app`, `components`, and `pages` folders.
- Route management with React Router.
- Tailwind CSS through the official Vite plugin.

## Default Stack

- Build tool: Vite.
- Template: `react-ts`.
- Routing: `react-router` declarative SPA routing.
- Styling: Tailwind CSS using `tailwindcss` and `@tailwindcss/vite`.
- Package manager: prefer the target repo's existing package manager; default to `npm` in empty repos.

Current official references are recorded in `references/react-ts-tailwind-router.md`.

## Empty Repo Workflow

If the target directory is empty or intentionally being initialized as a new web project:

```bash
.codex/skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir . \
  --package-manager npm \
  --dry-run
```

After reviewing the dry-run output:

```bash
.codex/skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir . \
  --package-manager npm
```

Run verification:

```bash
npm run build
```

Use `pnpm` or another package manager only when the repo already uses it.

## Existing Repo Workflow

If the repo already has a frontend:

1. Inspect `package.json`, lockfiles, `vite.config.*`, `src/`, and existing routing/styling choices.
2. Do not overwrite a working app blindly. Patch the project into the expected shape.
3. Install missing dependencies only:
   - `react-router`
   - `tailwindcss`
   - `@tailwindcss/vite`
4. Configure `vite.config.ts` to include both `react()` and `tailwindcss()`.
5. Ensure the app imports a single CSS entry containing `@import "tailwindcss";`.
6. Wrap the app in `BrowserRouter` unless the repo explicitly needs hash routing or another router mode.
7. Create or align the route and component structure.
8. Run the repo's build/typecheck command.

## Expected Structure

Use this structure unless the existing repo already has an equivalent convention:

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

Guidelines:

- Put route composition in `src/app/routes.tsx`.
- Put app shell and layout navigation in `src/components/layout/`.
- Put route screens in `src/pages/`.
- Keep shared reusable UI under `src/components/`.
- Keep global Tailwind import in one CSS entry.

## Routing Baseline

Use React Router's declarative SPA mode for ordinary Vite apps:

```tsx
import { BrowserRouter } from "react-router";
```

Create routes with `Routes`, `Route`, `Outlet`, `NavLink`, and a catch-all page. Do not install `react-router-dom` for new projects unless the existing repo already uses it or the user explicitly asks for that package.

## Tailwind Baseline

Install Tailwind with the Vite plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

Configure:

```ts
import tailwindcss from "@tailwindcss/vite";
```

CSS entry:

```css
@import "tailwindcss";
```

Do not create old Tailwind v3 `content` config or `@tailwind base/components/utilities` boilerplate unless the repo is intentionally pinned to Tailwind v3.

## Optional OSS Upload Association

If the user wants to publish the built `dist/` output to Alibaba Cloud OSS, offer to install `oss-upload-folder` as an optional follow-up. Do not install it silently.

If installed, use its preview-first workflow after `npm run build`:

```bash
.codex/skills/oss-upload-folder/scripts/upload_folder_to_oss_cli.sh \
  --local-dir ./dist \
  --oss-url oss://example-bucket/site/ \
  --dry-run
```

## Validation

Before finishing a project initialization:

- Confirm `package.json` scripts include a build command.
- Run the build command, usually `npm run build`.
- If a dev server is needed for user testing, start it and report the local URL.
- For static deployment, keep SPA fallback, base path, and OSS/CDN cache behavior explicit.
