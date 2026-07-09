export type AssetStatus = "Available" | "InUse" | "UnderMaintenance" | "Retired";
export type MaintenanceStatus = "Scheduled" | "Completed" | "Overdue";
export type DocumentType = "Manual" | "Image" | "Warranty";
export type UserRole = "Administrator" | "SiteEngineer";

export interface Asset {
  assetId: number;
  name: string;
  category: string;
  purchaseDate: string;
  site: string;
  assignedEngineer?: string | null;
  status: AssetStatus;
  nextServiceDate?: string | null;
}

export interface MaintenanceRecord {
  maintenanceId: number;
  assetId: number;
  assetName: string;
  lastService: string;
  nextService: string;
  notes?: string | null;
  status: MaintenanceStatus;
}

export interface DocumentItem {
  documentId: number;
  assetId: number;
  fileName: string;
  blobUrl: string;
  documentType: DocumentType;
  uploadDate: string;
}

export interface DashboardSummary {
  totalAssets: number;
  availableAssets: number;
  underMaintenance: number;
  activeSites: number;
  recentAssets: Asset[];
}

export interface CurrentUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}
