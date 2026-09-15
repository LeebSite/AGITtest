/**
 * Validasi nilai kuantitas agar selalu bilangan bulat non-negatif
 */
export function validateQuantity(value, slotIdentifier = 'unknown') {
  if (value === null || value === undefined || typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError(`Kuantitas pada slot ${slotIdentifier} harus berupa angka valid`);
  }

  if (!Number.isInteger(value)) {
    throw new RangeError(`Kuantitas pada slot ${slotIdentifier} tidak boleh berupa desimal/pecahan (${value})`);
  }

  if (value < 0) {
    throw new RangeError(`Kuantitas pada slot ${slotIdentifier} tidak boleh negatif (${value})`);
  }

  return value;
}

/**
 * Fungsi murni untuk menyeimbangkan kuantitas pada koleksi slot
 */
export function balanceSlots(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('Input slots harus berupa array');
  }

  if (items.length === 0) {
    return [];
  }

  // 1. Normalisasi dan validasi input (tetap menjaga urutan awal)
  const normalizedSlots = items.map((item, index) => {
    const isObject = item && typeof item === 'object';
    const slotOrder = isObject && typeof item.slotOrder === 'number' ? item.slotOrder : index + 1;
    const slotName = isObject && typeof item.slotName === 'string' ? item.slotName : `Slot ${slotOrder}`;
    const rawQty = isObject ? (item.originalQuantity ?? item.quantity) : item;

    const originalQuantity = validateQuantity(rawQty, slotOrder);
    const isActive = originalQuantity > 0;

    return {
      slotOrder,
      slotName,
      originalQuantity,
      balancedQuantity: 0,
      isActive,
    };
  });

  // 2. Ambil slot yang aktif (kuantitas awal > 0)
  const activeSlots = normalizedSlots.filter((slot) => slot.isActive);
  const activeCount = activeSlots.length;

  // Jika semua bernilai 0, semua slot tetap 0
  if (activeCount === 0) {
    return normalizedSlots.map((slot) => ({ ...slot, balancedQuantity: 0 }));
  }

  // 3. Hitung total kuantitas awal
  const total = activeSlots.reduce((sum, slot) => sum + slot.originalQuantity, 0);

  // 4. Hitung alokasi dasar dan sisa pembagian bulat
  const baseAllocation = Math.floor(total / activeCount);
  const remainder = total % activeCount;

  // 5. Urutkan slot aktif untuk pembagian sisa (+1):
  //    - Prioritas 1: Kuantitas awal terbesar
  //    - Prioritas 2 (tie-break): SlotOrder lebih awal
  const rankedSlots = [...activeSlots].sort((a, b) => {
    if (b.originalQuantity !== a.originalQuantity) {
      return b.originalQuantity - a.originalQuantity;
    }
    return a.slotOrder - b.slotOrder;
  });

  // Ambil daftar slotOrder yang berhak menerima sisa +1
  const bonusSlotOrders = new Set(
    rankedSlots.slice(0, remainder).map((slot) => slot.slotOrder)
  );

  // 6. Buat hasil akhir sesuai urutan input semula
  return normalizedSlots.map((slot) => {
    if (!slot.isActive) {
      return { ...slot, balancedQuantity: 0 };
    }

    const hasBonus = bonusSlotOrders.has(slot.slotOrder);
    return {
      ...slot,
      balancedQuantity: baseAllocation + (hasBonus ? 1 : 0),
    };
  });
}

/**
 * Helper ringkas jika input dan output hanya berupa array angka
 */
export function balanceQuantities(quantities) {
  return balanceSlots(quantities).map((slot) => slot.balancedQuantity);
}
