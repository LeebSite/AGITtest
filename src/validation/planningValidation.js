/**
 * Layer Validasi Permintaan Planning
 */

const MAX_SLOT_COUNT = 100;
const MAX_QUANTITY = 1_000_000_000;

/**
 * Validasi payload pembuatan planning baru
 * @param {object} payload
 * @returns {{ isValid: boolean, error?: string, data?: object }}
 */
export function validateCreatePlanningRequest(payload) {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Payload permintaan harus berupa objek JSON' };
  }

  const { requestCode, candidateToken, slots } = payload;

  // 1. Validasi RequestCode
  if (!requestCode || typeof requestCode !== 'string' || requestCode.trim().length === 0) {
    return { isValid: false, error: 'RequestCode wajib diisi dan harus berupa string non-kosong' };
  }

  if (requestCode.length > 100) {
    return { isValid: false, error: 'RequestCode maksimal 100 karakter' };
  }

  // 2. Validasi CandidateToken
  const finalToken = (typeof candidateToken === 'string' && candidateToken.trim().length > 0)
    ? candidateToken.trim()
    : (process.env.CANDIDATE_TOKEN || 'GHALIBCANDIDATE');

  // 3. Validasi Koleksi Slots
  if (!Array.isArray(slots)) {
    return { isValid: false, error: 'Field "slots" wajib diisi dan harus berupa array' };
  }

  if (slots.length === 0) {
    return { isValid: false, error: 'Koleksi slots minimal harus memiliki 1 slot' };
  }

  if (slots.length > MAX_SLOT_COUNT) {
    return { isValid: false, error: `Jumlah slot melebihi batas maksimum (${MAX_SLOT_COUNT} slots)` };
  }

  // 4. Validasi detail tiap slot
  const normalizedSlots = [];
  for (let i = 0; i < slots.length; i++) {
    const raw = slots[i];
    const slotOrder = i + 1;

    let slotName = `Slot ${slotOrder}`;
    let quantity;

    if (raw !== null && typeof raw === 'object') {
      if (typeof raw.slotName === 'string' && raw.slotName.trim().length > 0) {
        slotName = raw.slotName.trim();
      }
      quantity = raw.originalQuantity !== undefined ? raw.originalQuantity : raw.quantity;
    } else {
      quantity = raw;
    }

    // Pengecekan tipe dan batas numerik
    if (quantity === null || quantity === undefined || typeof quantity !== 'number' || Number.isNaN(quantity) || !Number.isFinite(quantity)) {
      return { isValid: false, error: `Kuantitas pada slot ke-${slotOrder} (${slotName}) harus berupa angka valid` };
    }

    if (!Number.isInteger(quantity)) {
      return { isValid: false, error: `Kuantitas pada slot ke-${slotOrder} (${slotName}) tidak boleh berupa desimal/pecahan (${quantity})` };
    }

    if (quantity < 0) {
      return { isValid: false, error: `Kuantitas pada slot ke-${slotOrder} (${slotName}) tidak boleh negatif (${quantity})` };
    }

    if (quantity > MAX_QUANTITY) {
      return { isValid: false, error: `Kuantitas pada slot ke-${slotOrder} (${slotName}) melebihi batas maksimum (${MAX_QUANTITY})` };
    }

    normalizedSlots.push({
      slotOrder,
      slotName,
      originalQuantity: quantity,
    });
  }

  return {
    isValid: true,
    data: {
      requestCode: requestCode.trim(),
      candidateToken: finalToken,
      slots: normalizedSlots,
    },
  };
}
