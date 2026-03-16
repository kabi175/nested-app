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
