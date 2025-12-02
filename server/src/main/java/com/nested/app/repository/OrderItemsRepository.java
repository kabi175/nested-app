package com.nested.app.repository;

import com.nested.app.entity.OrderItems;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
