package com.nested.app.services;

import java.util.List;

import com.nested.app.dto.HoldingDTO;

/**
 * Service interface for managing Holding entities
 * Provides business logic for holding-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface HoldingService {
    
    /**
     * Retrieves holdings by goal ID
     * 
     * @param goalId Goal ID to filter holdings
     * @return List of holdings for the specified goal
     */
    List<HoldingDTO> getHoldingsByGoal(String goalId);
    
    /**
     * Retrieves holdings by goal ID (alias method for API compatibility)
     * 
     * @param goalId Goal ID to filter holdings
     * @return List of holdings for the specified goal
     */
    List<HoldingDTO> getHoldingsByGoalId(String goalId);
    
    /**
     * Retrieves all holdings
     * 
     * @return List of all holdings
     */
    List<HoldingDTO> getAllHoldings();
    
    /**
     * Creates a new holding
     * 
     * @param holdingDTO Holding data to create
     * @return Created holding data
     */
    HoldingDTO createHolding(HoldingDTO holdingDTO);
    
    /**
     * Updates an existing holding
     * 
     * @param holdingDTO Holding data to update
     * @return Updated holding data
     */
    HoldingDTO updateHolding(HoldingDTO holdingDTO);
}
