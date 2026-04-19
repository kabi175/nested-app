package com.nested.app.services;

import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.repository.SIPOrderRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reconciles RUNNING SIPOrders whose tracker jobs failed to advance them. Runs as a safety net
 * before the dispatcher job each day.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SipCycleReconcilerService {
  private final SIPOrderRepository sipOrderRepository;

  @Transactional
  public void advanceStuckCycles() {
    List<SIPOrder> runningSips = sipOrderRepository.findByScheduleStatus(ScheduleStatus.RUNNING);
    log.debug("Reconciler: {} RUNNING SIP orders to check for stuck cycles", runningSips.size());

    List<SIPOrder> changed = new ArrayList<>();
    for (SIPOrder sip : runningSips) {
      boolean allTerminal =
          sip.getItems().stream()
              .allMatch(
                  item ->
                      item.getStatus() == TransactionStatus.COMPLETED
                          || item.getStatus() == TransactionStatus.FAILED);

      if (!allTerminal) {
        log.debug("SIPOrder id={} still has in-progress items, skipping", sip.getId());
        continue;
      }

      LocalDate next = computeNextRunDate(sip);
      if (next.isAfter(sip.getEndDate())) {
        sip.setScheduleStatus(ScheduleStatus.COMPLETED);
        log.info("SIPOrder id={} completed — next {} is past endDate {}", sip.getId(), next, sip.getEndDate());
      } else {
        sip.setNextRunDate(next);
        sip.setScheduleStatus(ScheduleStatus.ACTIVE);
        log.info("SIPOrder id={} advanced nextRunDate to {} (stuck-cycle fallback)", sip.getId(), next);
      }
      changed.add(sip);
    }

    if (!changed.isEmpty()) {
      sipOrderRepository.saveAll(changed);
    }
  }

  LocalDate computeNextRunDate(SIPOrder order) {
    LocalDate candidate = order.getNextRunDate().plusMonths(1);
    int targetDay = order.getStartDate().getDayOfMonth();
    int length = candidate.lengthOfMonth();
    if (targetDay > length) targetDay = length;
    return LocalDate.of(candidate.getYear(), candidate.getMonth(), targetDay);
  }
}
