package com.nested.app.services;

import java.util.List;

import com.nested.app.dto.CollegeDTO;

/**
 * Service interface for managing College entities
 * Provides business logic for college-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface CollegeService {
    
    /**
     * Retrieves a college by its ID
     * 
     * @param id College ID
     * @return College data or null if not found
     */
    CollegeDTO getCollegeById(String id);
    
    /**
     * Retrieves all colleges
     * 
     * @return List of all colleges
     */
    List<CollegeDTO> getAllColleges();
    
    /**
     * Creates a new college
     * 
     * @param collegeDTO College data to create
     * @return Created college data
     */
    CollegeDTO createCollege(CollegeDTO collegeDTO);
    
    /**
     * Updates an existing college
     * 
     * @param collegeDTO College data to update
     * @return Updated college data
     */
    CollegeDTO updateCollege(CollegeDTO collegeDTO);

    /**
     * Deletes a college
     * 
     * @param collegeDTO College data to delete
     * @return Deleted college data
     */
    CollegeDTO deleteCollege(CollegeDTO collegeDTO);

    /**
     * Creates multiple colleges
     * 
     * @param colleges List of college data to create
     * @return List of created colleges
     */
    List<CollegeDTO> createColleges(List<CollegeDTO> colleges);

    /**
     * Updates multiple colleges
     * 
     * @param colleges List of college data to update
     * @return List of updated colleges
     */
    List<CollegeDTO> updateColleges(List<CollegeDTO> colleges);

    /**
     * Deletes multiple colleges
     * 
     * @param colleges List of college data to delete
     * @return List of deleted colleges
     */
    List<CollegeDTO> deleteColleges(List<CollegeDTO> colleges);
}

