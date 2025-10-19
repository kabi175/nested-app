/**
 * User API Service
 * Handles all user-related API calls
 */

import { apiClient, ApiResponse, PaginationParams, PageInfo } from '../api-client';

export interface Address {
  id?: number;
  address_line?: string;
  city?: string;
  state?: string;
}

export interface Investor {
  id?: number;
  status?: 'incomplete_detail' | 'incomplete_kyc_details' | 'pending_nominee_authentication' | 'under_review' | 'ready_to_invest';
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  address?: Address;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'transgender';
  panNumber?: string;
  investor?: Investor;
  createdAt?: string;
}

export interface UserDTO {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  role?: string;
  address?: Address;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'transgender';
  panNumber?: string;
  investor?: Investor;
}

/**
 * Fetch all users
 * @param type - Type of users to fetch (CURRENT_USER by default)
 * @param pagination - Pagination parameters
 * @returns Promise with list of users and pagination info
 */
export async function getUsers(
  type: 'CURRENT_USER' | 'ALL' = 'ALL',
  pagination?: PaginationParams
): Promise<{ users: User[]; pageInfo?: PageInfo }> {
  try {
    const params: Record<string, any> = { type };
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sort) params.sort = pagination.sort;
    }
    
    const response = await apiClient.get<ApiResponse<UserDTO>>('/users', params);
    
    // Map backend response to frontend User interface
    const users = response.data.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      address: user.address,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      panNumber: user.panNumber,
      investor: user.investor,
    }));
    
    return {
      users,
      pageInfo: response.page,
    };
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


