import { Education } from "@/types";

export function expectedFee(targetDate: Date, education: Education) {
  const lastYrFeeInLaks = education.lastYearFee / 100000;
  const expectedIncreasePercentLt10Yr =
    education.expectedIncreasePercentLt10Yr / 100;
  const expectedIncreasePercentGt10Yr =
    education.expectedIncreasePercentGt10Yr / 100;
  const noOfYears = targetDate.getFullYear() - new Date().getFullYear();

  const result =
    noOfYears <= 10
      ? Math.pow(1 + expectedIncreasePercentGt10Yr, noOfYears) * lastYrFeeInLaks
      : Math.pow(1 + expectedIncreasePercentLt10Yr, noOfYears - 10) *
        Math.pow(1 + expectedIncreasePercentGt10Yr, noOfYears) *
        lastYrFeeInLaks;

  return Math.round(result) * 100000;
}
