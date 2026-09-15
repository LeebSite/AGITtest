import type {
  Planning,
  CreatePlanningPayload,
  ApiResponse,
} from '../types/planning';

const API_BASE_URL = '/api';

/**
 * Mengambil daftar riwayat planning dari backend
 */
export async function getPlannings(): Promise<Planning[]> {
  const response = await fetch(`${API_BASE_URL}/plannings`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const json: ApiResponse<Planning[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Gagal memuat data riwayat');
  }

  return json.data || [];
}

/**
 * Mengambil detail satu planning berdasarkan ID
 */
export async function getPlanningById(id: number | string): Promise<Planning> {
  const response = await fetch(`${API_BASE_URL}/plannings/${id}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const json: ApiResponse<Planning> = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || `Planning #${id} tidak ditemukan`);
  }

  return json.data;
}

/**
 * Mengirim permintaan pembuatan planning baru ke backend
 */
export async function createPlanning(
  payload: CreatePlanningPayload
): Promise<Planning> {
  const response = await fetch(`${API_BASE_URL}/plannings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<Planning> = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || 'Gagal memproses planning');
  }

  return json.data;
}
