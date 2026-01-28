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
  isReadyToInvest?: boolean;
  kycStatus?: string;
  nomineeStatus?: string;
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
  pan_number?: string;
  panNumber?: string; // Support both formats
  is_ready_to_invest?: boolean;
  kyc_status?: 'unknown' | 'pending' | 'aadhaar_pending' | 'esign_pending' | 'submitted' | 'completed' | 'failed' | 
               'UNKNOWN' | 'PENDING' | 'AADHAAR_PENDING' | 'E_SIGN_PENDING' | 'SUBMITTED' | 'COMPLETED' | 'FAILED';
  nominee_status?: 'unknown' | 'opt_out' | 'completed' | 'UNKNOWN' | 'OPT_OUT' | 'COMPLETED';
  investor?: Investor; // May not be included in API response
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
    // Note: UserDTO.fromEntity() doesn't explicitly map investor, but Jackson may serialize it
    // if the relationship is loaded. We derive investor status from User fields as fallback.
    const users = response.data.map((user: any) => {
      const panNumber = user.pan_number || user.panNumber;
      const kycStatus = (user.kyc_status || '').toLowerCase();
      const nomineeStatus = (user.nominee_status || '').toLowerCase();
      const isReadyToInvest = user.is_ready_to_invest || false;
      
      // Check if user has investor account
      // User has investor if: investor object exists OR isReadyToInvest is true
      // (isReadyToInvest=true means investor account exists and is ready)
      const hasInvestor = !!(user.investor || isReadyToInvest);
      
      let investor: Investor | undefined;
      
      if (hasInvestor) {
        let investorStatus: Investor['status'] = 'incomplete_detail';
        let investorId: number | undefined;
        
        // If investor object exists with status/id, use it
        if (user.investor) {
          investorId = user.investor.id;
          if (user.investor.status) {
            investorStatus = user.investor.status;
          }
        }
        
        // If no explicit status, derive from User fields (matching server logic)
        if (!user.investor?.status) {
          if (isReadyToInvest) {
            investorStatus = 'ready_to_invest';
          } else if (kycStatus === 'completed') {
            // KYC completed - check nominee status
            if (nomineeStatus === 'unknown') {
              investorStatus = 'pending_nominee_authentication';
            } else {
              investorStatus = 'under_review';
            }
          } else if (kycStatus === 'submitted') {
            investorStatus = 'under_review';
          } else if (kycStatus === 'pending' || kycStatus === 'aadhaar_pending' || kycStatus === 'esign_pending') {
            investorStatus = 'incomplete_kyc_details';
          } else if (nomineeStatus === 'unknown') {
            investorStatus = 'pending_nominee_authentication';
          } else {
            investorStatus = 'incomplete_detail';
          }
        }
        
        investor = {
          id: investorId,
          status: investorStatus,
        };
      }
      
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        address: user.address,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        panNumber: panNumber,
        investor: investor,
        isReadyToInvest: isReadyToInvest,
        kycStatus: user.kyc_status,
        nomineeStatus: user.nominee_status,
      };
    });
    
    // Extract pagination info from response
    // Server returns Entity with { data: [...], count: number }
    // Since server doesn't return totalElements/totalPages, we need to infer it
    // If we got a full page (data.length === pageSize), assume there are more pages
    const currentPageNum = pagination?.page || 0;
    const currentPageSize = pagination?.size || 10;
    const receivedCount = response.data.length;
    
    // If we got a full page, there are likely more pages
    // We'll estimate totalElements as at least (currentPage + 1) * pageSize + 1
    // This ensures pagination shows when there are more users
    const hasMorePages = receivedCount === currentPageSize;
    const estimatedTotalElements = hasMorePages 
      ? (currentPageNum + 1) * currentPageSize + 1 // At least one more user
      : currentPageNum * currentPageSize + receivedCount; // This is the last page
    
    const pageInfo: PageInfo = {
      totalElements: response.totalElements || response.page?.totalElements || estimatedTotalElements,
      totalPages: response.totalPages || response.page?.totalPages || Math.ceil(estimatedTotalElements / currentPageSize),
      currentPage: currentPageNum,
      pageSize: currentPageSize,
    };
    
    return {
      users,
      pageInfo,
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


