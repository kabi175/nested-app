/**
 * College API Service
 * Handles all college-related API calls
 */

import { apiClient, ApiResponse } from '../api-client';

export interface CollegeDTO {
  id: string;
  name: string;
  location: string;
  fees: number;
  course: string;
  duration: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  course: string;
  duration: number;
  type: 'University' | 'College' | 'Institute';
}

/**
 * Fetch all colleges
 * @returns Promise with list of colleges
 */
export async function getColleges(): Promise<College[]> {
  try {
    const response = await apiClient.get<ApiResponse<CollegeDTO>>('/colleges');
    
    // Map backend response to frontend College interface
    return response.data.map(college => ({
      id: college.id,
      name: college.name,
      location: college.location,
      fees: college.fees,
      course: college.course,
      duration: college.duration,
      type: mapCollegeType(college.type),
    }));
  } catch (error) {
    console.error('Error fetching colleges:', error);
    throw error;
  }
}

/**
 * Fetch a single college by ID
 * @param id - College ID
 * @returns Promise with college details
 */
export async function getCollegeById(id: string): Promise<College> {
  try {
    const response = await apiClient.get<ApiResponse<CollegeDTO>>(`/colleges/${id}`);
    const college = response.data[0];
    
    return {
      id: college.id,
      name: college.name,
      location: college.location,
      fees: college.fees,
      course: college.course,
      duration: college.duration,
      type: mapCollegeType(college.type),
    };
  } catch (error) {
    console.error('Error fetching college:', error);
    throw error;
  }
}

/**
 * Create a new college
 * @param data - College data
 * @returns Promise with created college
 */
export async function createCollege(data: Omit<College, 'id'>): Promise<CollegeDTO> {
  try {
    const response = await apiClient.post<ApiResponse<CollegeDTO>>('/colleges', {
      data: [{
        name: data.name,
        location: data.location,
        fees: data.fees,
        course: data.course,
        duration: data.duration,
        type: data.type.toUpperCase(),
      }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error creating college:', error);
    throw error;
  }
}

/**
 * Update an existing college
 * @param data - College data with ID
 * @returns Promise with updated college
 */
export async function updateCollege(data: College): Promise<CollegeDTO> {
  try {
    const response = await apiClient.patch<ApiResponse<CollegeDTO>>('/colleges', {
      data: [{
        id: data.id,
        name: data.name,
        location: data.location,
        fees: data.fees,
        course: data.course,
        duration: data.duration,
        type: data.type.toUpperCase(),
      }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error updating college:', error);
    throw error;
  }
}

/**
 * Delete a college
 * @param id - College ID
 * @returns Promise with deleted college
 */
export async function deleteCollege(id: string): Promise<CollegeDTO> {
  try {
    const response = await apiClient.delete<ApiResponse<CollegeDTO>>('/colleges', {
      data: [{ id }],
    });
    return response.data[0];
  } catch (error) {
    console.error('Error deleting college:', error);
    throw error;
  }
}

/**
 * Helper function to map backend college type to frontend type
 */
function mapCollegeType(type: string): 'University' | 'College' | 'Institute' {
  const upperType = type.toUpperCase();
  if (upperType === 'UNIVERSITY') return 'University';
  if (upperType === 'COLLEGE') return 'College';
  if (upperType === 'INSTITUTE') return 'Institute';
  return 'College'; // Default fallback
}

