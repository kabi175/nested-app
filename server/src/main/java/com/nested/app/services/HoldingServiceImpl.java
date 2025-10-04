package com.nested.app.services;

import com.nested.app.dto.HoldingDTO;
import com.nested.app.entity.Holding;
import com.nested.app.repository.HoldingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing Holding entities
 * Provides business logic for holding-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HoldingServiceImpl implements HoldingService {

    private final HoldingRepository holdingRepository;

    /**
     * Retrieves holdings by goal ID
     * 
     * @param goalId Goal ID to filter holdings
     * @return List of holdings for the specified goal
     */
    @Override
    @Transactional(readOnly = true)
    public List<HoldingDTO> getHoldingsByGoal(String goalId) {
        log.info("Retrieving holdings for goal ID: {}", goalId);
        
        try {
            List<Holding> holdings = holdingRepository.findByGoalId(Long.parseLong(goalId));
            List<HoldingDTO> holdingDTOs = holdings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} holdings for goal ID: {}", holdingDTOs.size(), goalId);
            return holdingDTOs;
            
        } catch (NumberFormatException e) {
            log.error("Invalid goal ID format: {}", goalId);
            throw new IllegalArgumentException("Invalid goal ID format: " + goalId);
        } catch (Exception e) {
            log.error("Error retrieving holdings for goal ID {}: {}", goalId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve holdings for goal", e);
        }
    }
    
    /**
     * Retrieves holdings by goal ID (alias method for API compatibility)
     * 
     * @param goalId Goal ID to filter holdings
     * @return List of holdings for the specified goal
     */
    @Override
    @Transactional(readOnly = true)
    public List<HoldingDTO> getHoldingsByGoalId(String goalId) {
        return getHoldingsByGoal(goalId);
    }
    
    /**
     * Retrieves all holdings
     * 
     * @return List of all holdings
     */
    @Override
    @Transactional(readOnly = true)
    public List<HoldingDTO> getAllHoldings() {
        log.info("Retrieving all holdings from database");
        
        try {
            List<Holding> holdings = holdingRepository.findAll();
            List<HoldingDTO> holdingDTOs = holdings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} holdings", holdingDTOs.size());
            return holdingDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving all holdings: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve holdings", e);
        }
    }
    
    /**
     * Creates a new holding
     * 
     * @param holdingDTO Holding data to create
     * @return Created holding data
     */
    @Override
    public HoldingDTO createHolding(HoldingDTO holdingDTO) {
        log.info("Creating new holding for goal ID: {}", holdingDTO.getGoalId());
        
        try {
            Holding holding = convertToEntity(holdingDTO);
            Holding savedHolding = holdingRepository.save(holding);
            HoldingDTO savedHoldingDTO = convertToDTO(savedHolding);
            
            log.info("Successfully created holding with ID: {}", savedHolding.getId());
            return savedHoldingDTO;
            
        } catch (Exception e) {
            log.error("Error creating holding: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create holding", e);
        }
    }
    
    /**
     * Updates an existing holding
     * 
     * @param holdingDTO Holding data to update
     * @return Updated holding data
     */
    @Override
    public HoldingDTO updateHolding(HoldingDTO holdingDTO) {
        log.info("Updating holding with ID: {}", holdingDTO.getId());
        
        try {
            if (holdingDTO.getId() == null) {
                throw new IllegalArgumentException("Holding ID cannot be null for update operation");
            }
            
            Holding existingHolding = holdingRepository.findById(holdingDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Holding not found with ID: " + holdingDTO.getId()));
            
            // Update fields
            existingHolding.setUnits(holdingDTO.getUnits());
            existingHolding.setInvestedAmount(holdingDTO.getInvestedAmount());
            existingHolding.setCurrentValue(holdingDTO.getCurrentValue());
            existingHolding.setOrderAllocationPercentage(holdingDTO.getOrderAllocationPercentage());
            
            Holding updatedHolding = holdingRepository.save(existingHolding);
            HoldingDTO updatedHoldingDTO = convertToDTO(updatedHolding);
            
            log.info("Successfully updated holding with ID: {}", updatedHolding.getId());
            return updatedHoldingDTO;
            
        } catch (Exception e) {
            log.error("Error updating holding with ID {}: {}", holdingDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update holding", e);
        }
    }

    /**
     * Converts Holding entity to HoldingDTO
     * 
     * @param holding Holding entity
     * @return HoldingDTO
     */
    private HoldingDTO convertToDTO(Holding holding) {
        log.debug("Converting Holding entity to DTO for ID: {}", holding.getId());
        
        HoldingDTO dto = new HoldingDTO();
        dto.setId(holding.getId());
        dto.setUnits(holding.getUnits());
        dto.setInvestedAmount(holding.getInvestedAmount());
        dto.setCurrentValue(holding.getCurrentValue());
        dto.setOrderAllocationPercentage(holding.getOrderAllocationPercentage());
        
        // Set related entity IDs if available
        if (holding.getOrder() != null) {
            dto.setOrderId(holding.getOrder().getId());
        }
        
        if (holding.getGoal() != null) {
            dto.setGoalId(holding.getGoal().getId());
        }
        
        if (holding.getFund() != null) {
            dto.setFundId(holding.getFund().getId());
        }
        
        if (holding.getUser() != null) {
            dto.setUserId(holding.getUser().getId());
        }
        
        if (holding.getChild() != null) {
            dto.setChildId(holding.getChild().getId());
        }
        
        return dto;
    }

    /**
     * Converts HoldingDTO to Holding entity
     * 
     * @param holdingDTO HoldingDTO
     * @return Holding entity
     */
    private Holding convertToEntity(HoldingDTO holdingDTO) {
        log.debug("Converting HoldingDTO to entity for ID: {}", holdingDTO.getId());
        
        Holding holding = new Holding();
        holding.setId(holdingDTO.getId());
        holding.setUnits(holdingDTO.getUnits());
        holding.setInvestedAmount(holdingDTO.getInvestedAmount());
        holding.setCurrentValue(holdingDTO.getCurrentValue());
        holding.setOrderAllocationPercentage(holdingDTO.getOrderAllocationPercentage());
        
        return holding;
    }
}
