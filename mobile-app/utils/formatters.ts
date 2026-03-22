export const formatCurrency = (amount: number) => {
  if (isNaN(amount)) {
    amount = 0;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(1)}Cr`;
  }
  if (amount >= 1_00_000) {
    const l = amount / 1_00_000;
    return `₹${Number.isInteger(l) ? l : l.toFixed(1)}L`;
  }
  return formatCurrency(amount);
};

/**
 * Formats a number into compact Indian notation (K / L / Cr) with up to 2 decimal places.
 * Examples: 10000.45 → "10K", 245600 → "2.45L", 32456000 → "3.24Cr"
 */
export const formatIndianCompact = (amount: number | null): string => {
  if (amount == null || isNaN(amount)) amount = 0;

  const fmt = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded)
      ? `${rounded}`
      : `${parseFloat(rounded.toFixed(2))}`;
  };

  if (amount >= 1_00_00_000) return `${fmt(amount / 1_00_00_000)}Cr`;
  if (amount >= 1_00_000) return `${fmt(amount / 1_00_000)}L`;
  if (amount >= 1_000) return `${fmt(amount / 1_000)}K`;
  return `${fmt(amount)}`;
};
