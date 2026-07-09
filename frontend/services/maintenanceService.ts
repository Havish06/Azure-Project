import { apiClient } from "./apiClient";
import { MaintenanceRecord, MaintenanceStatus } from "@/types";

export interface MaintenancePayload {
  assetId: number;
  lastService: string;
  nextService: string;
  notes?: string;
  status: MaintenanceStatus;
}

export const maintenanceService = {
  getAll: async (assetId?: number): Promise<MaintenanceRecord[]> => {
    const { data } = await apiClient.get<MaintenanceRecord[]>("/maintenance", {
      params: assetId ? { assetId } : undefined,
    });
    return data;
  },

  create: async (payload: MaintenancePayload): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.post<MaintenanceRecord>("/maintenance", payload);
    return data;
  },

  update: async (id: number, payload: Omit<MaintenancePayload, "assetId">): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.put<MaintenanceRecord>(`/maintenance/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/maintenance/${id}`);
  },
};
