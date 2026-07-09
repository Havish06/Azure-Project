"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge } from "@/components/StatusBadge";
import { assetService } from "@/services/assetService";
import { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    assetService
      .getDashboardSummary()
      .then(setSummary)
      .catch(() => setError("Could not load dashboard data. Check that the API is running and reachable."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Dashboard">
      {loading && <p className="text-sm text-slate-500">Loading dashboard…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total Assets" value={summary.totalAssets} accent="slate" />
            <SummaryCard label="Available Assets" value={summary.availableAssets} accent="emerald" />
            <SummaryCard label="Under Maintenance" value={summary.underMaintenance} accent="amber" />
            <SummaryCard label="Active Sites" value={summary.activeSites} accent="sky" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Link href="/assets/add" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 transition-colors">
              <p className="font-medium text-slate-900">+ Add Asset</p>
              <p className="text-sm text-slate-500 mt-1">Register new equipment</p>
            </Link>
            <Link href="/maintenance" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 transition-colors">
              <p className="font-medium text-slate-900">Maintenance Schedule</p>
              <p className="text-sm text-slate-500 mt-1">View upcoming service dates</p>
            </Link>
            <Link href="/documents" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 transition-colors">
              <p className="font-medium text-slate-900">Documents</p>
              <p className="text-sm text-slate-500 mt-1">Manuals, images & warranties</p>
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-medium text-slate-900">Recent Assets</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Site</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentAssets.map((asset) => (
                  <tr key={asset.assetId} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/assets/${asset.assetId}`} className="text-slate-900 hover:text-amber-600">
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{asset.category}</td>
                    <td className="px-5 py-3 text-slate-600">{asset.site}</td>
                    <td className="px-5 py-3"><StatusBadge status={asset.status} /></td>
                  </tr>
                ))}
                {summary.recentAssets.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No assets yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
