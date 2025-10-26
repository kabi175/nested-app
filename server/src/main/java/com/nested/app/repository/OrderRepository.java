package com.nested.app.repository;

import com.nested.app.entity.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Order entity
 * Provides data access methods for order-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find orders by goal ID
     * 
     * @param goalId Goal ID
     * @return List of orders for the specified goal
     */
    List<Order> findByGoalId(Long goalId);

  List<Order> findByPaymentId(Long paymentId);
}
