package com.nested.app.services;

import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.MandateDto;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.dto.OrderAllocationProjection;
import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SipModification;
import com.nested.app.entity.SipModificationItem;
import com.nested.app.entity.User;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.SIPOrderRepository;
import com.nested.app.repository.SipModificationItemRepository;
import com.nested.app.repository.SipModificationRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service for managing OrderItems operations Provides business logic for retrieving and managing
 * order items
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderItemsService {

  private final OrderItemsRepository orderItemsRepository;
  private final SIPOrderRepository sipOrderRepository;
  private final SipOrderApiClient sipOrderApiClient;
  private final SipOrderSchedulerService sipOrderSchedulerService;
  private final SipModificationRepository sipModificationRepository;
  private final SipModificationItemRepository sipModificationItemRepository;
  private final MandateApiClient mandateApiClient;

  /**
   * Retrieves paginated SIP Order Items
   *
   * @param pageable Pagination information (page number, size, sorting)
   * @return Page of OrderItemsDTO containing SIP order items for the requested page
   */
  public Page<OrderItemsDTO> getSipOrderItems(Pageable pageable, User user) {
    log.info(
        "Fetching SIP Order Items with pagination - Page: {}, Size: {}",
        pageable.getPageNumber(),
        pageable.getPageSize());
    try {
      List<String> statuses =
          List.of(
              TransactionStatus.COMPLETED.name(),
              TransactionStatus.ACTIVE.name(),
              TransactionStatus.FAILED.name(),
              TransactionStatus.ACTIVE.name());
      Page<OrderItemsDTO> sipOrderItems =
          orderItemsRepository
              .findAllSipOrderItems(statuses, user.getId(), pageable)
              .map(OrderItemsDTO::fromEntity);
      log.info(
          "Successfully retrieved {} SIP Order Items (Total: {})",
          sipOrderItems.getContent().size(),
          sipOrderItems.getTotalElements());
      return sipOrderItems;
    } catch (Exception e) {
      log.error("Error retrieving paginated SIP Order Items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve paginated SIP Order Items", e);
    }
  }

  /**
   * Retrieves fund allocation percentages for given orders
   *
   * @param ordersParam Comma-separated list of order IDs
   * @param user Current user context
   * @return List of OrderAllocationProjection containing fund names and allocation percentages
   */
  public List<OrderAllocationProjection> getAllocationByOrders(String ordersParam, User user) {
    log.info("Fetching allocation for orders: {} for user ID: {}", ordersParam, user.getId());

    try {
      // Validate user
      if (user == null) {
        log.warn("No user found in context");
        return Collections.emptyList();
      }

      // Parse order IDs from comma-separated string
      List<Long> orderIds =
          Arrays.stream(ordersParam.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .map(Long::parseLong)
              .collect(Collectors.toList());

      if (orderIds.isEmpty()) {
        log.warn("No valid order IDs provided");
        return Collections.emptyList();
      }

      log.info("Querying allocations for {} orders for user {}", orderIds.size(), user.getId());
      List<OrderAllocationProjection> allocations =
          orderItemsRepository.findAllocationByOrderIds(orderIds, user.getId());

      log.info("Successfully retrieved {} fund allocations", allocations.size());
      return allocations;

    } catch (NumberFormatException e) {
      log.error("Invalid order ID format in: {}", ordersParam, e);
      return Collections.emptyList();
    } catch (Exception e) {
      log.error("Error retrieving allocations: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve order allocations", e);
    }
  }

  public void cancelSipOrder(Long sipOrderId, String cancellationCode, String cancellationReason, User user) {
    log.info("Cancelling SIP order id={} with code={}", sipOrderId, cancellationCode);

    SIPOrder sipOrder =
        sipOrderRepository
            .findById(sipOrderId)
            .orElseThrow(
                () -> new RuntimeException("SIP order not found: " + sipOrderId));

    if (!sipOrder.getUser().getId().equals(user.getId())) {
      throw new SecurityException("Access denied to SIP order: " + sipOrderId);
    }

    var orderItem = orderItemsRepository.findById(sipOrderId).orElseThrow();

    var planDetail = sipOrderApiClient.fetchSipOrderDetail(orderItem.getRef()).block();
    if (planDetail != null
        && planDetail.getState() != SipOrderDetail.OrderState.ACTIVE
        && planDetail.getState() != SipOrderDetail.OrderState.CREATED) {
      log.warn(
          "Skipping provider cancel for planRef={} — already in state={}",
          orderItem.getRef(),
          planDetail.getState());
    } else {
      sipOrderApiClient
          .cancelSipOrder(orderItem.getRef(), cancellationCode, cancellationReason)
          .block();
    }

    orderItem.setStatus(TransactionStatus.CANCELLED);

    // If any sibling items are still mid-cycle (ACTIVE), set ERROR so the scheduler
    // knows resolution is pending. Once all items settle the state becomes PAUSED.
    boolean anyActive = sipOrder.getItems().stream()
        .filter(i -> !i.getId().equals(orderItem.getId()))
        .anyMatch(i -> i.getStatus() == TransactionStatus.ACTIVE);

    if(!anyActive) {
      sipOrder.setScheduleStatus(SIPOrder.ScheduleStatus.COMPLETED);
      sipOrder.setActive(false);
    }

    sipOrderRepository.save(sipOrder);

    orderItemsRepository.save(orderItem);
    sipOrderSchedulerService.scheduleSipTransactionTrackerJob(orderItem, 0);

    log.info("Successfully cancelled SIP order id={}", sipOrderId);
  }

  /**
   * Submits a SIP amount modification.
   *
   * @return null if submitted immediately (HTTP 200), or a mandate_url string if mandate
   *     authorization is required first (HTTP 202).
   */
  @org.springframework.transaction.annotation.Transactional
  public String modifySipOrder(Long sipOrderId, double newTotalAmount, User user) {
    log.info("Modifying SIP order id={} to new amount={}", sipOrderId, newTotalAmount);

    SIPOrder sipOrder =
        sipOrderRepository
            .findById(sipOrderId)
            .orElseThrow(() -> new RuntimeException("SIP order not found: " + sipOrderId));

    if (!sipOrder.getUser().getId().equals(user.getId())) {
      throw new SecurityException("Access denied to SIP order: " + sipOrderId);
    }

    var lockStatuses = List.of(
        SipModification.Status.AWAITING_MANDATE,
        SipModification.Status.PENDING,
        SipModification.Status.CONFIRMING);
    if (sipModificationRepository.existsBySipOrderAndStatusIn(sipOrder, lockStatuses)) {
      throw new IllegalStateException("A modification is already in progress for this SIP order");
    }

    // Only ACTIVE order items can be modified
    var orderItems =
        sipOrder.getItems().stream()
            .filter(i -> i.getStatus() == TransactionStatus.ACTIVE)
            .toList();

    if (orderItems.isEmpty()) {
      throw new IllegalStateException("No active order items found for SIP order: " + sipOrderId);
    }

    // Compute per-item amounts using basket allocation (floor to nearest 100, last absorbs rounding)
    var basketFunds = sipOrder.getGoal().getBasket().getBasketFunds();
    var itemByFundId = orderItems.stream().collect(Collectors.toMap(i -> i.getFund().getId(), i -> i));

    var allocations = new LinkedHashMap<OrderItems, Double>();
    double runningTotal = 0;
    var fundList = new java.util.ArrayList<>(basketFunds);
    for (int i = 0; i < fundList.size(); i++) {
      var bf = fundList.get(i);
      var item = itemByFundId.get(bf.getFund().getId());
      if (item == null) continue;
      double newAmt;
      if (i == fundList.size() - 1) {
        newAmt = newTotalAmount - runningTotal;
      } else {
        newAmt = Math.floor(bf.getAllocationPercentage() / 100.0 * newTotalAmount / 100) * 100;
      }
      runningTotal += newAmt;
      allocations.put(item, newAmt);
    }

    // Check current mandate limit
    var payment = sipOrder.getPayment();
    var currentMandate = mandateApiClient.fetchMandate(payment.getMandateID()).block();
    double mandateLimit = currentMandate != null && currentMandate.getAmount() != null
        ? currentMandate.getAmount() : 0;

    if (newTotalAmount > mandateLimit) {
      // Need a new mandate — create it using same bank account as existing mandate
      var bank = payment.getBank();
      var today = LocalDate.now();
      var newMandate = mandateApiClient.createMandate(
          MandateDto.builder()
              .amount(newTotalAmount)
              .bankAccount(bank.getPaymentRef().toString())
              .startDate(today)
              .endDate(today.plusYears(29))
              .paymentType(MandateDto.PaymentType.E_MANDATE)
              .build()
      ).block();

      if (newMandate == null) {
        throw new RuntimeException("Failed to create new mandate for SIP modification");
      }

      var authAction = mandateApiClient.authorizeMandate(newMandate.getId()).block();
      if (authAction == null) {
        throw new RuntimeException("Failed to get mandate authorization URL");
      }

      var modification = new SipModification();
      modification.setSipOrder(sipOrder);
      modification.setRequestedAmount(newTotalAmount);
      modification.setStatus(SipModification.Status.AWAITING_MANDATE);
      modification.setMandateId(newMandate.getId());
      sipModificationRepository.save(modification);

      log.info("SIP modification id={} awaiting mandate authorization for sipOrderId={}",
          modification.getId(), sipOrderId);
      return authAction.getRedirectUrl();
    }

    // Existing mandate sufficient — submit batch PATCH immediately
    var plans = allocations.entrySet().stream()
        .map(e -> {
          Map<String, Object> plan = new java.util.HashMap<>();
          plan.put("id", e.getKey().getRef());
          plan.put("amount", e.getValue());
          return plan;
        })
        .collect(Collectors.toList());
    sipOrderApiClient.updatePurchasePlanAmounts(plans).block();

    var modification = new SipModification();
    modification.setSipOrder(sipOrder);
    modification.setRequestedAmount(newTotalAmount);
    modification.setStatus(SipModification.Status.PENDING);
    sipModificationRepository.save(modification);

    for (var entry : allocations.entrySet()) {
      var item = entry.getKey();
      var newAmt = entry.getValue();
      var modItem = new SipModificationItem();
      modItem.setModification(modification);
      modItem.setOrderItem(item);
      modItem.setOldAmount(item.getAmount());
      modItem.setNewAmount(newAmt);
      modItem.setStatus(SipModificationItem.Status.PENDING);
      sipModificationItemRepository.save(modItem);
    }

    sipOrderSchedulerService.scheduleModificationTrackerJob(modification.getId());

    log.info("SIP modification submitted for sipOrderId={}, modificationId={}", sipOrderId, modification.getId());
    return null;
  }
}
