package com.nested.app.repository;

import com.nested.app.entity.Basket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
