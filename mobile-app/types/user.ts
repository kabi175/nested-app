type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone_number: string;
  role: "admin" | "investor";
  created_at: Date;
  updated_at: Date | null;
};

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  investUnderChild: boolean;
};

type Goal = {
  id: string;
  childId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: "draft" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};

type Education = {
  id: string;
  name: string;
  type: "INSTITUTION" | "COURSE";
  lastYearFee: number;
  expectedIncreasePercentLt10Yr: number;
  expectedIncreasePercentGt10Yr: number;
};

export type { Child, Education, Goal, User };
