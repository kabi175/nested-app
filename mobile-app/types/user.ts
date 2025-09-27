type User = {
  id: string;
  nickname: string | null;
  email: string | null;
  phone_number: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date | null;
};

export type { User };
