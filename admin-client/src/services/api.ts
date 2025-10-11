import { User, Fund, College, Basket } from '@/types';

// Mock data - Replace these with actual API calls to your Java backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    totalFunds: 50000,
    activeGoals: 3,
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    totalFunds: 75000,
    activeGoals: 2,
    joinedDate: '2024-02-20',
  },
];

const mockFunds: Fund[] = [
  { id: '1', name: 'Growth Fund A', category: 'Equity', riskLevel: 'High', returnRate: 12.5 },
  { id: '2', name: 'Balanced Fund B', category: 'Hybrid', riskLevel: 'Medium', returnRate: 9.8 },
  { id: '3', name: 'Debt Fund C', category: 'Debt', riskLevel: 'Low', returnRate: 7.2 },
  { id: '4', name: 'International Fund D', category: 'Equity', riskLevel: 'High', returnRate: 14.1 },
];

const mockColleges: College[] = [
  { id: '1', name: 'MIT', location: 'Cambridge, MA', fees: 75000, course: 'Computer Science', duration: 4 },
  { id: '2', name: 'Stanford University', location: 'Stanford, CA', fees: 78000, course: 'Engineering', duration: 4 },
];

const mockBaskets: Basket[] = [
  {
    id: '1',
    name: 'Conservative Portfolio',
    category: 'Low Risk',
    duration: 5,
    funds: [
      { fundId: '2', fundName: 'Balanced Fund B', percentage: 60 },
      { fundId: '3', fundName: 'Debt Fund C', percentage: 40 },
    ],
    totalPercentage: 100,
    createdAt: '2024-03-10',
  },
];

// API service functions - Replace with actual fetch calls to your Java backend
export const api = {
  // Users
  getUsers: async (search?: string): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (search) {
      return mockUsers.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return mockUsers;
  },

  // Funds
  getFunds: async (): Promise<Fund[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockFunds;
  },

  // Colleges
  getColleges: async (): Promise<College[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockColleges;
  },

  createCollege: async (college: Omit<College, 'id'>): Promise<College> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCollege = { ...college, id: Date.now().toString() };
    mockColleges.push(newCollege);
    return newCollege;
  },

  updateCollege: async (id: string, college: Partial<College>): Promise<College> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockColleges.findIndex(c => c.id === id);
    if (index !== -1) {
      mockColleges[index] = { ...mockColleges[index], ...college };
      return mockColleges[index];
    }
    throw new Error('College not found');
  },

  deleteCollege: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockColleges.findIndex(c => c.id === id);
    if (index !== -1) {
      mockColleges.splice(index, 1);
    }
  },

  // Baskets
  getBaskets: async (): Promise<Basket[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockBaskets;
  },

  createBasket: async (basket: Omit<Basket, 'id' | 'createdAt'>): Promise<Basket> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newBasket = { 
      ...basket, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    mockBaskets.push(newBasket);
    return newBasket;
  },

  updateBasket: async (id: string, basket: Partial<Basket>): Promise<Basket> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockBaskets.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBaskets[index] = { ...mockBaskets[index], ...basket };
      return mockBaskets[index];
    }
    throw new Error('Basket not found');
  },

  deleteBasket: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockBaskets.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBaskets.splice(index, 1);
    }
  },
};
