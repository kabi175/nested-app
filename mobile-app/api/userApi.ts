import type { User } from '@/types/user';
import { api } from './client';

export const getUser = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
};
