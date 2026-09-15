/**
 * Definisi Tipe Data untuk Aplikasi Planning
 */

// Format slot input di formulir
export interface SlotInput {
  slotName: string;
  originalQuantity: number | string;
}

// Format slot dari response backend
export interface SlotItem {
  id?: number;
  slotOrder: number;
  slotName: string;
  originalQuantity: number;
  balancedQuantity: number;
  isActive: boolean;
}

// Format entitas Planning dari database
export interface Planning {
  planningId: number;
  requestCode: string;
  candidateToken: string;
  originalTotal: number;
  balancedTotal: number;
  status: string;
  createdAt: string;
  slots: SlotItem[];
}

// Payload pembuatan planning
export interface CreatePlanningPayload {
  requestCode: string;
  candidateToken: string;
  slots: {
    slotName: string;
    originalQuantity: number;
  }[];
}

// Format umum response API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  isDuplicate?: boolean;
  count?: number;
  data?: T;
  error?: string;
}
