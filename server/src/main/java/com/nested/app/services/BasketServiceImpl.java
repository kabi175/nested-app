package com.nested.app.services;

import com.nested.app.dto.BasketDTO;
import com.nested.app.dto.FundDTO;
import com.nested.app.entity.Basket;
import com.nested.app.repository.BasketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service implementation for managing Basket entities
 * Provides business logic for basket-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BasketServiceImpl implements BasketService {

    private final BasketRepository basketRepository;

    /**
     * Retrieves a basket by its ID
     * 
     * @param id Basket ID
     * @return Basket data or null if not found
     */
    @Override
    @Transactional(readOnly = true)
    public BasketDTO getBasketById(String id) {
        log.info("Retrieving basket with ID: {}", id);
        
        try {
            Optional<Basket> basketOpt = basketRepository.findById(Long.valueOf(id));
            
            if (basketOpt.isEmpty()) {
                log.warn("Basket not found with ID: {}", id);
                return null;
            }
            
            BasketDTO basketDTO = convertToDTO(basketOpt.get());
            log.info("Successfully retrieved basket with ID: {}", id);
            return basketDTO;
            
        } catch (NumberFormatException e) {
            log.error("Invalid basket ID format: {}", id);
            throw new IllegalArgumentException("Invalid basket ID format: " + id);
        } catch (Exception e) {
            log.error("Error retrieving basket with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve basket", e);
        }
    }
    
    /**
     * Retrieves all baskets
     * 
     * @return List of all baskets
     */
    @Override
    @Transactional(readOnly = true)
    public List<BasketDTO> getAllBaskets() {
        log.info("Retrieving all baskets from database");
        
        try {
            List<Basket> baskets = basketRepository.findAll();
            List<BasketDTO> basketDTOs = baskets.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} baskets", basketDTOs.size());
            return basketDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving all baskets: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve baskets", e);
        }
    }
    
    /**
     * Creates a new basket
     * 
     * @param basketDTO Basket data to create
     * @return Created basket data
     */
    @Override
    public BasketDTO createBasket(BasketDTO basketDTO) {
        log.info("Creating new basket with title: {}", basketDTO.getTitle());
        
        try {
            Basket basket = convertToEntity(basketDTO);
            Basket savedBasket = basketRepository.save(basket);
            BasketDTO savedBasketDTO = convertToDTO(savedBasket);
            
            log.info("Successfully created basket with ID: {}", savedBasket.getId());
            return savedBasketDTO;
            
        } catch (Exception e) {
            log.error("Error creating basket: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create basket", e);
        }
    }
    
    /**
     * Updates an existing basket
     * 
     * @param basketDTO Basket data to update
     * @return Updated basket data
     */
    @Override
    public BasketDTO updateBasket(BasketDTO basketDTO) {
        log.info("Updating basket with ID: {}", basketDTO.getId());
        
        try {
            if (basketDTO.getId() == null) {
                throw new IllegalArgumentException("Basket ID cannot be null for update operation");
            }
            
            Basket existingBasket = basketRepository.findById(basketDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Basket not found with ID: " + basketDTO.getId()));
            
            // Update fields
            existingBasket.setTitle(basketDTO.getTitle());
            // Note: BasketFunds would be updated separately through dedicated methods
            
            Basket updatedBasket = basketRepository.save(existingBasket);
            BasketDTO updatedBasketDTO = convertToDTO(updatedBasket);
            
            log.info("Successfully updated basket with ID: {}", updatedBasket.getId());
            return updatedBasketDTO;
            
        } catch (Exception e) {
            log.error("Error updating basket with ID {}: {}", basketDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update basket", e);
        }
    }

    /**
     * Converts Basket entity to BasketDTO
     * 
     * @param basket Basket entity
     * @return BasketDTO
     */
    private BasketDTO convertToDTO(Basket basket) {
        log.debug("Converting Basket entity to DTO for ID: {}", basket.getId());
        
        BasketDTO dto = new BasketDTO();
        dto.setId(basket.getId());
        dto.setTitle(basket.getTitle());
        
        // Convert basket funds if available
        if (basket.getBasketFunds() != null && !basket.getBasketFunds().isEmpty()) {
            dto.setFunds(basket.getBasketFunds().stream()
                    .map(basketFund -> {
                        BasketDTO.BasketFundDTO fundDTO = new BasketDTO.BasketFundDTO();
                        if (basketFund.getFund() != null) {
                            fundDTO.setFund(convertFundToDTO(basketFund.getFund()));
                        }
                        fundDTO.setAllocationPercentage(basketFund.getAllocationPercentage());
                        return fundDTO;
                    })
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    /**
     * Converts Fund entity to FundDTO for basket
     * 
     * @param fund Fund entity
     * @return FundDTO
     */
    private FundDTO convertFundToDTO(com.nested.app.entity.Fund fund) {
        FundDTO fundDTO = new FundDTO();
        fundDTO.setId(String.valueOf(fund.getId()));
        fundDTO.setCode(fund.getLabel());
        fundDTO.setName(fund.getName());
        fundDTO.setDisplayName(fund.getName());
        fundDTO.setDescription(fund.getDescription());
        fundDTO.setMinAmount(fund.getMimPurchaseAmount());
        fundDTO.setNav(fund.getNav());
        fundDTO.setActive(fund.isActive());
        return fundDTO;
    }

    /**
     * Converts BasketDTO to Basket entity
     * 
     * @param basketDTO BasketDTO
     * @return Basket entity
     */
    private Basket convertToEntity(BasketDTO basketDTO) {
        log.debug("Converting BasketDTO to entity for title: {}", basketDTO.getTitle());
        
        Basket basket = new Basket();
        basket.setId(basketDTO.getId());
        basket.setTitle(basketDTO.getTitle());
        
        // Note: BasketFunds would be set separately through dedicated methods
        // to maintain proper entity relationships
        
        return basket;
    }
}
