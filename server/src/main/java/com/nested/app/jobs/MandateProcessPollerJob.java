package com.nested.app.jobs;

import com.nested.app.entity.Payment;
import com.nested.app.events.MandateProcessEvent;
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
 * Quartz job that publishes MandateProcessEvent every 10 seconds for up to 10 minutes. The job
 * terminates early if the payment's sipStatus is no longer SUBMITTED.
 *
 * <p>Job parameters (via JobDataMap):
 *
 * <ul>
 *   <li>paymentID - The payment ID to poll
 *   <li>mandateID - The mandate ID associated with the payment
 *   <li>startTime - Epoch millis when the job was first scheduled
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class MandateProcessPollerJob implements Job {

  private static final long TEN_MINUTES_IN_MILLIS = 10 * 60 * 1000L;

  private final PaymentRepository paymentRepository;
  private final ApplicationEventPublisher publisher;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    Long paymentID = context.getJobDetail().getJobDataMap().getLong("paymentID");
    long startTime = context.getJobDetail().getJobDataMap().getLong("startTime");

    log.debug("Executing MandateProcessPollerJob for payment ID: {}", paymentID);

    try {
      // Check if 10 minutes have elapsed
      if (System.currentTimeMillis() - startTime > TEN_MINUTES_IN_MILLIS) {
        log.info(
            "MandateProcessPollerJob for payment ID: {} has reached 10 minute timeout. Terminating job.",
            paymentID);
        deleteJob(context);
        return;
      }

      // Fetch fresh payment from database
      Payment payment = paymentRepository.findById(paymentID).orElse(null);

      if (payment == null) {
        log.warn(
            "Payment not found for payment ID: {}. Terminating MandateProcessPollerJob.",
            paymentID);
        deleteJob(context);
        return;
      }

      // Terminate if sipStatus is not SUBMITTED
      if (payment.getSipStatus() != Payment.PaymentStatus.SUBMITTED) {
        log.info(
            "Payment ID: {} sipStatus is {}. Terminating MandateProcessPollerJob.",
            paymentID,
            payment.getSipStatus());
        deleteJob(context);
        return;
      }

      // Publish the MandateProcessEvent
      publisher.publishEvent(
          new MandateProcessEvent(payment.getMandateID(), payment, LocalDateTime.now()));
      log.debug(
          "Published MandateProcessEvent for payment ID: {}, mandate ID: {}",
          paymentID,
          payment.getMandateID());

    } catch (Exception e) {
      log.error("Error executing MandateProcessPollerJob for payment ID: {}", paymentID, e);
      throw new JobExecutionException("MandateProcessPollerJob failed", e);
    }
  }

  private void deleteJob(JobExecutionContext context) throws JobExecutionException {
    try {
      context.getScheduler().deleteJob(context.getJobDetail().getKey());
    } catch (SchedulerException e) {
      log.error("Failed to delete MandateProcessPollerJob", e);
      throw new JobExecutionException("Failed to delete job", e);
    }
  }
}
