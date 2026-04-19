package com.nested.app.services;

import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import com.nested.app.enums.TransactionStatus;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SipCycleReconcilerProcessor implements ItemProcessor<SIPOrder, SIPOrder> {

  @Override
  public SIPOrder process(SIPOrder sip) {
    boolean allTerminal =
        sip.getItems().stream()
            .allMatch(
                item ->
                    item.getStatus() == TransactionStatus.COMPLETED
                        || item.getStatus() == TransactionStatus.FAILED);

    if (!allTerminal) {
      log.debug("SIPOrder id={} still has in-progress items, skipping", sip.getId());
      return null;
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
    return sip;
  }

  LocalDate computeNextRunDate(SIPOrder order) {
    LocalDate candidate = order.getNextRunDate().plusMonths(1);
    int targetDay = order.getStartDate().getDayOfMonth();
    int length = candidate.lengthOfMonth();
    if (targetDay > length) targetDay = length;
    return LocalDate.of(candidate.getYear(), candidate.getMonth(), targetDay);
  }
}
