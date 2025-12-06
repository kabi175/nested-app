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
              + ".order_id WHERE o.dtype = 'SIP'",
      countQuery =
          "SELECT count(*) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.dtype = 'SIP'",
      nativeQuery = true)
  Page<OrderItems> findAllSipOrderItems(Pageable pageable);

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
}
