"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/services/authConfig";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▤" },
  { href: "/assets", label: "Assets", icon: "▣" },
  { href: "/maintenance", label: "Maintenance", icon: "⚙" },
  { href: "/documents", label: "Documents", icon: "▦" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f1c2e] text-slate-200 flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 bg-amber-500 rotate-45" />
          <span className="text-lg font-semibold tracking-tight text-white">BuildTrack</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Asset Management · Azure</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-amber-500/15 text-amber-400 font-medium"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        {account ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{account.name}</p>
              <p className="text-xs text-slate-400 truncate">{account.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-amber-400 shrink-0"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => instance.loginRedirect(loginRequest)}
            className="w-full rounded-md bg-amber-500 py-2 text-sm font-medium text-[#0f1c2e] hover:bg-amber-400"
          >
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}