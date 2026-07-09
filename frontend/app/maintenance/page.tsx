"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { maintenanceService } from "@/services/maintenanceService";
import { assetService } from "@/services/assetService";
import { MaintenanceRecord, Asset, MaintenanceStatus } from "@/types";

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetId: "",
    lastService: "",
    nextService: "",
    notes: "",
    status: "Scheduled" as MaintenanceStatus,
  });

  const load = async () => {
    setLoading(true);
    const [m, a] = await Promise.all([maintenanceService.getAll(), assetService.getAll()]);
    setRecords(m);
    setAssets(a);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await maintenanceService.create({ ...form, assetId: Number(form.assetId) });
    setShowForm(false);
    setForm({ assetId: "", lastService: "", nextService: "", notes: "", status: "Scheduled" });
    load();
  };

  const handleStatusUpdate = async (record: MaintenanceRecord, status: MaintenanceStatus) => {
    await maintenanceService.update(record.maintenanceId, {
      lastService: record.lastService,
      nextService: record.nextService,
      notes: record.notes || undefined,
      status,
    });
    load();
  };

  return (
    <AppShell title="Maintenance">
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-[#0f1c2e] hover:bg-amber-400"
        >
          {showForm ? "Cancel" : "+ Schedule Maintenance"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Asset</label>
            <select required value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Select asset…</option>
              {assets.map((a) => <option key={a.assetId} value={a.assetId}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceStatus })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Last Service</label>
            <input required type="date" value={form.lastService} onChange={(e) => setForm({ ...form, lastService: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Next Service</label>
            <input required type="date" value={form.nextService} onChange={(e) => setForm({ ...form, nextService: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="rounded-md bg-[#0f1c2e] px-5 py-2 text-sm font-medium text-white hover:bg-[#182a44]">
              Save Maintenance Record
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Last Service</th>
              <th className="px-5 py-3 font-medium">Next Service</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">Loading…</td></tr>}
            {!loading && records.map((r) => (
              <tr key={r.maintenanceId} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-900">{r.assetName}</td>
                <td className="px-5 py-3 text-slate-600">{new Date(r.lastService).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-slate-600">{new Date(r.nextService).toLocaleDateString()}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusUpdate(r, e.target.value as MaintenanceStatus)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </td>
              </tr>
            ))}
            {!loading && records.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No maintenance records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
