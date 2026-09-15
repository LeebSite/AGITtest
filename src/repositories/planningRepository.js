import prisma from '../db/prisma.js';

/**
 * Repository layer untuk entitas Planning dan PlanningSlot
 */
export class PlanningRepository {
  /**
   * Cari planning berdasarkan RequestCode
   */
  async findByRequestCode(requestCode) {
    return prisma.planning.findUnique({
      where: { requestCode },
      include: {
        slots: {
          orderBy: { slotOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Cari planning berdasarkan ID
   */
  async findById(planningId) {
    return prisma.planning.findUnique({
      where: { planningId: Number(planningId) },
      include: {
        slots: {
          orderBy: { slotOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Ambil riwayat planning terbaru (dengan limit/pagination)
   */
  async findAll({ limit = 50, offset = 0 } = {}) {
    return prisma.planning.findMany({
      take: Math.min(Number(limit) || 50, 100),
      skip: Number(offset) || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        slots: {
          orderBy: { slotOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Simpan header Planning dan seluruh PlanningSlot secara atomik dalam satu database transaction
   */
  async createWithSlots({ requestCode, candidateToken, status = 'SUCCESS', originalTotal, balancedTotal, slots }) {
    return prisma.$transaction(async (tx) => {
      // 1. Buat record header Planning
      const planning = await tx.planning.create({
        data: {
          requestCode,
          candidateToken,
          status,
          originalTotal,
          balancedTotal,
        },
      });

      // 2. Buat seluruh record detail PlanningSlot
      if (slots && slots.length > 0) {
        await tx.planningSlot.createMany({
          data: slots.map((slot) => ({
            planningId: planning.planningId,
            slotOrder: slot.slotOrder,
            slotName: slot.slotName,
            originalQuantity: slot.originalQuantity,
            balancedQuantity: slot.balancedQuantity,
            isActive: slot.isActive,
          })),
        });
      }

      // 3. Kembalikan planning lengkap beserta relasi slots
      return tx.planning.findUnique({
        where: { planningId: planning.planningId },
        include: {
          slots: {
            orderBy: { slotOrder: 'asc' },
          },
        },
      });
    });
  }
}

export default new PlanningRepository();
