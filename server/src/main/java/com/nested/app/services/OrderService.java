package com.nested.app.services;

import com.nested.app.dto.OrderDTO;
import java.util.List;

public interface OrderService {
  List<OrderDTO> getOrdersByGoal(String goalId);

  List<OrderDTO> createOrdersForGoal(String goalId, List<OrderDTO> orders);
}
