package com.nested.app.services;

import com.nested.app.dto.ChildDTO;
import com.nested.app.entity.Child;
import com.nested.app.repository.ChildRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing Child entities
 * Provides business logic for child-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;

    /**
     * Retrieves all children from the system
     * 
     * @return List of all children
     */
    @Override
    @Transactional(readOnly = true)
    public List<ChildDTO> getAllChildren() {
        log.info("Retrieving all children from database");
        
        try {
            List<Child> children = childRepository.findAll();
            List<ChildDTO> childDTOs = children.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} children", childDTOs.size());
            return childDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve children", e);
        }
    }

    /**
     * Creates a new child
     * 
     * @param childDTO Child data to create
     * @return Created child data
     */
    @Override
    public ChildDTO createChild(ChildDTO childDTO) {
        log.info("Creating new child with name: {}", childDTO.getFirstName());
        
        try {
            Child child = convertToEntity(childDTO);
            Child savedChild = childRepository.save(child);
            ChildDTO savedChildDTO = convertToDTO(savedChild);
            
            log.info("Successfully created child with ID: {}", savedChild.getId());
            return savedChildDTO;
            
        } catch (Exception e) {
            log.error("Error creating child: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create child", e);
        }
    }

    /**
     * Updates an existing child
     * 
     * @param childDTO Child data to update
     * @return Updated child data
     */
    @Override
    public ChildDTO updateChild(ChildDTO childDTO) {
        log.info("Updating child with ID: {}", childDTO.getId());
        
        try {
            if (childDTO.getId() == null) {
                throw new IllegalArgumentException("Child ID cannot be null for update operation");
            }
            
            Child existingChild = childRepository.findById(childDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Child not found with ID: " + childDTO.getId()));
            
            // Update fields
            existingChild.setFirstName(childDTO.getFirstName());
            existingChild.setLastName(childDTO.getLastName());
            existingChild.setDateOfBirth(childDTO.getDateOfBirth());
            existingChild.setGender(childDTO.getGender());
            existingChild.setInvestUnderChild(childDTO.isInvestUnderChild());
            
            Child updatedChild = childRepository.save(existingChild);
            ChildDTO updatedChildDTO = convertToDTO(updatedChild);
            
            log.info("Successfully updated child with ID: {}", updatedChild.getId());
            return updatedChildDTO;
            
        } catch (Exception e) {
            log.error("Error updating child with ID {}: {}", childDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update child", e);
        }
    }
    
    /**
     * Creates multiple children
     * 
     * @param children List of child data to create
     * @return List of created children
     */
    @Override
    public List<ChildDTO> createChildren(List<ChildDTO> children) {
        log.info("Creating {} children", children.size());
        
        try {
            List<Child> childEntities = children.stream()
                    .map(this::convertToEntity)
                    .collect(Collectors.toList());
            
            List<Child> savedChildren = childRepository.saveAll(childEntities);
            List<ChildDTO> savedChildDTOs = savedChildren.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully created {} children", savedChildDTOs.size());
            return savedChildDTOs;
            
        } catch (Exception e) {
            log.error("Error creating children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create children", e);
        }
    }
    
    /**
     * Updates multiple children
     * 
     * @param children List of child data to update
     * @return List of updated children
     */
    @Override
    public List<ChildDTO> updateChildren(List<ChildDTO> children) {
        log.info("Updating {} children", children.size());
        
        try {
            List<ChildDTO> updatedChildren = children.stream()
                    .map(this::updateChild)
                    .collect(Collectors.toList());
            
            log.info("Successfully updated {} children", updatedChildren.size());
            return updatedChildren;
            
        } catch (Exception e) {
            log.error("Error updating children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update children", e);
        }
    }

    /**
     * Converts Child entity to ChildDTO
     * 
     * @param child Child entity
     * @return ChildDTO
     */
    private ChildDTO convertToDTO(Child child) {
        log.debug("Converting Child entity to DTO for ID: {}", child.getId());
        
        ChildDTO dto = new ChildDTO();
        dto.setId(child.getId());
        dto.setFirstName(child.getFirstName());
        dto.setLastName(child.getLastName());
        dto.setDateOfBirth(child.getDateOfBirth());
        dto.setGender(child.getGender());
        dto.setInvestUnderChild(child.isInvestUnderChild());
        
        // Set user information if available
        if (child.getUser() != null) {
            dto.setUserId(child.getUser().getId());
        }
        
        return dto;
    }

    /**
     * Converts ChildDTO to Child entity
     * 
     * @param childDTO ChildDTO
     * @return Child entity
     */
    private Child convertToEntity(ChildDTO childDTO) {
        log.debug("Converting ChildDTO to entity for name: {}", childDTO.getFirstName());
        
        Child child = new Child();
        child.setId(childDTO.getId());
        child.setFirstName(childDTO.getFirstName());
        child.setLastName(childDTO.getLastName());
        child.setDateOfBirth(childDTO.getDateOfBirth());
        child.setGender(childDTO.getGender());
        child.setInvestUnderChild(childDTO.isInvestUnderChild());
        
        return child;
    }
}
