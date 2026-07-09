"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Only redirect to login if MSAL is idle (not handling a redirect) AND user is not authenticated.
    // This prevents redirect loops during MSAL redirect processing.
    if (!isAuthenticated && inProgress === "none") {
      router.replace("/");
    }
  }, [isAuthenticated, inProgress, router]);

  // Show loading while MSAL is still processing (e.g. handling redirect callback)
  if (!isAuthenticated) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60">
        <header className="border-b border-slate-200 bg-white px-8 py-5">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}