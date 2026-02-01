package com.nested.app.repository;

import com.nested.app.dto.OrderAllocationProjection;
import com.nested.app.entity.OrderItems;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {

  List<OrderItems> findByRef(String ref);

  @Query(
      value =
          "SELECT oi.* FROM order_items oi JOIN orders o ON o.id = oi"
              + ".order_id WHERE o.dtype = 'SIP' and oi.status in :statuses",
      countQuery =
          "SELECT count(*) FROM order_items oi JOIN orders o ON o.id = oi"
              + ".order_id WHERE o.dtype = 'SIP' and oi.status in :statuses",
      nativeQuery = true)
  Page<OrderItems> findAllSipOrderItems(@Param("statuses") List<String> statuses, Pageable pageable);

  @Query(
      value =
          "SELECT f.name AS fundName, "
              + "ROUND(CAST(SUM(oi.amount) * 100.0 / total.sum AS NUMERIC), 1) AS allocationPercent "
              + "FROM order_items oi "
              + "JOIN funds f ON f.id = oi.fund_id "
              + "CROSS JOIN (SELECT SUM(oi2.amount) AS sum FROM order_items oi2 "
              + "WHERE oi2.order_id IN :orderIds AND oi2.user_id = :userId) AS total "
              + "WHERE oi.order_id IN :orderIds AND oi.user_id = :userId "
              + "GROUP BY f.name, total.sum",
      nativeQuery = true)
  List<OrderAllocationProjection> findAllocationByOrderIds(
      @Param("orderIds") List<Long> orderIds, @Param("userId") Long userId);

  /**
   * Sums the amount of SIP order items for a given goal where status is COMPLETED or IN_PROGRESS.
   *
   * @param goalId the goal ID
   * @param statuses list of status values (e.g., "completed", "in_progress")
   * @return sum of amounts, or null if no matching items
   */
  @Query(
      value =
          "SELECT COALESCE(SUM(oi.amount), 0) FROM order_items oi "
              + "JOIN orders o ON o.id = oi.order_id "
              + "WHERE o.goal_id = :goalId "
              + "AND o.dtype = 'SIP' "
              + "AND oi.status IN :statuses",
      nativeQuery = true)
  Double sumSipOrderItemsAmountByGoalIdAndStatuses(
      @Param("goalId") Long goalId, @Param("statuses") List<String> statuses);
}
