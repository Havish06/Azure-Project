import { apiClient } from "./apiClient";
import { Asset, AssetStatus, DashboardSummary } from "@/types";

export interface AssetSearchParams {
  name?: string;
  category?: string;
  site?: string;
  status?: string;
}

export interface AssetPayload {
  name: string;
  category: string;
  purchaseDate: string;
  site: string;
  assignedEngineer?: string;
  status: AssetStatus;
}

export const assetService = {
  getAll: async (params?: AssetSearchParams): Promise<Asset[]> => {
    const { data } = await apiClient.get<Asset[]>("/assets", { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/assets/${id}`);
    return data;
  },

  create: async (payload: AssetPayload): Promise<Asset> => {
    const { data } = await apiClient.post<Asset>("/assets", payload);
    return data;
  },

  update: async (id: number, payload: AssetPayload): Promise<Asset> => {
    const { data } = await apiClient.put<Asset>(`/assets/${id}`, payload);
    return data;
  },

  updateStatus: async (id: number, status: AssetStatus): Promise<Asset> => {
    const { data } = await apiClient.patch<Asset>(`/assets/${id}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>("/assets/dashboard-summary");
    return data;
  },
};
