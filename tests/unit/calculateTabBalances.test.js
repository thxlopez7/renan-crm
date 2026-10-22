import { describe, it, expect } from 'vitest';
import { calculateTabBalances } from '../../src/utils/financeHelpers';

describe('calculateTabBalances - Financial Tab Calculations', () => {
  const defaultPricing = {
    racketRentalFee: 30000,
    ballTubeFee: 70000
  };

  it('calculates balance with court rental only', () => {
    const tab = {
      courtAmount: 160000,
      depositPaid: 80000,
      racketCount: 0,
      ballTubeCount: 0,
      items: []
    };

    const result = calculateTabBalances(tab, defaultPricing);
    expect(result.courtBase).toBe(160000);
    expect(result.depositDeduction).toBe(80000);
    expect(result.racketCharge).toBe(0);
    expect(result.ballTubeCharge).toBe(0);
    expect(result.itemsTotal).toBe(0);
    expect(result.grossTotal).toBe(160000);
    expect(result.netPending).toBe(80000);
  });

  it('calculates balance with rented rackets and ball tubes', () => {
    const tab = {
      courtAmount: 160000,
      depositPaid: 80000,
      racketCount: 2, // 2 * 30000 = 60000
      racketUnitFee: 30000,
      ballTubeCount: 1, // 1 * 70000 = 70000
      ballTubeUnitFee: 70000,
      items: []
    };

    const result = calculateTabBalances(tab, defaultPricing);
    expect(result.racketCharge).toBe(60000);
    expect(result.ballTubeCharge).toBe(70000);
    expect(result.grossTotal).toBe(160000 + 60000 + 70000); // 290000
    expect(result.netPending).toBe(290000 - 80000); // 210000
  });

  it('calculates balance with bar items included', () => {
    const tab = {
      courtAmount: 160000,
      depositPaid: 80000,
      racketCount: 0,
      ballTubeCount: 0,
      items: [
        { price: 95000, qty: 1 }, // Picada
        { price: 25000, qty: 2 }  // Chopp x2 = 50000
      ]
    };

    const result = calculateTabBalances(tab, defaultPricing);
    expect(result.itemsTotal).toBe(145000);
    expect(result.grossTotal).toBe(305000); // 160000 + 145000
    expect(result.netPending).toBe(225000); // 305000 - 80000
  });

  it('protects against negative net pending amounts', () => {
    // If deposit exceeds the total for any edge case
    const tab = {
      courtAmount: 100000,
      depositPaid: 150000,
      racketCount: 0,
      ballTubeCount: 0,
      items: []
    };

    const result = calculateTabBalances(tab, defaultPricing);
    expect(result.grossTotal).toBe(100000);
    expect(result.netPending).toBe(0); // Math.max(0, 100000 - 150000)
  });

  it('handles null and undefined properties gracefully', () => {
    const result = calculateTabBalances(null);
    expect(result.grossTotal).toBe(0);
    expect(result.netPending).toBe(0);

    const emptyTabResult = calculateTabBalances({});
    expect(emptyTabResult.grossTotal).toBe(0);
    expect(emptyTabResult.netPending).toBe(0);
  });
});
