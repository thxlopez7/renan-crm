/**
 * Financial calculations and POS balance helpers for BlackClubElite
 */

/**
 * Calculates financial balances for a POS tab.
 * @param {Object} tab
 * @param {Object} [pricingConfig]
 * @returns {Object}
 */
export function calculateTabBalances(tab, pricingConfig = {}) {
  if (!tab) {
    return {
      courtBase: 0,
      depositDeduction: 0,
      racketCharge: 0,
      ballTubeCharge: 0,
      itemsTotal: 0,
      grossTotal: 0,
      netPending: 0
    };
  }

  const racketFee = tab.racketUnitFee || pricingConfig.racketRentalFee || 30000;
  const ballFee = tab.ballTubeUnitFee || pricingConfig.ballTubeFee || 70000;

  const courtBase = Number(tab.courtAmount) || 0;
  const depositDeduction = Number(tab.depositPaid) || 0;
  const racketCharge = (Number(tab.racketCount) || 0) * racketFee;
  const ballTubeCharge = (Number(tab.ballTubeCount) || 0) * ballFee;
  const itemsTotal = (tab.items || []).reduce(
    (acc, item) => acc + ((Number(item.price) || 0) * (Number(item.qty) || 1)),
    0
  );

  const grossTotal = courtBase + racketCharge + ballTubeCharge + itemsTotal;
  const netPending = Math.max(0, grossTotal - depositDeduction);

  return {
    courtBase,
    depositDeduction,
    racketCharge,
    ballTubeCharge,
    itemsTotal,
    grossTotal,
    netPending
  };
}
