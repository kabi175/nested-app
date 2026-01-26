package com.nested.app.jobs;

import com.nested.app.entity.Payment;
import com.nested.app.events.LumpSumPaymentCompletedEvent;
import com.nested.app.repository.PaymentRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Quartz job that publishes LumpSumPaymentCompletedEvent every 10 seconds for up to 10 minutes. The
 * job terminates early if the payment's buyStatus is no longer SUBMITTED.
 *
 * <p>Job parameters (via JobDataMap):
 *
 * <ul>
 *   <li>paymentRef - The payment reference to poll
 *   <li>startTime - Epoch millis when the job was first scheduled
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class LumpSumPaymentPollerJob implements Job {

  private static final long TEN_MINUTES_IN_MILLIS = 10 * 60 * 1000L;

  private final PaymentRepository paymentRepository;
  private final ApplicationEventPublisher publisher;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    String paymentRef = context.getJobDetail().getJobDataMap().getString("paymentRef");
    long startTime = context.getJobDetail().getJobDataMap().getLong("startTime");

    log.debug("Executing LumpSumPaymentPollerJob for payment ref: {}", paymentRef);

    try {
      // Check if 10 minutes have elapsed
      if (System.currentTimeMillis() - startTime > TEN_MINUTES_IN_MILLIS) {
        log.info(
            "LumpSumPaymentPollerJob for payment ref: {} has reached 10 minute timeout. Terminating job.",
            paymentRef);
        deleteJob(context);
        return;
      }

      // Fetch payment and check status
      Payment payment =
          paymentRepository
              .findByRef(paymentRef)
              .orElseThrow(
                  () -> new JobExecutionException("Payment not found for ref: " + paymentRef));

      // Terminate if buyStatus is not SUBMITTED
      if (payment.getBuyStatus() != Payment.PaymentStatus.SUBMITTED) {
        log.info(
            "Payment ref: {} buyStatus is {}. Terminating LumpSumPaymentPollerJob.",
            paymentRef,
            payment.getBuyStatus());
        deleteJob(context);
        return;
      }

      // Publish the event
      publisher.publishEvent(new LumpSumPaymentCompletedEvent(paymentRef, LocalDateTime.now()));
      log.debug("Published LumpSumPaymentCompletedEvent for payment ref: {}", paymentRef);

    } catch (JobExecutionException e) {
      throw e;
    } catch (Exception e) {
      log.error("Error executing LumpSumPaymentPollerJob for payment ref: {}", paymentRef, e);
      throw new JobExecutionException("LumpSumPaymentPollerJob failed", e);
    }
  }

  private void deleteJob(JobExecutionContext context) throws JobExecutionException {
    try {
      context.getScheduler().deleteJob(context.getJobDetail().getKey());
    } catch (SchedulerException e) {
      log.error("Failed to delete LumpSumPaymentPollerJob", e);
      throw new JobExecutionException("Failed to delete job", e);
    }
  }
}
