package com.nested.app.repository;

import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SIPOrderRepository extends JpaRepository<SIPOrder, Long> {
  List<SIPOrder> findByIsActiveTrueAndScheduleStatus(ScheduleStatus status);

  List<SIPOrder> findByScheduleStatus(ScheduleStatus status);

  List<SIPOrder> findByScheduleStatusAndNextRunDateLessThanEqual(
      ScheduleStatus status, LocalDate date);
}
