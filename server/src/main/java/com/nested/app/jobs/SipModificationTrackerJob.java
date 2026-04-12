package com.nested.app.jobs;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.entity.SipModification;
import com.nested.app.entity.SipModification.Status;
import com.nested.app.entity.SipModificationItem;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.SIPOrderRepository;
import com.nested.app.repository.SipModificationItemRepository;
import com.nested.app.repository.SipModificationRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Component;

/**
 * Quartz job that polls FP plan states for a pending SipModification.
 *
 * <p>Runs every 6 hours. Lifecycle:
 * <ol>
 *   <li>PENDING items: poll plan state; if review_completed → batch confirm all at once.</li>
 *   <li>CONFIRMING items: poll plan state; if active → sync amount to OrderItem; if
 *       failed/cancelled → mark FAILED.</li>
 *   <li>All items terminal → reconcile SIPOrder.amount, update modification status, delete job.</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipModificationTrackerJob implements Job {

  private final SipModificationRepository sipModificationRepository;
  private final SipModificationItemRepository sipModificationItemRepository;
  private final OrderItemsRepository orderItemsRepository;
  private final SIPOrderRepository sipOrderRepository;
  private final SipOrderApiClient sipOrderApiClient;
  private final Scheduler scheduler;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    Long modificationId = context.getMergedJobDataMap().getLong("sipModificationId");
    log.info("SipModificationTrackerJob executing for modificationId={}", modificationId);

    SipModification modification = sipModificationRepository.findById(modificationId).orElse(null);
    if (modification == null) {
      log.warn("SipModification id={} not found — deleting job", modificationId);
      deleteJob(context);
      return;
    }

    Status status = modification.getStatus();
    if (status != Status.PENDING && status != Status.CONFIRMING) {
      log.info("SipModification id={} already in terminal state {}, deleting job", modificationId, status);
      deleteJob(context);
      return;
    }

    List<SipModificationItem> items = sipModificationItemRepository.findByModification(modification);

    // --- Step 1: Poll PENDING items; batch-confirm those that reached review_completed ---
    var toConfirm = items.stream()
        .filter(i -> i.getStatus() == SipModificationItem.Status.PENDING)
        .filter(i -> {
          try {
            var detail = sipOrderApiClient.fetchSipOrderDetail(i.getOrderItem().getRef()).block();
            return detail != null && detail.getState() == SipOrderDetail.OrderState.REVIEW_COMPLETED;
          } catch (Exception e) {
            log.warn("Error polling plan state for item id={}: {}", i.getId(), e.getMessage());
            return false;
          }
        })
        .collect(Collectors.toList());

    if (!toConfirm.isEmpty()) {
      try {
        var confirmPayload = toConfirm.stream()
            .map(i -> {
              Map<String, Object> p = new java.util.HashMap<>();
              p.put("id", i.getOrderItem().getRef());
              p.put("state", "confirmed");
              return p;
            })
            .collect(Collectors.toList());
        sipOrderApiClient.updatePurchasePlanAmounts(confirmPayload).block();

        toConfirm.forEach(i -> i.setStatus(SipModificationItem.Status.CONFIRMING));
        sipModificationItemRepository.saveAll(toConfirm);
        log.info("Confirmed {} plans for modificationId={}", toConfirm.size(), modificationId);
      } catch (Exception e) {
        log.warn("Error sending batch confirm for modificationId={}: {}", modificationId, e.getMessage());
      }
    }

    // Update modification to CONFIRMING if all PENDING items are now CONFIRMING
    items = sipModificationItemRepository.findByModification(modification);
    boolean anyStillPending = items.stream().anyMatch(i -> i.getStatus() == SipModificationItem.Status.PENDING);
    boolean anyConfirming = items.stream().anyMatch(i -> i.getStatus() == SipModificationItem.Status.CONFIRMING);
    if (!anyStillPending && anyConfirming && modification.getStatus() == Status.PENDING) {
      modification.setStatus(Status.CONFIRMING);
      sipModificationRepository.save(modification);
    }

    // --- Step 2: Poll CONFIRMING items; sync active state ---
    var confirmingItems = items.stream()
        .filter(i -> i.getStatus() == SipModificationItem.Status.CONFIRMING)
        .collect(Collectors.toList());

    for (var item : confirmingItems) {
      try {
        var detail = sipOrderApiClient.fetchSipOrderDetail(item.getOrderItem().getRef()).block();
        if (detail == null) continue;
        switch (detail.getState()) {
          case ACTIVE -> {
            var orderItem = item.getOrderItem();
            orderItem.setAmount(item.getNewAmount());
            orderItemsRepository.save(orderItem);
            item.setStatus(SipModificationItem.Status.COMPLETED);
            sipModificationItemRepository.save(item);
            log.info("OrderItem id={} amount synced to {}", orderItem.getId(), item.getNewAmount());
          }
          case FAILED, CANCELLED -> {
            item.setStatus(SipModificationItem.Status.FAILED);
            sipModificationItemRepository.save(item);
            log.warn("Plan for item id={} reached terminal failure state: {}", item.getId(), detail.getState());
          }
          default -> log.debug("Plan for item id={} still in state {}", item.getId(), detail.getState());
        }
      } catch (Exception e) {
        log.warn("Error polling CONFIRMING item id={}: {}", item.getId(), e.getMessage());
      }
    }

    // --- Step 3: Check if all items are terminal ---
    items = sipModificationItemRepository.findByModification(modification);
    boolean anyNonTerminal = items.stream().anyMatch(i ->
        i.getStatus() == SipModificationItem.Status.PENDING
            || i.getStatus() == SipModificationItem.Status.CONFIRMING);

    if (anyNonTerminal) {
      log.info("SipModification id={} still has non-terminal items, will retry later", modificationId);
      return;
    }

    reconcileModification(modification, items);
    deleteJob(context);
  }

  private void reconcileModification(SipModification modification, List<SipModificationItem> items) {
    double newTotal = 0;
    for (SipModificationItem mi : items) {
      // Amount was already synced to orderItem for COMPLETED items; reload actual amount
      newTotal += mi.getOrderItem().getAmount();
    }

    var sipOrder = modification.getSipOrder();
    sipOrder.setAmount(newTotal);
    sipOrderRepository.save(sipOrder);

    boolean anyFailed = items.stream().anyMatch(i -> i.getStatus() == SipModificationItem.Status.FAILED);
    modification.setStatus(anyFailed ? Status.FAILED : Status.COMPLETED);
    sipModificationRepository.save(modification);

    log.info("SipModification id={} resolved as {}. SIPOrder id={} amount updated to {}",
        modification.getId(), modification.getStatus(), sipOrder.getId(), newTotal);
  }

  private void deleteJob(JobExecutionContext context) {
    JobKey key = context.getJobDetail().getKey();
    try {
      scheduler.deleteJob(key);
      log.info("SipModificationTrackerJob deleted: {}", key);
    } catch (SchedulerException e) {
      log.warn("Failed to delete SipModificationTrackerJob {}: {}", key, e.getMessage());
    }
  }
}
