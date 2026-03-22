import { formatIndianCompact } from "../formatters";

describe("formatIndianCompact", () => {
  describe("Crores (≥ 1,00,00,000)", () => {
    it("formats whole crores", () => {
      expect(formatIndianCompact(1_00_00_000)).toBe("1Cr");
      expect(formatIndianCompact(3_00_00_000)).toBe("3Cr");
    });

    it("formats fractional crores to 2 decimal places", () => {
      expect(formatIndianCompact(3_24_56_000)).toBe("3.24Cr");
      expect(formatIndianCompact(1_50_00_000)).toBe("1.5Cr");
    });
  });

  describe("Lakhs (≥ 1,00,000)", () => {
    it("formats whole lakhs", () => {
      expect(formatIndianCompact(1_00_000)).toBe("1L");
      expect(formatIndianCompact(5_00_000)).toBe("5L");
    });

    it("formats fractional lakhs to 2 decimal places", () => {
      expect(formatIndianCompact(2_45_600)).toBe("2.45L");
      expect(formatIndianCompact(1_50_000)).toBe("1.5L");
    });
  });

  describe("Thousands (≥ 1,000)", () => {
    it("formats whole thousands", () => {
      expect(formatIndianCompact(10_000)).toBe("10K");
      expect(formatIndianCompact(1_000)).toBe("1K");
    });

    it("formats fractional thousands, dropping decimal when whole", () => {
      expect(formatIndianCompact(10_000.45)).toBe("10K");
      expect(formatIndianCompact(1_500)).toBe("1.5K");
    });
  });

  describe("Below 1,000", () => {
    it("returns the raw number as string", () => {
      expect(formatIndianCompact(500)).toBe("500");
      expect(formatIndianCompact(0)).toBe("0");
      expect(formatIndianCompact(99.99)).toBe("100");
    });
  });

  describe("Edge cases", () => {
    it("returns '0' for null", () => {
      expect(formatIndianCompact(null)).toBe("0");
    });

    it("returns '0' for NaN", () => {
      expect(formatIndianCompact(NaN)).toBe("0");
    });

    it("handles exact boundary values", () => {
      expect(formatIndianCompact(999)).toBe("999");
      expect(formatIndianCompact(1_000)).toBe("1K");
      expect(formatIndianCompact(99_999)).toBe("99.99K");
      expect(formatIndianCompact(1_00_000)).toBe("1L");
      expect(formatIndianCompact(1_00_00_000)).toBe("1Cr");
    });
  });
});
