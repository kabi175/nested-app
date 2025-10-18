/**
 * User API Service
 * Handles all user-related API calls
 */

import { apiClient, ApiResponse } from '../api-client';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  totalFunds?: number;
  activeGoals?: number;
  joinedDate?: string;
  kycStatus?: 'approved' | 'pending' | 'rejected';
}

export interface UserDTO {
  id: number;
  name: string;
  email?: string;
}

/**
 * Fetch all users
 * @param type - Type of users to fetch (CURRENT_USER by default)
 * @returns Promise with list of users
 */
export async function getUsers(type: 'CURRENT_USER' | 'ALL' = 'CURRENT_USER'): Promise<User[]> {
  try {
    const response = await apiClient.get<ApiResponse<UserDTO>>(`/users?type=${type}`);
    
    // Map backend response to frontend User interface
    return response.data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: '',
      totalFunds: 0,
      activeGoals: 0,
      joinedDate: new Date().toISOString(),
      kycStatus: 'pending' as const,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Update a user
 * @param id - User ID
 * @param data - User data to update
 * @returns Promise with updated user
 */
export async function updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
  try {
    const response = await apiClient.patch<UserDTO>(`/users/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}


