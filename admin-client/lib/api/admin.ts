/**
 * Admin Management API Service
 * Handles admin user creation and management
 */

import { apiClient } from '../api-client';
import { User } from './users';

export interface CreateAdminRequest {
  email?: string;
  firebaseUid?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

/**
 * Create a new admin user
 * @param request - Admin user details (email or firebaseUid required)
 * @returns Promise with creation result
 */
export async function createAdminUser(request: CreateAdminRequest): Promise<CreateAdminResponse> {
  try {
    const response = await apiClient.post<CreateAdminResponse>('/admin/create-admin', request);
    return response;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Promote an existing user to admin
 * @param userId - User ID to promote
 * @returns Promise with promotion result
 */
export async function promoteToAdmin(userId: number): Promise<CreateAdminResponse> {
  try {
    const response = await apiClient.post<CreateAdminResponse>(`/admin/promote/${userId}`, {});
    return response;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
}

/**
 * Demote an admin user to standard user
 * @param userId - User ID to demote
 * @returns Promise with demotion result
 */
export async function demoteFromAdmin(userId: number): Promise<CreateAdminResponse> {
  try {
    const response = await apiClient.post<CreateAdminResponse>(`/admin/demote/${userId}`, {});
    return response;
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    throw error;
  }
}

