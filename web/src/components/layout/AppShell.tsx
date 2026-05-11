import { Database, KeyRound, PanelsTopLeft } from "lucide-react";
import { Outlet } from "react-router";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
              <PanelsTopLeft size={19} aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-950">
                Research Preview
              </div>
              <div className="text-xs text-zinc-500">OSS signed document preview</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
              <KeyRound size={14} aria-hidden="true" />
              Browser AK/STS login
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5">
              <Database size={14} aria-hidden="true" />
              Private data bucket
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
