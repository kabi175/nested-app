/**
 * Admin Actions API Service
 * Handles admin action-related API calls
 */

import { apiClient } from '../api-client';

export interface RefreshPortfolioResponse {
  success: boolean;
  message?: string;
}

export interface TriggerSipTrackerResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Force refresh user portfolio
 * @param userId - User ID to refresh portfolio for
 * @returns Promise with refresh result
 */
/**
 * Trigger SIP transaction tracker for a given order item ref
 * @param orderRef - SIP order item ref (e.g. MFP123456)
 * @returns Promise with trigger result
 */
export async function triggerSipTransactionTracker(
  orderRef: string
): Promise<TriggerSipTrackerResponse> {
  try {
    const response = await apiClient.post<TriggerSipTrackerResponse>(
      `/admin/action/trigger-sip-tracker/${encodeURIComponent(orderRef)}`
    );
    return response;
  } catch (error) {
    console.error('Error triggering SIP transaction tracker:', error);
    throw error;
  }
}

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
