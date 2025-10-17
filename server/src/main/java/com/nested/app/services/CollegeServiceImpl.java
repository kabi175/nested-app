package com.nested.app.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nested.app.dto.CollegeDTO;
import com.nested.app.entity.College;
import com.nested.app.repository.CollegeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service implementation for managing College entities
 * Provides business logic for college-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CollegeServiceImpl implements CollegeService {

    private final CollegeRepository collegeRepository;

    /**
     * Retrieves a college by its ID
     * 
     * @param id College ID
     * @return College data or null if not found
     */
    @Override
    @Transactional(readOnly = true)
    public CollegeDTO getCollegeById(String id) {
        log.info("Retrieving college with ID: {}", id);
        
        try {
            Optional<College> collegeOpt = collegeRepository.findById(Long.valueOf(id));
            
            if (collegeOpt.isEmpty()) {
                log.warn("College not found with ID: {}", id);
                return null;
            }
            
            CollegeDTO collegeDTO = convertToDTO(collegeOpt.get());
            log.info("Successfully retrieved college with ID: {}", id);
            return collegeDTO;
            
        } catch (NumberFormatException e) {
            log.error("Invalid college ID format: {}", id);
            throw new IllegalArgumentException("Invalid college ID format: " + id);
        } catch (Exception e) {
            log.error("Error retrieving college with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve college", e);
        }
    }
    
    /**
     * Retrieves all colleges
     * 
     * @return List of all colleges
     */
    @Override
    @Transactional(readOnly = true)
    public List<CollegeDTO> getAllColleges() {
        log.info("Retrieving all colleges from database");
        
        try {
            List<College> colleges = collegeRepository.findAll();
            List<CollegeDTO> collegeDTOs = colleges.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} colleges", collegeDTOs.size());
            return collegeDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving all colleges: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve colleges", e);
        }
    }
    
    /**
     * Creates a new college
     * 
     * @param collegeDTO College data to create
     * @return Created college data
     */
    @Override
    public CollegeDTO createCollege(CollegeDTO collegeDTO) {
        log.info("Creating new college: {}", collegeDTO.getName());
        
        try {
            // Validate input
            validateCollegeDTO(collegeDTO);
            
            // Convert DTO to entity
            College college = convertToEntity(collegeDTO);
            
            // Save to database
            College savedCollege = collegeRepository.save(college);
            
            log.info("Successfully created college with ID: {}", savedCollege.getId());
            return convertToDTO(savedCollege);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating college: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating college: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create college", e);
        }
    }
    
    /**
     * Updates an existing college
     * 
     * @param collegeDTO College data to update
     * @return Updated college data
     */
    @Override
    public CollegeDTO updateCollege(CollegeDTO collegeDTO) {
        log.info("Updating college with ID: {}", collegeDTO.getId());
        
        try {
            // Validate input
            validateCollegeDTO(collegeDTO);
            
            if (collegeDTO.getId() == null) {
                throw new IllegalArgumentException("College ID is required for update");
            }
            
            // Check if college exists
            Optional<College> existingCollegeOpt = collegeRepository.findById(collegeDTO.getId());
            if (existingCollegeOpt.isEmpty()) {
                throw new IllegalArgumentException("College not found with ID: " + collegeDTO.getId());
            }
            
            // Convert DTO to entity
            College college = convertToEntity(collegeDTO);
            college.setId(collegeDTO.getId());
            
            // Save to database
            College updatedCollege = collegeRepository.save(college);
            
            log.info("Successfully updated college with ID: {}", updatedCollege.getId());
            return convertToDTO(updatedCollege);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating college: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating college: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update college", e);
        }
    }

    /**
     * Deletes a college
     * 
     * @param collegeDTO College data to delete
     * @return Deleted college data
     */
    @Override
    public CollegeDTO deleteCollege(CollegeDTO collegeDTO) {
        log.info("Deleting college with ID: {}", collegeDTO.getId());
        
        try {
            if (collegeDTO.getId() == null) {
                throw new IllegalArgumentException("College ID is required for deletion");
            }
            
            // Check if college exists
            Optional<College> existingCollegeOpt = collegeRepository.findById(collegeDTO.getId());
            if (existingCollegeOpt.isEmpty()) {
                throw new IllegalArgumentException("College not found with ID: " + collegeDTO.getId());
            }
            
            College college = existingCollegeOpt.get();
            collegeRepository.delete(college);
            
            log.info("Successfully deleted college with ID: {}", collegeDTO.getId());
            return convertToDTO(college);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting college: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting college: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete college", e);
        }
    }

    /**
     * Creates multiple colleges
     * 
     * @param colleges List of college data to create
     * @return List of created colleges
     */
    @Override
    public List<CollegeDTO> createColleges(List<CollegeDTO> colleges) {
        log.info("Creating {} colleges", colleges.size());
        
        return colleges.stream()
                .map(this::createCollege)
                .collect(Collectors.toList());
    }

    /**
     * Updates multiple colleges
     * 
     * @param colleges List of college data to update
     * @return List of updated colleges
     */
    @Override
    public List<CollegeDTO> updateColleges(List<CollegeDTO> colleges) {
        log.info("Updating {} colleges", colleges.size());
        
        return colleges.stream()
                .map(this::updateCollege)
                .collect(Collectors.toList());
    }

    /**
     * Deletes multiple colleges
     * 
     * @param colleges List of college data to delete
     * @return List of deleted colleges
     */
    @Override
    public List<CollegeDTO> deleteColleges(List<CollegeDTO> colleges) {
        log.info("Deleting {} colleges", colleges.size());
        
        return colleges.stream()
                .map(this::deleteCollege)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts College entity to DTO
     * 
     * @param college College entity
     * @return CollegeDTO
     */
    private CollegeDTO convertToDTO(College college) {
        CollegeDTO dto = new CollegeDTO();
        dto.setId(college.getId());
        dto.setName(college.getName());
        dto.setLocation(college.getLocation());
        dto.setFees(college.getFees());
        dto.setCourse(college.getCourse());
        dto.setDuration(college.getDuration());
        dto.setType(college.getType().name());
        dto.setCreatedAt(college.getCreatedAt());
        dto.setUpdatedAt(college.getUpdatedAt());
        return dto;
    }
    
    /**
     * Converts CollegeDTO to entity
     * 
     * @param dto CollegeDTO
     * @return College entity
     */
    private College convertToEntity(CollegeDTO dto) {
        College college = new College();
        college.setName(dto.getName());
        college.setLocation(dto.getLocation());
        college.setFees(dto.getFees());
        college.setCourse(dto.getCourse());
        college.setDuration(dto.getDuration());
        
        return college;
    }
    
    /**
     * Validates CollegeDTO
     * 
     * @param dto CollegeDTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateCollegeDTO(CollegeDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("College name is required");
        }
        
        if (dto.getLocation() == null || dto.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("College location is required");
        }
        
        if (dto.getFees() == null || dto.getFees() <= 0) {
            throw new IllegalArgumentException("College fees must be greater than 0");
        }
        
        if (dto.getCourse() == null || dto.getCourse().trim().isEmpty()) {
            throw new IllegalArgumentException("Course is required");
        }
        
        if (dto.getDuration() == null || dto.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        
        if (dto.getType() == null || dto.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("College type is required");
        }
    }
}

