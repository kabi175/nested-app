/**
 * Basket API Service
 * Handles all basket-related API calls
 */

import { apiClient, ApiResponse, PaginationParams, PageInfo } from '../api-client';

export interface BasketFund {
  fundId?: number;
  fund?: {
    id: string;
    code?: string;
    name: string;
    displayName?: string;
    description?: string;
    minAmount?: number;
    nav?: number;
    isActive?: boolean;
  };
  allocationPercentage: number;
}

export interface BasketDTO {
  id: string;
  title: string;
  years?: number;
  funds: BasketFund[];
}

export interface CreateBasketDTO {
  title: string;
  years?: number;
  funds: {
    fundId: number;
    allocationPercentage: number;
  }[];
}

export interface UpdateBasketDTO {
  id: string;
  title: string;
  years?: number;
  funds: {
    fundId: number;
    allocationPercentage: number;
  }[];
}

export interface Basket {
  id: string;
  name: string;
  duration: number;
  funds: {
    fundId: string;
    fundName: string;
    percentage: number;
  }[];
  totalPercentage: number;
  createdAt: string;
}

/**
 * Fetch all baskets
 * @param pagination - Pagination parameters
 * @returns Promise with list of baskets and pagination info
 */
export async function getBaskets(
  pagination?: PaginationParams
): Promise<{ baskets: Basket[]; pageInfo?: PageInfo }> {
  try {
    const params: Record<string, any> = {};
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sort) params.sort = pagination.sort;
    }
    
    const response = await apiClient.get<ApiResponse<BasketDTO>>('/bucket', params);
    
    // Handle empty or undefined response
    if (!response || !response.data || !Array.isArray(response.data)) {
      return { baskets: [], pageInfo: undefined };
    }
    
    // Map backend response to frontend Basket interface
    const baskets = response.data
      .filter(basket => basket && basket.id && basket.title) // Filter out invalid baskets
      .map(basket => {
        const funds = basket.funds?.map(f => {
          // Handle both new structure (fundId) and old structure (fund.id)
          const id = f.fund?.id || (f.fundId ? String(f.fundId) : '');
          const name = f.fund?.displayName || f.fund?.name || 'Unknown Fund';
          const percentage = f.allocationPercentage || 0;
          
          return {
            fundId: id,
            fundName: name,
            percentage: percentage,
          };
        }).filter(f => f.fundId) || []; // Filter out invalid funds
        
        const totalPercentage = funds.reduce((sum, f) => sum + f.percentage, 0);
        
        return {
          id: String(basket.id),
          name: basket.title,
          duration: basket.years || 0,
          funds,
          totalPercentage,
          createdAt: new Date().toISOString(),
        };
      });
    
    return {
      baskets,
      pageInfo: response.page,
    };
  } catch (error) {
    console.error('Error fetching baskets:', error);
    throw error;
  }
}

/**
 * Fetch a single basket by ID
 * @param id - Basket ID
 * @returns Promise with basket details
 */
export async function getBasketById(id: string): Promise<Basket> {
  try {
    const response = await apiClient.get<ApiResponse<BasketDTO>>(`/bucket/${id}`);
    const basket = response.data[0];
    
    if (!basket) {
      throw new Error('Basket not found');
    }
    
    const funds = basket.funds?.map(f => {
      // Handle both new structure (fundId) and old structure (fund.id)
      const fundId = f.fund?.id || (f.fundId ? String(f.fundId) : '');
      const fundName = f.fund?.displayName || f.fund?.name || 'Unknown Fund';
      const percentage = f.allocationPercentage || 0;
      
      return {
        fundId,
        fundName,
        percentage,
      };
    }).filter(f => f.fundId) || [];
    
    const totalPercentage = funds.reduce((sum, f) => sum + f.percentage, 0);
    
    return {
      id: String(basket.id),
      name: basket.title,
      duration: basket.years || 0,
      funds,
      totalPercentage,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching basket:', error);
    throw error;
  }
}

/**
 * Create a new basket
 * @param data - Basket data
 * @returns Promise with created basket
 */
export async function createBasket(data: CreateBasketDTO): Promise<BasketDTO> {
  try {
    // Send basket directly (not wrapped in data array)
    const response = await apiClient.post<BasketDTO>('/bucket', data);
    return response;
  } catch (error) {
    console.error('Error creating basket:', error);
    throw error;
  }
}

/**
 * Update an existing basket
 * @param data - Basket data with ID
 * @returns Promise with updated basket
 */
export async function updateBasket(data: UpdateBasketDTO): Promise<BasketDTO> {
  try {
    // Send basket directly (not wrapped in data array)
    const response = await apiClient.patch<BasketDTO>('/bucket', data);
    return response;
  } catch (error) {
    console.error('Error updating basket:', error);
    throw error;
  }
}

/**
 * Delete a basket
 * @param id - Basket ID
 * @returns Promise with deleted basket
 */
export async function deleteBasket(id: string): Promise<BasketDTO> {
  try {
    const response = await apiClient.delete<ApiResponse<BasketDTO>>('/bucket', {
      data: [{ id }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error deleting basket:', error);
    throw error;
  }
}

