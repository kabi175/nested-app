package com.nested.app.repository;

import com.nested.app.entity.OrderItems;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {

  List<OrderItems> findByRef(String ref);

  @Query("SELECT oi FROM OrderItems oi WHERE oi.order.dtype = 'SIP'")
  List<OrderItems> findAllSipOrderItems();
}
