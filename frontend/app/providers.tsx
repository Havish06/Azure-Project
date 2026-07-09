"use client";

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/services/apiClient";
import { useEffect, useState } from "react";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1c2e]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Initializing…</p>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Initialize MSAL
    // 2. Handle the redirect response from Microsoft Entra ID (extract tokens from URL)
    //    Without this, isAuthenticated stays false after redirect login, causing a loop.
    msalInstance
      .initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .then(() => setReady(true))
      .catch((err) => {
        console.error("MSAL initialization failed:", err);
        setReady(true); // still render so the user can retry
      });
  }, []);

  if (!ready) return <LoadingScreen />;

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}