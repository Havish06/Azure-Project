"use client";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/services/authConfig";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Sync the Entra ID identity with our local Users table, then head to the dashboard.
      authService.login().finally(() => router.replace("/dashboard"));
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1c2e]">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-3 w-3 bg-amber-500 rotate-45" />
          <h1 className="text-xl font-semibold text-slate-900">BuildTrack</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Cloud-based construction asset management</p>

        <button
          onClick={() => instance.loginRedirect(loginRequest)}
          className="w-full rounded-md bg-[#0f1c2e] py-2.5 text-sm font-medium text-white hover:bg-[#182a44] transition-colors"
        >
          Sign in with Microsoft
        </button>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Authentication is handled by Microsoft Entra ID.
        </p>
      </div>
    </main>
  );
}
