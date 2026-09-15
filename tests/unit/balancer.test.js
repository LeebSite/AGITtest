import { describe, it, expect } from 'vitest';
import { balanceSlots, balanceQuantities, validateQuantity } from '../../src/core/balancer.js';

describe('Case 1: Core Balancing Logic (Unit Tests)', () => {
  // ---------------------------------------------------------------------------
  // 1. Sample from assessment prompt
  // ---------------------------------------------------------------------------
  it('1. should balance the standard assessment sample: [4, 5, 1, 7, 6, 4, 0] -> [4, 5, 4, 5, 5, 4, 0]', () => {
    const input = [4, 5, 1, 7, 6, 4, 0];
    const expected = [4, 5, 4, 5, 5, 4, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);

    // Verify sum conservation: 4+5+1+7+6+4+0 = 27 -> 4+5+4+5+5+4+0 = 27
    const inputSum = input.reduce((a, b) => a + b, 0);
    const resultSum = result.reduce((a, b) => a + b, 0);
    expect(resultSum).toBe(inputSum);
    expect(resultSum).toBe(27);
  });

  // ---------------------------------------------------------------------------
  // 2. Total evenly divisible
  // ---------------------------------------------------------------------------
  it('2. should evenly distribute when total is perfectly divisible by active slot count', () => {
    // Total = 24 across 3 active slots. Base = 8, Remainder = 0
    const input = [4, 8, 0, 12];
    const expected = [8, 8, 0, 8];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);
  });

  it('2b. should handle already balanced evenly divisible input', () => {
    const input = [10, 0, 10, 0, 10];
    const expected = [10, 0, 10, 0, 10];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);
  });

  // ---------------------------------------------------------------------------
  // 3. Total with remainder
  // ---------------------------------------------------------------------------
  it('3. should assign +1 remainder to slots with largest original quantities', () => {
    // Total = 13, Active = 2 slots (10 and 3). Base = 6, Remainder = 1.
    // Slot 1 (original 10) > Slot 2 (original 3) -> Slot 1 gets 6+1=7, Slot 2 gets 6
    const input = [10, 3, 0];
    const expected = [7, 6, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);
  });

  it('3b. should distribute multiple remainder units to top original quantities in order', () => {
    // Active slots: [10, 8, 2, 0]. Total = 20, Active = 3. Base = 6, Remainder = 2.
    // Top 2 largest originals: Slot 1 (10) and Slot 2 (8).
    // Expected: Slot 1 -> 7, Slot 2 -> 7, Slot 3 -> 6, Slot 4 -> 0
    const input = [10, 8, 2, 0];
    const expected = [7, 7, 6, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);
  });

  // ---------------------------------------------------------------------------
  // 4. All slots are zero
  // ---------------------------------------------------------------------------
  it('4. should safely return all zeros when all input slots are zero (no active slots)', () => {
    const input = [0, 0, 0, 0];
    const expected = [0, 0, 0, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);

    // Verify structured output properties
    const structuredResult = balanceSlots(input);
    expect(structuredResult.every((s) => !s.isActive && s.balancedQuantity === 0)).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 5. Only one active slot
  // ---------------------------------------------------------------------------
  it('5. should safely retain full quantity when only one active slot is present', () => {
    const input = [0, 42, 0, 0];
    const expected = [0, 42, 0, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);

    const structured = balanceSlots(input);
    expect(structured[1].isActive).toBe(true);
    expect(structured[1].balancedQuantity).toBe(42);
    expect(structured[0].isActive).toBe(false);
    expect(structured[2].isActive).toBe(false);
    expect(structured[3].isActive).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 6. Tie-breaker rule (Earlier SlotOrder gets priority)
  // ---------------------------------------------------------------------------
  it('6. should break ties by giving remainder priority to earlier SlotOrder / lower index', () => {
    // Total = 10, Active = 3 (quantities: 4, 4, 2). Base = 3, Remainder = 1.
    // Slot 1 (qty 4) and Slot 2 (qty 4) are tied for largest original.
    // Slot 1 is at index 0 (earlier SlotOrder), so Slot 1 gets the remainder (+1 -> 4).
    // Slot 2 gets base (3), Slot 3 gets base (3).
    const input = [4, 4, 2, 0];
    const expected = [4, 3, 3, 0];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);
  });

  it('6b. should resolve 3-way ties with remainder correctly based on earlier SlotOrder', () => {
    // 3 slots tied for largest (qty 4): [4, 4, 4, 2]. Total = 14, Active = 4. Base = 3, Remainder = 2.
    // Slots 1, 2, 3 are tied at 4. Remainder is 2.
    // Earlier SlotOrders (Slot 1 and Slot 2) get priority for remainder (+1 -> 4).
    // Slot 3 and Slot 4 get base allocation (3).
    // Expected: [4, 4, 3, 3]
    const input = [4, 4, 4, 2];
    const expected = [4, 4, 3, 3];

    const result = balanceQuantities(input);
    expect(result).toEqual(expected);

    // Sum conservation check
    expect(result.reduce((a, b) => a + b, 0)).toBe(14);
  });

  // ---------------------------------------------------------------------------
  // 7. Invalid input validation
  // ---------------------------------------------------------------------------
  it('7a. should reject negative quantities with a descriptive RangeError', () => {
    expect(() => balanceQuantities([-1, 5, 0])).toThrow(RangeError);
    expect(() => balanceQuantities([-1, 5, 0])).toThrow(/negative values are not allowed/i);
  });

  it('7b. should reject fractional / decimal quantities with a descriptive RangeError', () => {
    expect(() => balanceQuantities([2.5, 5, 0])).toThrow(RangeError);
    expect(() => balanceQuantities([2.5, 5, 0])).toThrow(/fractional\/decimal values are not allowed/i);
  });

  it('7c. should reject non-numeric and NaN values with a TypeError', () => {
    expect(() => balanceQuantities(['five', 5])).toThrow(TypeError);
    expect(() => balanceQuantities([NaN, 5])).toThrow(TypeError);
    expect(() => balanceQuantities([null, 5])).toThrow(TypeError);
    expect(() => balanceQuantities([undefined, 5])).toThrow(TypeError);
  });

  it('7d. should reject non-array inputs with a TypeError', () => {
    expect(() => balanceSlots(null)).toThrow(TypeError);
    expect(() => balanceSlots(123)).toThrow(TypeError);
    expect(() => balanceSlots('invalid')).toThrow(TypeError);
  });

  // ---------------------------------------------------------------------------
  // 8. Additional Edge Case: Empty collection
  // ---------------------------------------------------------------------------
  it('8. Edge Case: should return empty array when input is empty', () => {
    expect(balanceQuantities([])).toEqual([]);
    expect(balanceSlots([])).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // 9. Additional Edge Case: Core Invariants across complex distributions
  // ---------------------------------------------------------------------------
  it('9. Edge Case: should strictly maintain all core invariants across complex distributions', () => {
    const complexInputs = [
      [100, 0, 50, 25, 0, 10, 5],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 100],
      [99, 99, 99, 1],
      [7, 0, 0, 13, 0, 21, 0, 5],
      [15, 14, 13, 12, 11, 10, 0],
    ];

    for (const input of complexInputs) {
      const result = balanceSlots(input);

      // Invariant 1: Total sum conservation
      const originalTotal = input.reduce((a, b) => a + b, 0);
      const balancedTotal = result.reduce((a, s) => a + s.balancedQuantity, 0);
      expect(balancedTotal).toBe(originalTotal);

      // Invariant 2: Originally inactive slots remain 0 and inactive
      input.forEach((origVal, idx) => {
        if (origVal === 0) {
          expect(result[idx].isActive).toBe(false);
          expect(result[idx].balancedQuantity).toBe(0);
        } else {
          expect(result[idx].isActive).toBe(true);
        }
      });

      // Invariant 3: Difference between max and min balanced active quantities <= 1
      const activeBalanced = result.filter((s) => s.isActive).map((s) => s.balancedQuantity);
      if (activeBalanced.length > 0) {
        const maxVal = Math.max(...activeBalanced);
        const minVal = Math.min(...activeBalanced);
        expect(maxVal - minVal).toBeLessThanOrEqual(1);
      }

      // Invariant 4: Output order preservation
      expect(result.map((s) => s.slotOrder)).toEqual(input.map((_, i) => i + 1));
    }
  });

  // ---------------------------------------------------------------------------
  // 10. Additional Edge Case: Large numbers & Object-structured inputs
  // ---------------------------------------------------------------------------
  it('10. Edge Case: should handle large numbers and object-structured slot collections', () => {
    const objectInput = [
      { slotOrder: 1, slotName: 'Warehouse North', quantity: 1_000_000 },
      { slotOrder: 2, slotName: 'Warehouse South', quantity: 0 },
      { slotOrder: 3, slotName: 'Warehouse East', quantity: 500_001 },
    ];

    const result = balanceSlots(objectInput);

    expect(result).toHaveLength(3);
    expect(result[0].slotName).toBe('Warehouse North');
    expect(result[0].balancedQuantity).toBe(750_001); // 1,500,001 total / 2 active -> base 750,000 + remainder 1
    expect(result[1].slotName).toBe('Warehouse South');
    expect(result[1].balancedQuantity).toBe(0);
    expect(result[1].isActive).toBe(false);
    expect(result[2].slotName).toBe('Warehouse East');
    expect(result[2].balancedQuantity).toBe(750_000);

    const totalOrig = 1_000_000 + 0 + 500_001;
    const totalBal = result[0].balancedQuantity + result[1].balancedQuantity + result[2].balancedQuantity;
    expect(totalBal).toBe(totalOrig);
  });
});
