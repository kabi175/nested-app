/**
 * Admin Actions API Service
 * Handles admin action-related API calls
 */

import { apiClient } from '../api-client';

export interface RefreshPortfolioResponse {
  success: boolean;
  message?: string;
}

/**
 * Force refresh user portfolio
 * @param userId - User ID to refresh portfolio for
 * @returns Promise with refresh result
 */
export async function refreshUserPortfolio(userId: number): Promise<RefreshPortfolioResponse> {
  try {
    const response = await apiClient.post<RefreshPortfolioResponse>(
      `/admin/action/refresh-portfolio/${userId}`
    );
    return response;
  } catch (error) {
    console.error('Error refreshing user portfolio:', error);
    throw error;
  }
}
