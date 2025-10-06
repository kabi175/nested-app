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
    
    /**
     * Find orders by user ID
     * 
     * @param userId User ID
     * @return List of orders for the specified user
     */
    List<Order> findByUserId(Long userId);
    
    /**
     * Find orders by fund ID
     * 
     * @param fundId Fund ID
     * @return List of orders for the specified fund
     */
    List<Order> findByFundId(Long fundId);
    
    /**
     * Find orders by status
     * 
     * @param status Order status
     * @return List of orders with the specified status
     */
    List<Order> findByStatus(String status);

    /**
     * Find orders by folio number
     * 
     * @param folio Folio number
     * @return List of orders with the specified folio
     */
    List<Order> findByFolio(String folio);
    
    /**
     * Find orders with amount greater than the specified amount
     * 
     * @param amount Minimum amount threshold
     * @return List of orders with amount greater than the threshold
     */
    List<Order> findByAmountGreaterThan(Double amount);
    
    /**
     * Find SIP orders (monthly SIP amount is not null)
     * 
     * @return List of SIP orders
     */
    List<Order> findByMonthlySipIsNotNull();
}
