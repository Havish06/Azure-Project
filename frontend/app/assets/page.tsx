"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { assetService } from "@/services/assetService";
import { Asset } from "@/types";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: "", category: "", site: "", status: "" });

  const fetchAssets = async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(search).filter(([, v]) => v));
    const data = await assetService.getAll(params);
    setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    await assetService.delete(id);
    fetchAssets();
  };

  return (
    <AppShell title="Assets">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Name</label>
          <input
            value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm w-40"
            placeholder="Search name"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Category</label>
          <input
            value={search.category}
            onChange={(e) => setSearch({ ...search, category: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm w-40"
            placeholder="Category"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Site</label>
          <input
            value={search.site}
            onChange={(e) => setSearch({ ...search, site: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm w-40"
            placeholder="Site"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Status</label>
          <select
            value={search.status}
            onChange={(e) => setSearch({ ...search, status: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm w-40"
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="InUse">In Use</option>
            <option value="UnderMaintenance">Under Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <button
          onClick={fetchAssets}
          className="rounded-md bg-[#0f1c2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#182a44]"
        >
          Search
        </button>
        <Link
          href="/assets/add"
          className="ml-auto rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-[#0f1c2e] hover:bg-amber-400"
        >
          + Add Asset
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium">Asset ID</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Site</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && assets.map((asset) => (
              <tr key={asset.assetId} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 text-slate-500">#{asset.assetId}</td>
                <td className="px-5 py-3">
                  <Link href={`/assets/${asset.assetId}`} className="text-slate-900 hover:text-amber-600 font-medium">
                    {asset.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{asset.category}</td>
                <td className="px-5 py-3 text-slate-600">{asset.site}</td>
                <td className="px-5 py-3"><StatusBadge status={asset.status} /></td>
                <td className="px-5 py-3 space-x-3">
                  <Link href={`/assets/${asset.assetId}`} className="text-sky-600 hover:underline">View</Link>
                  <button onClick={() => handleDelete(asset.assetId)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && assets.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400">No assets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
