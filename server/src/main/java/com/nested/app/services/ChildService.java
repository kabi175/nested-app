package com.nested.app.services;

import java.util.List;

import com.nested.app.dto.ChildDTO;

/**
 * Service interface for managing Child entities
 * Provides business logic for child-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface ChildService {
    
    /**
     * Retrieves all children from the system
     * 
     * @return List of all children
     */
    List<ChildDTO> getAllChildren();

    /**
     * Creates a new child
     * 
     * @param childDTO Child data to create
     * @return Created child data
     */
    ChildDTO createChild(ChildDTO childDTO);

    /**
     * Updates an existing child
     * 
     * @param childDTO Child data to update
     * @return Updated child data
     */
    ChildDTO updateChild(ChildDTO childDTO);
    
    /**
     * Creates multiple children
     * 
     * @param children List of child data to create
     * @return List of created children
     */
    List<ChildDTO> createChildren(List<ChildDTO> children);
    
    /**
     * Updates multiple children
     * 
     * @param children List of child data to update
     * @return List of updated children
     */
    List<ChildDTO> updateChildren(List<ChildDTO> children);
}
