"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/services/authConfig";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (strict mode / re-renders)
    if (!isAuthenticated || syncedRef.current) return;
    syncedRef.current = true;
    setSyncing(true);
    setError(null);

    // Sync the Entra ID identity with our local Users table, then head to the dashboard.
    authService
      .login()
      .then(() => router.replace("/dashboard"))
      .catch((err) => {
        console.error("Login sync failed:", err);
        setError("Could not sync with the backend API. Make sure the API server is running on port 5000.");
        syncedRef.current = false; // allow retry
      })
      .finally(() => setSyncing(false));
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1c2e]">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-3 w-3 bg-amber-500 rotate-45" />
          <h1 className="text-xl font-semibold text-slate-900">BuildTrack</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Cloud-based construction asset management</p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </p>
        )}

        {syncing ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f1c2e] border-t-transparent" />
            <span className="text-sm text-slate-500">Completing sign in…</span>
          </div>
        ) : (
          <button
            onClick={() => instance.loginRedirect(loginRequest)}
            disabled={syncing}
            className="w-full rounded-md bg-[#0f1c2e] py-2.5 text-sm font-medium text-white hover:bg-[#182a44] transition-colors disabled:opacity-50"
          >
            Sign in with Microsoft
          </button>
        )}

        <p className="mt-6 text-xs text-slate-400 text-center">
          Authentication is handled by Microsoft Entra ID.
        </p>
      </div>
    </main>
  );
}