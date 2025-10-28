export type Education = {
  id: string;
  name: string;
  type: "INSTITUTION" | "COURSE";
  lastYearFee: number;
  expectedIncreasePercentLt10Yr: number;
  expectedIncreasePercentGt10Yr: number;
};
