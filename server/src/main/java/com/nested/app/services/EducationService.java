package com.nested.app.services;

import java.util.List;

import com.nested.app.dto.EducationDTO;

/**
 * Service interface for Education operations
 * Defines business logic methods for managing education records
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface EducationService {
  
  /**
   * Retrieve all education records
   * @return List of EducationDTO
   */
  List<EducationDTO> getAllEducation();
  
  /**
   * Get education record by ID
   * @param id Education ID
   * @return EducationDTO
   */
  EducationDTO getEducationById(Long id);
  
  /**
   * Create new education records
   * @param educationList List of EducationDTO to create
   * @return List of created EducationDTO
   */
  List<EducationDTO> createEducation(List<EducationDTO> educationList);
  
  /**
   * Update existing education records
   * @param educationList List of EducationDTO to update
   * @return List of updated EducationDTO
   */
  List<EducationDTO> updateEducation(List<EducationDTO> educationList);
  
  /**
   * Delete education records
   * @param ids List of IDs to delete
   * @return List of deleted EducationDTO
   */
  List<EducationDTO> deleteEducation(List<Long> ids);
}

