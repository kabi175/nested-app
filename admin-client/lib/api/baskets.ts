/**
 * Basket API Service
 * Handles all basket-related API calls
 */

import { apiClient, ApiResponse } from '../api-client';

export interface BasketFund {
  fund: {
    id: string;
    code?: string;
    name: string;
    display_name?: string;
    description?: string;
    min_amount?: number;
    nav?: number;
    is_active?: boolean;
  };
  allocation_percentage: number;
}

export interface BasketDTO {
  id: string;
  title: string;
  funds: BasketFund[];
}

export interface Basket {
  id: string;
  name: string;
  category: string;
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
 * @returns Promise with list of baskets
 */
export async function getBaskets(): Promise<Basket[]> {
  try {
    const response = await apiClient.get<ApiResponse<BasketDTO>>('/bucket');
    
    // Map backend response to frontend Basket interface
    return response.data.map(basket => {
      const funds = basket.funds?.map(f => ({
        fundId: f.fund.id,
        fundName: f.fund.display_name || f.fund.name,
        percentage: f.allocation_percentage,
      })) || [];
      
      const totalPercentage = funds.reduce((sum, f) => sum + f.percentage, 0);
      
      return {
        id: basket.id,
        name: basket.title,
        category: determineCategoryByAllocation(totalPercentage),
        duration: 0, // Not provided by backend
        funds,
        totalPercentage,
        createdAt: new Date().toISOString(),
      };
    });
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
    
    const funds = basket.funds?.map(f => ({
      fundId: f.fund.id,
      fundName: f.fund.display_name || f.fund.name,
      percentage: f.allocation_percentage,
    })) || [];
    
    const totalPercentage = funds.reduce((sum, f) => sum + f.percentage, 0);
    
    return {
      id: basket.id,
      name: basket.title,
      category: determineCategoryByAllocation(totalPercentage),
      duration: 0,
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
export async function createBasket(data: Partial<BasketDTO>): Promise<BasketDTO> {
  try {
    const response = await apiClient.post<ApiResponse<BasketDTO>>('/bucket', {
      data: [data],
    });
    return response.data[0];
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
export async function updateBasket(data: BasketDTO): Promise<BasketDTO> {
  try {
    const response = await apiClient.patch<ApiResponse<BasketDTO>>('/bucket', {
      data: [data],
    });
    return response.data[0];
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

/**
 * Helper function to determine category based on allocation
 */
function determineCategoryByAllocation(totalPercentage: number): string {
  if (totalPercentage >= 90) return 'High Risk';
  if (totalPercentage >= 60) return 'Medium Risk';
  return 'Low Risk';
}


