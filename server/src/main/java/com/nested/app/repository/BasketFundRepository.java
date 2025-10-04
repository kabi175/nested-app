package com.nested.app.repository;

import com.nested.app.entity.BasketFund;
import com.nested.app.entity.BasketFundId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for BasketFund entity Provides data access methods for basket fund-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface BasketFundRepository extends JpaRepository<BasketFund, BasketFundId> {

  /**
   * Find basket funds by basket ID
   *
   * @param basketId Basket ID
   * @return List of basket funds for the specified basket
   */
  List<BasketFund> findByBasketId(Long basketId);

  /**
   * Find basket funds by fund ID
   *
   * @param fundId Fund ID
   * @return List of basket funds for the specified fund
   */
  List<BasketFund> findByFundId(Long fundId);

  /**
   * Delete all basket funds for a specific basket
   *
   * @param basketId Basket ID
   */
  @Modifying
  @Query("DELETE FROM BasketFund bf WHERE bf.basket.id = :basketId")
  void deleteByBasketId(@Param("basketId") Long basketId);

  /**
   * Check if a basket fund exists for a specific basket and fund
   *
   * @param basketId Basket ID
   * @param fundId Fund ID
   * @return true if exists, false otherwise
   */
  boolean existsByBasketIdAndFundId(Long basketId, Long fundId);
}
