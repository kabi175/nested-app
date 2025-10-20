/**
 * Fund API Service
 * Handles all fund-related API calls
 */

import { apiClient, ApiResponse, PaginationParams, PageInfo } from '../api-client';

export interface FundDTO {
  id: string;
  code?: string;
  name: string;
  displayName?: string;
  description?: string;
  minAmount?: number;
  nav: number;
  isActive: boolean;
}

export interface Fund {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  nav: number;
  isActive: boolean;
}

/**
 * Fetch all funds
 * @param pagination - Pagination parameters
 * @param activeOnly - Filter for active funds only
 * @returns Promise with list of funds and pagination info
 */
export async function getFunds(
  pagination?: PaginationParams,
  activeOnly: boolean = false
): Promise<{ funds: Fund[]; pageInfo?: PageInfo }> {
  try {
    const params: Record<string, any> = { activeOnly };
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sort) params.sort = pagination.sort;
    }
    
    const response = await apiClient.get<ApiResponse<FundDTO>>('/funds', params);
    
    // Map backend response to frontend Fund interface
    const funds = response.data.map(fund => ({
      id: fund.id,
      name: fund.name,
      displayName: fund.displayName,
      description: fund.description,
      nav: fund.nav,
      isActive: fund.isActive,
    }));
    
    return {
      funds,
      pageInfo: response.page,
    };
  } catch (error) {
    console.error('Error fetching funds:', error);
    throw error;
  }
}

/**
 * Fetch only active funds
 * @returns Promise with list of active funds
 */
export async function getActiveFunds(): Promise<Fund[]> {
  try {
    const response = await getFunds({ size: 1000 }, true);
    return response.funds;
  } catch (error) {
    console.error('Error fetching active funds:', error);
    throw error;
  }
}

