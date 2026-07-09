import { apiClient } from "./apiClient";
import { DocumentItem, DocumentType } from "@/types";

export const documentService = {
  getAll: async (assetId?: number): Promise<DocumentItem[]> => {
    const { data } = await apiClient.get<DocumentItem[]>("/documents", {
      params: assetId ? { assetId } : undefined,
    });
    return data;
  },

  upload: async (file: File, assetId: number, documentType: DocumentType): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetId", String(assetId));
    formData.append("documentType", documentType);

    const { data } = await apiClient.post<DocumentItem>("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getDownloadUrl: async (id: number): Promise<{ fileName: string; downloadUrl: string }> => {
    const { data } = await apiClient.get(`/documents/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};
