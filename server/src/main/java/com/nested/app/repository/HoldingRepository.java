package com.nested.app.repository;

import com.nested.app.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Holding entity
 * Provides data access methods for holding-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    
    /**
     * Find holdings by goal ID
     * 
     * @param goalId Goal ID
     * @return List of holdings for the specified goal
     */
    List<Holding> findByGoalId(Long goalId);
    
    /**
     * Find holdings by user ID
     * 
     * @param userId User ID
     * @return List of holdings for the specified user
     */
    List<Holding> findByUserId(Long userId);
    
    /**
     * Find holdings by child ID
     * 
     * @param childId Child ID
     * @return List of holdings for the specified child
     */
    List<Holding> findByChildId(Long childId);
    
    /**
     * Find holdings by fund ID
     * 
     * @param fundId Fund ID
     * @return List of holdings for the specified fund
     */
    List<Holding> findByFundId(Long fundId);
    
    /**
     * Find holdings by order ID
     * 
     * @param orderId Order ID
     * @return List of holdings for the specified order
     */
    List<Holding> findByOrderId(Long orderId);
    
    /**
     * Find holdings with units greater than the specified amount
     * 
     * @param units Minimum units threshold
     * @return List of holdings with units greater than the threshold
     */
    List<Holding> findByUnitsGreaterThan(Double units);
    
    /**
     * Find holdings with current value greater than the specified amount
     * 
     * @param currentValue Minimum current value threshold
     * @return List of holdings with current value greater than the threshold
     */
    List<Holding> findByCurrentValueGreaterThan(Double currentValue);
}
