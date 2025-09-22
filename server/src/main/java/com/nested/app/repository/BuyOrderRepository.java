package com.nested.app.repository;

import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuyOrderRepository extends JpaRepository<BuyOrder, Long> {
    boolean existsByFund(Fund fund);
}
