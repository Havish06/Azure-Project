"use client";

import { useIsAuthenticated } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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
