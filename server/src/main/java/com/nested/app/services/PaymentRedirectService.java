package com.nested.app.services;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.entity.Payment;
import com.nested.app.entity.SipModification;
import com.nested.app.entity.SipModificationItem;
import com.nested.app.events.LumpSumPaymentCompletedEvent;
import com.nested.app.events.MandateProcessEvent;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.repository.SipModificationItemRepository;
import com.nested.app.repository.SipModificationRepository;
import com.nested.app.utils.MobileRedirectHandler;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Service for handling payment redirect callbacks from payment gateway/mandate providers. Publishes
 * PaymentEvent for downstream listeners to verify and process.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentRedirectService {
  private final ApplicationEventPublisher publisher;
  private final PaymentRepository paymentRepository;
  private final MobileRedirectHandler mobileRedirectHandler;
  private final SipModificationRepository sipModificationRepository;
  private final SipModificationItemRepository sipModificationItemRepository;
  private final SipOrderApiClient sipOrderApiClient;
  private final SipOrderSchedulerService sipOrderSchedulerService;

  /**
   * Handle mandate redirect from external provider. Publishes a MandateProcessEvent for the mandate
   * redirect to verify and process async.
   *
   * @param mandateId The mandate ID returned from the provider
   */
  public String handleMandateRedirect(Long mandateId) {
    log.info("Received mandate redirect for mandate ID: {}", mandateId);

    try {
      // Check if this mandate belongs to a SIP modification
      var modOpt = sipModificationRepository.findByMandateId(mandateId);
      if (modOpt.isPresent()) {
        var modification = modOpt.get();
        if (modification.getStatus() == SipModification.Status.AWAITING_MANDATE) {
          return handleModificationMandateRedirect(modification, mandateId);
        }
        log.info("Modification mandate id={} already processed (status={})", mandateId, modification.getStatus());
        return mobileRedirectHandler.redirectUrl("sip/modification/success");
      }

      // Standard SIP payment mandate
      Payment payment = paymentRepository.findByMandateID(mandateId).orElseThrow();

      // Publish mandate process event for async processing and verification
      publisher.publishEvent(new MandateProcessEvent(mandateId, payment, LocalDateTime.now()));

      log.info(
          "Published mandate process event for Payment ID: {}, Mandate ID: {}",
          payment.getId(),
          mandateId);

      if (payment.getSipStatus().equals(Payment.PaymentStatus.ACTIVE)) {
        return mobileRedirectHandler.redirectUrl(
            "payment/" + payment.getId() + "/success?type=sip");
      }

      return mobileRedirectHandler.redirectUrl("payment/" + payment.getId() + "/failure?type=sip");
    } catch (Exception e) {
      log.error("Error processing mandate redirect for mandate ID: {}", mandateId, e);
      throw new RuntimeException();
    }
  }

  private String handleModificationMandateRedirect(SipModification modification, Long mandateId) {
    log.info("Processing modification mandate redirect for modificationId={}", modification.getId());

    try {
      var sipOrder = modification.getSipOrder();
      var orderItems = sipOrder.getItems().stream()
          .filter(i -> i.getStatus() == com.nested.app.enums.TransactionStatus.ACTIVE)
          .collect(Collectors.toList());

      var basketFunds = sipOrder.getGoal().getBasket().getBasketFunds();
      var itemByFundId = orderItems.stream()
          .collect(Collectors.toMap(i -> i.getFund().getId(), i -> i));

      double newTotalAmount = modification.getRequestedAmount();
      var allocations = new java.util.LinkedHashMap<com.nested.app.entity.OrderItems, Double>();
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

      // Submit batch PATCH with payment_source = new mandate ID
      var plans = allocations.entrySet().stream()
          .map(e -> {
            Map<String, Object> plan = new java.util.HashMap<>();
            plan.put("id", e.getKey().getRef());
            plan.put("amount", e.getValue());
            plan.put("payment_source", mandateId.toString());
            return plan;
          })
          .collect(Collectors.toList());
      sipOrderApiClient.updatePurchasePlanAmounts(plans).block();

      modification.setStatus(SipModification.Status.PENDING);
      sipModificationRepository.save(modification);

      for (var entry : allocations.entrySet()) {
        var item = entry.getKey();
        var modItem = new SipModificationItem();
        modItem.setModification(modification);
        modItem.setOrderItem(item);
        modItem.setOldAmount(item.getAmount());
        modItem.setNewAmount(entry.getValue());
        modItem.setStatus(SipModificationItem.Status.PENDING);
        sipModificationItemRepository.save(modItem);
      }

      sipOrderSchedulerService.scheduleModificationTrackerJob(modification.getId());

      log.info("Modification mandate approved — batch PATCH submitted for modificationId={}", modification.getId());
      return mobileRedirectHandler.redirectUrl("sip/modification/success");
    } catch (Exception e) {
      log.error("Error handling modification mandate redirect for modificationId={}: {}",
          modification.getId(), e.getMessage(), e);
      throw new RuntimeException(e);
    }
  }

  /**
   * Handle payment redirect from external payment provider. Publishes a
   * LumpSumPaymentCompletedEvent for the payment redirect to verify and process async.
   *
   * @param paymentID The internal payment id
   */
  public String handlePaymentRedirect(Long paymentID) {
    log.info("Received payment redirect for payment id: {}", paymentID);

    try {
      Payment payment = paymentRepository.findById(paymentID).orElseThrow();


      var paymentRef = payment.getRef();
      // Publish buy order process event for async processing and verification
      publisher.publishEvent(new LumpSumPaymentCompletedEvent(paymentRef, LocalDateTime.now()));
      log.info(
          "Published buy order process event for Payment ID: {}, Ref: {}",
          payment.getId(),
          paymentRef);

      payment = paymentRepository.findById(paymentID).orElseThrow();
      return switch (payment.getBuyStatus()) {
        case COMPLETED ->
            mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/success?type=buy");
        case CANCELLED ->
            mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/failure?type=buy");
        default -> mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/processing");
      };

    } catch (Exception e) {
      log.error("Error processing payment redirect for payment id: {}", paymentID, e);
      return mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/failure?type=buy");
    }
  }
}
