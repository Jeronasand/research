#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  init_react_ts_web.sh --project-dir <dir> [--package-manager npm|pnpm|yarn|bun] [--dry-run]

Initializes a Vite React + TypeScript project, installs React Router and Tailwind CSS,
and writes a componentized baseline structure.

Options:
  --project-dir <dir>          Target project directory, required.
  --package-manager <name>     npm, pnpm, yarn, or bun. Default: npm.
  --dry-run                    Print planned commands and file writes only.
  -h, --help                   Show this help.

Safety:
  The target directory must not already contain package.json.
  Existing projects should be patched manually by Codex using this skill.
EOF
}

project_dir=""
package_manager="npm"
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir)
      project_dir="${2:-}"
      shift 2
      ;;
    --package-manager)
      package_manager="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$project_dir" ]]; then
  echo "Error: --project-dir is required" >&2
  usage
  exit 1
fi

if [[ "$project_dir" != "/" ]]; then
  project_dir="${project_dir%/}"
fi

case "$package_manager" in
  npm|pnpm|yarn|bun) ;;
  *)
    echo "Error: unsupported package manager: $package_manager" >&2
    exit 1
    ;;
esac

target_parent="$(cd "$(dirname "$project_dir")" && pwd)"
target_name="$(basename "$project_dir")"
target="$target_parent/$target_name"

if [[ -f "$target/package.json" ]]; then
  echo "Error: $target already contains package.json. Patch existing projects manually." >&2
  exit 1
fi

run() {
  if [[ "$dry_run" -eq 1 ]]; then
    printf '+'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

run_in() {
  local cwd="$1"
  shift
  if [[ "$dry_run" -eq 1 ]]; then
    printf '+ (cd %q &&' "$cwd"
    printf ' %q' "$@"
    printf ' )\n'
  else
    (cd "$cwd" && "$@")
  fi
}

write_file() {
  local file="$1"
  if [[ "$dry_run" -eq 1 ]]; then
    echo "WRITE $file"
    cat >/dev/null
    return
  fi
  mkdir -p "$(dirname "$file")"
  cat >"$file"
}

remove_if_exists() {
  local file="$1"
  if [[ "$dry_run" -eq 1 ]]; then
    echo "REMOVE_IF_EXISTS $file"
  else
    rm -f "$file"
  fi
}

case "$package_manager" in
  npm)
    run_in "$target_parent" npm create vite@latest "$target_name" -- --template react-ts
    run npm --prefix "$target" install
    run npm --prefix "$target" install react-router tailwindcss @tailwindcss/vite
    ;;
  pnpm)
    run_in "$target_parent" pnpm create vite "$target_name" --template react-ts
    run pnpm --dir "$target" install
    run pnpm --dir "$target" add react-router tailwindcss @tailwindcss/vite
    ;;
  yarn)
    run_in "$target_parent" yarn create vite "$target_name" --template react-ts
    run yarn --cwd "$target" install
    run yarn --cwd "$target" add react-router tailwindcss @tailwindcss/vite
    ;;
  bun)
    run_in "$target_parent" bun create vite "$target_name" --template react-ts
    run bun install --cwd "$target"
    run bun add --cwd "$target" react-router tailwindcss @tailwindcss/vite
    ;;
esac

write_file "$target/vite.config.ts" <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
EOF

write_file "$target/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app/App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
EOF

write_file "$target/src/styles.css" <<'EOF'
@import "tailwindcss";

html {
  background: #f8fafc;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

a {
  color: inherit;
}
EOF

write_file "$target/src/app/App.tsx" <<'EOF'
import { AppRoutes } from "./routes";

export function App() {
  return <AppRoutes />;
}
EOF

write_file "$target/src/app/routes.tsx" <<'EOF'
import { Route, Routes } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { AboutPage } from "../pages/AboutPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
EOF

write_file "$target/src/components/layout/AppShell.tsx" <<'EOF'
import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: false },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            React TS Web
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
EOF

write_file "$target/src/pages/HomePage.tsx" <<'EOF'
export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Initialized app
        </p>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">
          React + TypeScript + Tailwind
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          This project is ready for componentized development, route management,
          and production builds.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {["React", "TypeScript", "Tailwind CSS"].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-950">{item}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
EOF

write_file "$target/src/pages/AboutPage.tsx" <<'EOF'
export function AboutPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
        About
      </h1>
      <p className="max-w-2xl text-base leading-7 text-slate-600">
        Add product-specific routes, shared components, and domain modules from
        this baseline.
      </p>
    </section>
  );
}
EOF

write_file "$target/src/pages/NotFoundPage.tsx" <<'EOF'
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
        Page not found
      </h1>
      <Link className="text-sm font-medium text-slate-700 underline" to="/">
        Back to home
      </Link>
    </section>
  );
}
EOF

remove_if_exists "$target/src/App.css"
remove_if_exists "$target/src/App.tsx"
remove_if_exists "$target/src/index.css"

echo "Done. Next:"
echo "  cd $target"
case "$package_manager" in
  npm) echo "  npm run build" ;;
  pnpm) echo "  pnpm build" ;;
  yarn) echo "  yarn build" ;;
  bun) echo "  bun run build" ;;
esac
