"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { assetService } from "@/services/assetService";
import { documentService } from "@/services/documentService";
import { Asset, MaintenanceRecord, DocumentItem, AssetStatus } from "@/types";

export default function AssetDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await assetService.getById(id);
    setAsset(data.asset);
    setMaintenance(data.maintenanceHistory);
    setDocuments(data.documents);
    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status: AssetStatus) => {
    await assetService.updateStatus(id, status);
    load();
  };

  const handleDownload = async (docId: number) => {
    const { downloadUrl } = await documentService.getDownloadUrl(docId);
    window.open(downloadUrl, "_blank");
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm("Delete this document?")) return;
    await documentService.delete(docId);
    load();
  };

  if (loading || !asset) {
    return (
      <AppShell title="Asset Details">
        <p className="text-sm text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={asset.name}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-slate-900">Asset Information</h2>
              <StatusBadge status={asset.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Asset ID" value={`#${asset.assetId}`} />
              <Info label="Category" value={asset.category} />
              <Info label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} />
              <Info label="Site" value={asset.site} />
              <Info label="Assigned Engineer" value={asset.assignedEngineer || "—"} />
              <Info label="Next Service" value={asset.nextServiceDate ? new Date(asset.nextServiceDate).toLocaleDateString() : "—"} />
            </dl>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <label className="block text-xs text-slate-500 mb-1">Update Status</label>
              <select
                value={asset.status}
                onChange={(e) => handleStatusChange(e.target.value as AssetStatus)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Available">Available</option>
                <option value="InUse">In Use</option>
                <option value="UnderMaintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-medium text-slate-900 mb-4">Maintenance History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 font-medium">Last Service</th>
                  <th className="py-2 font-medium">Next Service</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.maintenanceId} className="border-b border-slate-50 last:border-0">
                    <td className="py-2">{new Date(m.lastService).toLocaleDateString()}</td>
                    <td className="py-2">{new Date(m.nextService).toLocaleDateString()}</td>
                    <td className="py-2"><StatusBadge status={m.status} /></td>
                    <td className="py-2 text-slate-500">{m.notes || "—"}</td>
                  </tr>
                ))}
                {maintenance.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-slate-400">No maintenance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="font-medium text-slate-900 mb-4">Documents</h2>
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.documentId} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate text-slate-800">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">{doc.documentType}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleDownload(doc.documentId)} className="text-sky-600 hover:underline text-xs">
                    Download
                  </button>
                  <button onClick={() => handleDeleteDoc(doc.documentId)} className="text-red-600 hover:underline text-xs">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {documents.length === 0 && <p className="text-sm text-slate-400">No documents uploaded.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
