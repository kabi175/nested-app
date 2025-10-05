package com.nested.app.repository;

import com.nested.app.entity.Basket;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Basket entity
 * Provides data access methods for basket-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface BasketRepository extends JpaRepository<Basket, Long> {
    
    /**
     * Find baskets by title
     * 
     * @param title Basket title
     * @return List of baskets with the specified title
     */
    List<Basket> findByTitle(String title);
    
    /**
     * Find baskets by title containing the given text
     * 
     * @param title Title text to search for
     * @return List of baskets with titles containing the specified text
     */
    List<Basket> findByTitleContaining(String title);
    
    /**
     * Find baskets by title ignoring case
     * 
     * @param title Basket title (case insensitive)
     * @return List of baskets with the specified title (case insensitive)
     */
    List<Basket> findByTitleIgnoreCase(String title);

  /**
   * Find the basket with returns closest to the given expectedFee
   *
   * @param expectedFee the expected fee to compare
   * @return Basket with returns closest to expectedFee
   */
  @org.springframework.data.jpa.repository.Query(
      "SELECT b FROM Basket b ORDER BY ABS(b.returns - :expectedFee) ASC LIMIT 1")
  Optional<Basket> findClosestByReturns(
      @org.springframework.data.repository.query.Param("expectedFee") Double expectedFee);

  Basket findFirstByOrderByReturnsDesc();
}
