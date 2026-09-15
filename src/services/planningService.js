import { balanceSlots } from '../core/balancer.js';
import planningRepository from '../repositories/planningRepository.js';
import { validateCreatePlanningRequest } from '../validation/planningValidation.js';

/**
 * Service Layer: Mengorkestrasi alur bisnis, idempotensi, validasi, dan persistensi
 */
export class PlanningService {
  constructor(repository = planningRepository) {
    this.repository = repository;
  }

  /**
   * Proses alokasi dan simpan data planning
   */
  async createPlanning(payload) {
    // 1. Validasi struktur dan tipe data payload
    const validation = validateCreatePlanningRequest(payload);
    if (!validation.isValid) {
      const error = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }

    const { requestCode, candidateToken, slots: inputSlots } = validation.data;

    // 2. Cek Idempotensi (RequestCode Unik)
    //    Jika RequestCode sudah ada, kembalikan hasil sebelumnya secara konsisten tanpa duplikasi transaksi
    const existing = await this.repository.findByRequestCode(requestCode);
    if (existing) {
      return {
        isDuplicate: true,
        data: existing,
      };
    }

    // 3. Eksekusi fungsi murni balancing logic (Case 1 Domain)
    const balancedSlots = balanceSlots(inputSlots);

    // 4. Hitung total original dan balanced untuk audit integritas
    const originalTotal = balancedSlots.reduce((sum, s) => sum + s.originalQuantity, 0);
    const balancedTotal = balancedSlots.reduce((sum, s) => sum + s.balancedQuantity, 0);

    // 5. Simpan ke database secara atomik
    const created = await this.repository.createWithSlots({
      requestCode,
      candidateToken,
      status: 'SUCCESS',
      originalTotal,
      balancedTotal,
      slots: balancedSlots,
    });

    return {
      isDuplicate: false,
      data: created,
    };
  }

  /**
   * Ambil detail planning berdasarkan ID
   */
  async getPlanningById(planningId) {
    const planning = await this.repository.findById(planningId);
    if (!planning) {
      const error = new Error(`Planning dengan ID ${planningId} tidak ditemukan`);
      error.statusCode = 404;
      throw error;
    }
    return planning;
  }

  /**
   * Ambil riwayat planning terbaru
   */
  async getPlanningHistory({ limit = 50, offset = 0 } = {}) {
    return this.repository.findAll({ limit, offset });
  }
}

export default new PlanningService();
