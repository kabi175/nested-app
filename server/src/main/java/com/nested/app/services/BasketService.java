package com.nested.app.services;

import com.nested.app.dto.BasketDTO;
import java.util.List;

/**
 * Service interface for managing Basket entities
 * Provides business logic for basket-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface BasketService {
    
    /**
     * Retrieves a basket by its ID
     * 
     * @param id Basket ID
     * @return Basket data or null if not found
     */
    BasketDTO getBasketById(String id);
    
    /**
     * Retrieves all baskets
     * 
     * @return List of all baskets
     */
    List<BasketDTO> getAllBaskets();
    
    /**
     * Creates a new basket
     * 
     * @param basketDTO Basket data to create
     * @return Created basket data
     */
    BasketDTO createBasket(BasketDTO basketDTO);
    
    /**
     * Updates an existing basket
     * 
     * @param basketDTO Basket data to update
     * @return Updated basket data
     */
    BasketDTO updateBasket(BasketDTO basketDTO);

  /**
   * Deletes a basket
   *
   * @param basketDTO Basket data to delete
   * @return Deleted basket data
   */
  BasketDTO deleteBasket(BasketDTO basketDTO);

  /**
   * Creates multiple baskets
   *
   * @param baskets List of basket data to create
   * @return List of created baskets
   */
  List<BasketDTO> createBaskets(List<BasketDTO> baskets);

  /**
   * Updates multiple baskets
   *
   * @param baskets List of basket data to update
   * @return List of updated baskets
   */
  List<BasketDTO> updateBaskets(List<BasketDTO> baskets);

  /**
   * Deletes multiple baskets
   *
   * @param baskets List of basket data to delete
   * @return List of deleted baskets
   */
  List<BasketDTO> deleteBaskets(List<BasketDTO> baskets);
}
