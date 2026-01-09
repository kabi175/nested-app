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
  isActive?: boolean;
  active?: boolean; // Jackson may serialize isActive as "active"
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
    
    const response = await apiClient.get<{ data: FundDTO[]; count?: number }>('/funds', params);
    
    // Map backend response to frontend Fund interface
    // With @JsonProperty("isActive"), it should serialize as "isActive"
    // But handle both cases for safety
    const funds = response.data.map((fund: any) => ({
      id: fund.id,
      name: fund.name,
      displayName: fund.displayName,
      description: fund.description,
      nav: fund.nav,
      isActive: fund.isActive !== undefined ? fund.isActive : (fund.active !== undefined ? fund.active : true), // Default to true if not specified
    }));
    
    // Backend Entity class doesn't include pagination info (totalElements, totalPages)
    // Only returns count which is the size of current page data
    // PageInfo will be calculated in the component using stats
    return {
      funds,
      pageInfo: undefined, // Backend doesn't provide pagination metadata
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


/**
 * Update fund label (display name)
 * @param id - Fund ID
 * @param label - New label value
 * @returns Promise with updated fund
 */
export async function updateFundLabel(id: string, label: string): Promise<FundDTO> {
  try {
    const response = await apiClient.put<ApiResponse<FundDTO>>(
      `/funds/${id}/label`,
      { label }
    );
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No fund data returned from server');
    }
    
    return response.data[0];
  } catch (error) {
    console.error('Error updating fund label:', error);
    throw error;
  }
}
