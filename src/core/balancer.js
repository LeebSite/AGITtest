/**
 * Core Domain: Pure Balancing Logic (Case 1)
 *
 * Requirements & Business Rules:
 * 1. Total balanced quantity must equal total original quantity (sum conservation).
 * 2. Slots with original value 0 are inactive and must remain 0.
 * 3. Only active slots participate in balancing.
 * 4. Among active slots, difference between max and min balanced values <= 1.
 * 5. Base allocation = Math.floor(total / activeCount).
 * 6. Remainder (total % activeCount) distributes +1 to active slots with largest ORIGINAL quantities.
 * 7. If original quantities tie, earlier SlotOrder / input index gets priority.
 * 8. Negative and fractional quantities are invalid.
 * 9. All-zero and single-active-slot inputs must be handled safely.
 * 10. Original collection order is preserved in the output.
 */

/**
 * Validates whether a value is a valid non-negative integer.
 * @param {unknown} value
 * @param {number|string} slotIdentifier
 * @returns {number} validated integer
 */
export function validateQuantity(value, slotIdentifier = 'unknown') {
  if (value === null || value === undefined || typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError(`Invalid quantity at slot ${slotIdentifier}: value must be a valid number`);
  }

  if (!Number.isInteger(value)) {
    throw new RangeError(`Invalid quantity at slot ${slotIdentifier}: fractional/decimal values are not allowed (received ${value})`);
  }

  if (value < 0) {
    throw new RangeError(`Invalid quantity at slot ${slotIdentifier}: negative values are not allowed (received ${value})`);
  }

  return value;
}

/**
 * Pure balancing function for slot collections.
 *
 * @param {Array<number | { slotOrder?: number, slotName?: string, originalQuantity?: number, quantity?: number }>} items
 * @returns {Array<{ slotOrder: number, slotName: string, originalQuantity: number, balancedQuantity: number, isActive: boolean }>}
 */
export function balanceSlots(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('Input slots must be an array');
  }

  if (items.length === 0) {
    return [];
  }

  // 1. Normalize and validate inputs while preserving initial order
  const normalizedSlots = items.map((item, index) => {
    const slotOrder = (item && typeof item === 'object' && typeof item.slotOrder === 'number')
      ? item.slotOrder
      : index + 1;

    const slotName = (item && typeof item === 'object' && typeof item.slotName === 'string')
      ? item.slotName
      : `Slot ${slotOrder}`;

    const rawQty = (item && typeof item === 'object')
      ? (item.originalQuantity !== undefined ? item.originalQuantity : item.quantity)
      : item;

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

  // 2. Separate active slots (slots with quantity > 0)
  const activeSlots = normalizedSlots.filter((slot) => slot.isActive);
  const activeCount = activeSlots.length;

  // If no active slots (e.g., all original values are 0), all remain 0
  if (activeCount === 0) {
    return normalizedSlots.map((slot) => ({ ...slot, balancedQuantity: 0 }));
  }

  // 3. Compute total original sum across all active slots
  const total = activeSlots.reduce((sum, slot) => sum + slot.originalQuantity, 0);

  // 4. Calculate integer base allocation and remainder
  const baseAllocation = Math.floor(total / activeCount);
  const remainder = total % activeCount;

  // 5. Rank active slots for remainder allocation (+1 extra unit each):
  //    - Primary rule: Largest original quantity first
  //    - Tie-breaker rule: Earlier slotOrder / original index first
  const rankedActiveSlots = [...activeSlots].sort((a, b) => {
    if (b.originalQuantity !== a.originalQuantity) {
      return b.originalQuantity - a.originalQuantity; // Descending by original quantity
    }
    return a.slotOrder - b.slotOrder; // Ascending by slotOrder (earlier gets priority)
  });

  // Collect the slotOrders of slots that receive the +1 remainder
  const prioritySlotOrders = new Set(
    rankedActiveSlots.slice(0, remainder).map((slot) => slot.slotOrder)
  );

  // 6. Build balanced output preserving original input order
  return normalizedSlots.map((slot) => {
    if (!slot.isActive) {
      return {
        ...slot,
        balancedQuantity: 0,
      };
    }

    const getsRemainder = prioritySlotOrders.has(slot.slotOrder);
    const balancedQuantity = baseAllocation + (getsRemainder ? 1 : 0);

    return {
      ...slot,
      balancedQuantity,
    };
  });
}

/**
 * Convenience helper that accepts and returns simple arrays of numbers.
 *
 * @param {number[]} quantities
 * @returns {number[]}
 */
export function balanceQuantities(quantities) {
  const result = balanceSlots(quantities);
  return result.map((item) => item.balancedQuantity);
}
