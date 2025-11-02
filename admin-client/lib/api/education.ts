/**
 * Education API Service
 * Handles all education-related API calls
 */

import { apiClient, ApiResponse, PaginationParams, PageInfo } from '../api-client';

export interface EducationDTO {
  id: string;
  name: string; // College name or Course name
  type: string; // INSTITUTION or COURSE
  country: string;
  lastYearFee: number;
  expectedFee: number;
  expectedIncreasePercentLt10Yr: number; // Expected % increase for < 10 years
  expectedIncreasePercentGt10Yr: number; // Expected % increase for > 10 years
}

export interface Education {
  id: string;
  name: string;
  type: 'INSTITUTION' | 'COURSE';
  country: string;
  lastYearFee: number;
  expectedFee: number;
  expectedIncreasePercentLt10Yr: number;
  expectedIncreasePercentGt10Yr: number;
}

/**
 * Fetch all education records
 * @param pagination - Pagination parameters
 * @param search - Optional search term to filter by name or country
 * @param type - Optional filter by education type (INSTITUTION or COURSE)
 * @returns Promise with list of education records and pagination info
 */
export async function getEducation(
  pagination?: PaginationParams,
  search?: string,
  type?: 'INSTITUTION' | 'COURSE'
): Promise<{ education: Education[]; pageInfo?: PageInfo }> {
  try {
    const params: Record<string, any> = {};
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sort) params.sort = pagination.sort;
    }
    if (search) {
      params.search = search;
    }
    if (type) {
      params.type = type;
    }
    
    const response = await apiClient.get<ApiResponse<EducationDTO>>('/education', params);
    
    // Map backend response to frontend Education interface
    const education = response.data.map(edu => ({
      id: edu.id,
      name: edu.name,
      type: edu.type as 'INSTITUTION' | 'COURSE',
      country: edu.country,
      lastYearFee: edu.lastYearFee,
      expectedFee: edu.expectedFee,
      expectedIncreasePercentLt10Yr: edu.expectedIncreasePercentLt10Yr,
      expectedIncreasePercentGt10Yr: edu.expectedIncreasePercentGt10Yr,
    }));
    
    return {
      education,
      pageInfo: response.page,
    };
  } catch (error) {
    console.error('Error fetching education:', error);
    throw error;
  }
}

/**
 * Fetch a single education record by ID
 * @param id - Education ID
 * @returns Promise with education details
 */
export async function getEducationById(id: string): Promise<Education> {
  try {
    const response = await apiClient.get<ApiResponse<EducationDTO>>(`/education/${id}`);
    const edu = response.data[0];
    
    return {
      id: edu.id,
      name: edu.name,
      type: edu.type as 'INSTITUTION' | 'COURSE',
      country: edu.country,
      lastYearFee: edu.lastYearFee,
      expectedFee: edu.expectedFee,
      expectedIncreasePercentLt10Yr: edu.expectedIncreasePercentLt10Yr,
      expectedIncreasePercentGt10Yr: edu.expectedIncreasePercentGt10Yr,
    };
  } catch (error) {
    console.error('Error fetching education:', error);
    throw error;
  }
}

/**
 * Create a new education record
 * @param data - Education data
 * @returns Promise with created education record
 */
export async function createEducation(data: Omit<Education, 'id'>): Promise<EducationDTO> {
  try {
    const response = await apiClient.post<ApiResponse<EducationDTO>>('/education', {
      data: [{
        name: data.name,
        type: data.type,
        country: data.country,
        lastYearFee: data.lastYearFee,
        expectedFee: data.expectedFee,
        expectedIncreasePercentLt10Yr: data.expectedIncreasePercentLt10Yr,
        expectedIncreasePercentGt10Yr: data.expectedIncreasePercentGt10Yr,
      }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error creating education:', error);
    throw error;
  }
}

/**
 * Update an existing education record
 * @param data - Education data with ID
 * @returns Promise with updated education record
 */
export async function updateEducation(data: Education): Promise<EducationDTO> {
  try {
    const response = await apiClient.patch<ApiResponse<EducationDTO>>('/education', {
      data: [{
        id: data.id,
        name: data.name,
        type: data.type,
        country: data.country,
        lastYearFee: data.lastYearFee,
        expectedFee: data.expectedFee,
        expectedIncreasePercentLt10Yr: data.expectedIncreasePercentLt10Yr,
        expectedIncreasePercentGt10Yr: data.expectedIncreasePercentGt10Yr,
      }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error updating education:', error);
    throw error;
  }
}

/**
 * Delete an education record
 * @param id - Education ID
 * @returns Promise with deleted education record
 */
export async function deleteEducation(id: string): Promise<EducationDTO> {
  try {
    const response = await apiClient.delete<ApiResponse<EducationDTO>>('/education', {
      data: [{ id }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error deleting education:', error);
    throw error;
  }
}

/**
 * Seed sample education data
 * @returns Promise with list of created education records
 */
export async function seedEducationData(): Promise<EducationDTO[]> {
  try {
    const response = await apiClient.post<ApiResponse<EducationDTO>>('/education/seed', {});
    return response.data;
  } catch (error) {
    console.error('Error seeding education data:', error);
    throw error;
  }
}

