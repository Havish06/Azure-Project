"use client";

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/services/apiClient";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
