"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { assetService } from "@/services/assetService";
import { documentService } from "@/services/documentService";
import { AssetStatus } from "@/types";

export default function AddAssetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    category: "",
    purchaseDate: "",
    site: "",
    assignedEngineer: "",
    status: "Available" as AssetStatus,
  });
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const asset = await assetService.create(form);
      if (manualFile) {
        await documentService.upload(manualFile, asset.assetId, "Manual");
      }
      router.push(`/assets/${asset.assetId}`);
    } catch (err) {
      setError("Failed to save asset. Confirm you're signed in as an Administrator.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Add Asset">
      <form onSubmit={handleSubmit} className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Asset Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input" />
          </Field>
          <Field label="Category">
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input" />
          </Field>
          <Field label="Purchase Date">
            <input required type="date" value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="input" />
          </Field>
          <Field label="Site">
            <input required value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}
              className="input" />
          </Field>
          <Field label="Assigned Engineer">
            <input value={form.assignedEngineer} onChange={(e) => setForm({ ...form, assignedEngineer: e.target.value })}
              className="input" />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssetStatus })}
              className="input">
              <option value="Available">Available</option>
              <option value="InUse">In Use</option>
              <option value="UnderMaintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </Field>
        </div>

        <Field label="Upload Manual (optional)">
          <input type="file" onChange={(e) => setManualFile(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-600" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-[#0f1c2e] hover:bg-amber-400 disabled:opacity-50">
            {submitting ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
