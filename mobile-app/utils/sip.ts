export function computeMinimumSIPAmount(
  remainingYears: number,
  setupAmount: number,
  lumpsum: number,
  expectedReturns: number,
  targetAmount: number
) {
  const r_m = expectedReturns / 12 / 100; // monthly rate
  const months = remainingYears * 12;

  // Future value of lumpsum
  const FV_lump = lumpsum * Math.pow(1 + r_m, months);

  // We need to solve for S (starting SIP)
  // Use numerical method (trial & error / binary search)

  function fvFromSIP(S: number) {
    let FV_sip = 0;
    for (let k = 0; k < remainingYears; k++) {
      const sipAmt = S + k * setupAmount;
      const factor = (Math.pow(1 + r_m, 12) - 1) / r_m;
      // value after N-k years compounding
      const growth = Math.pow(1 + r_m, 12 * (remainingYears - k - 1));
      FV_sip += sipAmt * factor * growth;
    }
    return FV_sip;
  }

  // Binary search for SIP
  let low = 0,
    high = 1e6,
    mid;
  while (high - low > 0.01) {
    mid = (low + high) / 2;
    const totalFV = FV_lump + fvFromSIP(mid);
    if (totalFV < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return Math.round((low + high) / 2 / 500) * 500;
}
