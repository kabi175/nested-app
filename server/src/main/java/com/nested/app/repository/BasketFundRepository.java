package com.nested.app.repository;

import com.nested.app.entity.BasketFund;
import com.nested.app.entity.BasketFundId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
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

}
