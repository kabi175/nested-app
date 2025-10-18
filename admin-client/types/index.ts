export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalFunds: number;
  activeGoals: number;
  joinedDate: string;
}

export interface Fund {
  id: string;
  name: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  returnRate: number;
}

export interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  course: string;
  duration: number;
}

export interface BasketFund {
  fundId: string;
  fundName: string;
  percentage: number;
}

export interface Basket {
  id: string;
  name: string;
  category: string;
  duration: number;
  funds: BasketFund[];
  totalPercentage: number;
  createdAt: string;
}
