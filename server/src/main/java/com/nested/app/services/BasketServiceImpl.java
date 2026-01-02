package com.nested.app.services;

import com.nested.app.dto.BasketDTO;
import com.nested.app.dto.FundDTO;
import com.nested.app.entity.Basket;
import com.nested.app.entity.BasketFund;
import com.nested.app.entity.Fund;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.repository.BasketFundRepository;
import com.nested.app.repository.BasketRepository;
import com.nested.app.repository.FundRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing Basket entities Provides business logic for basket-related
 * operations
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
  private final BasketFundRepository basketFundRepository;
  private final FundRepository fundRepository;

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
      throw new ExternalServiceException("Failed to retrieve basket", e);
    }
  }

  /**
   * Retrieves a basket by its name (title)
   *
   * @param name Basket name (title)
   * @return Basket data or null if not found
   */
  @Override
  @Transactional(readOnly = true)
  public BasketDTO getBasketByName(String name) {
    log.info("Retrieving basket with name: {}", name);

    try {
      List<Basket> baskets = basketRepository.findByTitle(name);

      if (baskets.isEmpty()) {
        log.warn("Basket not found with name: {}", name);
        return null;
      }

      if (baskets.size() > 1) {
        log.warn("Multiple baskets found with name '{}', returning the first one", name);
      }

      BasketDTO basketDTO = convertToDTO(baskets.get(0));
      log.info("Successfully retrieved basket with name: {}", name);
      return basketDTO;

    } catch (Exception e) {
      log.error("Error retrieving basket with name {}: {}", name, e.getMessage(), e);
      throw new ExternalServiceException("Failed to retrieve basket", e);
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
      List<BasketDTO> basketDTOs = baskets.stream().map(this::convertToDTO).toList();

      log.info("Successfully retrieved {} baskets", basketDTOs.size());
      return basketDTOs;

    } catch (Exception e) {
      log.error("Error retrieving all baskets: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to retrieve baskets", e);
    }
  }

  /**
   * Creates a new basket
   *
   * @param basketDTO Basket data to create
   * @return Created basket data
   */
  @Override
  @Transactional
  public BasketDTO createBasket(BasketDTO basketDTO) {
    log.info("Creating new basket with title: {}", basketDTO.getTitle());

    try {
      // Check if basket with same title already exists
      List<Basket> existingBaskets = basketRepository.findByTitle(basketDTO.getTitle());
      if (!existingBaskets.isEmpty()) {
        throw new IllegalArgumentException(
            "A basket with the title '" + basketDTO.getTitle() + "' already exists");
      }

      // Validate allocation percentages
      validateAllocationPercentages(basketDTO.getFunds());

      Basket basket = convertToEntity(basketDTO);
      Basket savedBasket = basketRepository.save(basket);

      // Save basket funds if provided
      if (basketDTO.getFunds() != null && !basketDTO.getFunds().isEmpty()) {
        saveBasketFunds(savedBasket, basketDTO.getFunds());
      }

      BasketDTO savedBasketDTO = convertToDTO(savedBasket);

      log.info("Successfully created basket with ID: {}", savedBasket.getId());
      return savedBasketDTO;

    } catch (Exception e) {
      log.error("Error creating basket: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to create basket", e);
    }
  }

  /**
   * Updates an existing basket
   *
   * @param basketDTO Basket data to update
   * @return Updated basket data
   */
  @Override
  @Transactional
  public BasketDTO updateBasket(BasketDTO basketDTO) {
    log.info("Updating basket with ID: {}", basketDTO.getId());

    try {
      if (basketDTO.getId() == null) {
        throw new IllegalArgumentException("Basket ID cannot be null for update operation");
      }

      Basket existingBasket =
          basketRepository
              .findById(basketDTO.getId())
              .orElseThrow(
                  () -> new RuntimeException("Basket not found with ID: " + basketDTO.getId()));

      // Check if title is being changed to a title that already exists
      if (!existingBasket.getTitle().equals(basketDTO.getTitle())) {
        List<Basket> basketsWithSameTitle = basketRepository.findByTitle(basketDTO.getTitle());
        if (!basketsWithSameTitle.isEmpty()) {
          throw new IllegalArgumentException(
              "A basket with the title '" + basketDTO.getTitle() + "' already exists");
        }
      }

      // Validate allocation percentages if funds are provided
      if (basketDTO.getFunds() != null && !basketDTO.getFunds().isEmpty()) {
        validateAllocationPercentages(basketDTO.getFunds());
      }

      // Update fields
      existingBasket.setTitle(basketDTO.getTitle());
      existingBasket.setYears(basketDTO.getYears()); // Update years (can be null)

      Basket updatedBasket = basketRepository.save(existingBasket);

      // Update basket funds if provided
      if (basketDTO.getFunds() != null && !basketDTO.getFunds().isEmpty()) {
        updateBasketFunds(updatedBasket, basketDTO.getFunds());
      }

      BasketDTO updatedBasketDTO = convertToDTO(updatedBasket);

      log.info("Successfully updated basket with ID: {}", updatedBasket.getId());
      return updatedBasketDTO;

    } catch (Exception e) {
      log.error("Error updating basket with ID {}: {}", basketDTO.getId(), e.getMessage(), e);
      throw new ExternalServiceException("Failed to update basket", e);
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
    dto.setYears(basket.getYears());

    // Convert basket funds if available
    if (basket.getBasketFunds() != null && !basket.getBasketFunds().isEmpty()) {
      dto.setFunds(
          basket.getBasketFunds().stream()
              .map(
                  basketFund -> {
                    BasketDTO.BasketFundDTO fundDTO = new BasketDTO.BasketFundDTO();
                    if (basketFund.getFund() != null) {
                      fundDTO.setFundId(basketFund.getFund().getId());
                      fundDTO.setName(basketFund.getFund().getLabel());
                    }
                    fundDTO.setAllocationPercentage(basketFund.getAllocationPercentage());
                    return fundDTO;
                  })
              .toList());
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
   * Deletes a basket
   *
   * @param basketDTO Basket data to delete
   * @return Deleted basket data
   */
  @Override
  @Transactional
  public BasketDTO deleteBasket(BasketDTO basketDTO) {
    log.info("Deleting basket with ID: {}", basketDTO.getId());

    try {
      if (basketDTO.getId() == null) {
        throw new IllegalArgumentException("Basket ID cannot be null for delete operation");
      }

      Basket existingBasket =
          basketRepository
              .findById(basketDTO.getId())
              .orElseThrow(
                  () -> new RuntimeException("Basket not found with ID: " + basketDTO.getId()));

      basketRepository.delete(existingBasket);
      BasketDTO deletedBasketDTO = convertToDTO(existingBasket);

      log.info("Successfully deleted basket with ID: {}", basketDTO.getId());
      return deletedBasketDTO;

    } catch (Exception e) {
      log.error("Error deleting basket with ID {}: {}", basketDTO.getId(), e.getMessage(), e);
      throw new ExternalServiceException("Failed to delete basket", e);
    }
  }

  /**
   * Deletes multiple baskets
   *
   * @param baskets List of basket data to delete
   * @return List of deleted baskets
   */
  @Override
  @Transactional
  public List<BasketDTO> deleteBaskets(List<BasketDTO> baskets) {
    log.info("Deleting {} baskets", baskets.size());

    try {
      List<BasketDTO> deletedBaskets = baskets.stream().map(this::deleteBasket).toList();

      log.info("Successfully deleted {} baskets", deletedBaskets.size());
      return deletedBaskets;

    } catch (Exception e) {
      log.error("Error deleting baskets: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to delete baskets", e);
    }
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
    basket.setYears(basketDTO.getYears());

    // Note: BasketFunds would be set separately through dedicated methods
    // to maintain proper entity relationships

    return basket;
  }

  /**
   * Validates that allocation percentages sum to 100%
   *
   * @param funds List of basket fund DTOs
   * @throws IllegalArgumentException if validation fails
   */
  private void validateAllocationPercentages(List<BasketDTO.BasketFundDTO> funds) {
    if (funds == null || funds.isEmpty()) {
      return; // No funds to validate
    }

    double totalPercentage =
        funds.stream()
            .mapToDouble(
                fund ->
                    fund.getAllocationPercentage() != null ? fund.getAllocationPercentage() : 0.0)
            .sum();

    // Allow for small floating point differences
    if (Math.abs(totalPercentage - 100.0) > 0.01) {
      throw new IllegalArgumentException(
          String.format(
              "Total allocation percentage must be 100%%. Current total: %.2f%%", totalPercentage));
    }

    // Validate individual percentages
    for (BasketDTO.BasketFundDTO fund : funds) {
      if (fund.getAllocationPercentage() == null || fund.getAllocationPercentage() < 0) {
        throw new IllegalArgumentException("Allocation percentage must be non-negative");
      }
      if (fund.getAllocationPercentage() > 100) {
        throw new IllegalArgumentException("Individual allocation percentage cannot exceed 100%");
      }
    }
  }

  /**
   * Saves basket funds for a basket
   *
   * @param basket Basket entity
   * @param funds List of basket fund DTOs
   */
  private void saveBasketFunds(Basket basket, List<BasketDTO.BasketFundDTO> funds) {
    log.debug("Saving {} basket funds for basket ID: {}", funds.size(), basket.getId());

    for (BasketDTO.BasketFundDTO fundDTO : funds) {
      if (fundDTO.getFundId() == null) {
        throw new IllegalArgumentException("Fund ID is required for basket fund");
      }

      Optional<Fund> fundOpt = fundRepository.findById(fundDTO.getFundId());
      if (fundOpt.isEmpty()) {
        throw new IllegalArgumentException("Fund not found with ID: " + fundDTO.getFundId());
      }

      BasketFund basketFund = new BasketFund();
      basketFund.setBasket(basket);
      basketFund.setFund(fundOpt.get());
      basketFund.setAllocationPercentage(fundDTO.getAllocationPercentage());

      basketFundRepository.save(basketFund);
    }
  }

  /**
   * Updates basket funds for a basket (replaces existing funds)
   *
   * @param basket Basket entity
   * @param funds List of basket fund DTOs
   */
  private void updateBasketFunds(Basket basket, List<BasketDTO.BasketFundDTO> funds) {
    log.debug("Updating basket funds for basket ID: {}", basket.getId());

    // Delete existing basket funds
    // SECURITY FIX: Load entities first then delete (entity-based delete)
    // Note: Basket doesn't have user_id filter, so this is typically admin-only operation
    List<BasketFund> existingBasketFunds = basketFundRepository.findByBasketId(basket.getId());
    if (!existingBasketFunds.isEmpty()) {
      basketFundRepository.deleteAll(existingBasketFunds);
    }

    // Save new basket funds
    saveBasketFunds(basket, funds);
  }
}
