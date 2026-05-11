# React TS Web Init Notes

Reference date: 2026-05-11.

## Tailwind CSS with Vite

Official Tailwind CSS Vite setup uses:

```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
```

CSS entry:

```css
@import "tailwindcss";
```

Source: <https://tailwindcss.com/docs/installation/using-vite>

## React Router for Vite React Apps

For a normal Vite React SPA, use the declarative setup:

```bash
npm i react-router
```

Wrap the app:

```tsx
import { BrowserRouter } from "react-router";
```

Source: <https://reactrouter.com/start/declarative/installation>

## Route Organization

For simple Vite SPA projects, keep route declarations near `src/app/routes.tsx` and route pages under `src/pages/`.

React Router framework mode also supports route config files and route modules; use that only when the project intentionally adopts React Router framework mode.

Source: <https://reactrouter.com/start/framework/routing>
