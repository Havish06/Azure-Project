"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { documentService } from "@/services/documentService";
import { assetService } from "@/services/assetService";
import { DocumentItem, Asset, DocumentType } from "@/types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadAssetId, setUploadAssetId] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("Manual");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [docs, a] = await Promise.all([documentService.getAll(), assetService.getAll()]);
    setDocuments(docs);
    setAssets(a);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const assetName = (assetId: number) => assets.find((a) => a.assetId === assetId)?.name || `#${assetId}`;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadAssetId) return;
    setUploading(true);
    try {
      await documentService.upload(file, Number(uploadAssetId), uploadType);
      setFile(null);
      setUploadAssetId("");
      load();
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: number) => {
    const { downloadUrl } = await documentService.getDownloadUrl(id);
    window.open(downloadUrl, "_blank");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await documentService.delete(id);
    load();
  };

  return (
    <AppShell title="Documents">
      <form onSubmit={handleUpload} className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Asset</label>
          <select required value={uploadAssetId} onChange={(e) => setUploadAssetId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm w-48">
            <option value="">Select asset…</option>
            {assets.map((a) => <option key={a.assetId} value={a.assetId}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Type</label>
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value as DocumentType)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="Manual">Manual</option>
            <option value="Image">Image</option>
            <option value="Warranty">Warranty</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">File</label>
          <input required type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </div>
        <button type="submit" disabled={uploading}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-[#0f1c2e] hover:bg-amber-400 disabled:opacity-50">
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium">File Name</th>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">Loading…</td></tr>}
            {!loading && documents.map((doc) => (
              <tr key={doc.documentId} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 text-slate-900">{doc.fileName}</td>
                <td className="px-5 py-3 text-slate-600">{assetName(doc.assetId)}</td>
                <td className="px-5 py-3 text-slate-600">{doc.documentType}</td>
                <td className="px-5 py-3 text-slate-600">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                <td className="px-5 py-3 space-x-3">
                  <button onClick={() => handleDownload(doc.documentId)} className="text-sky-600 hover:underline">Download</button>
                  <button onClick={() => handleDelete(doc.documentId)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && documents.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No documents uploaded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
