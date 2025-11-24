package com.nested.app.jobs;

import com.nested.app.services.SipOrderPaymentService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Quartz job that verifies a SIP order payment after a delay. This job is scheduled 10 seconds
 * after placeSipOrders succeeds to verify the payment.
 */
@Slf4j
@Component
public class SipOrderVerificationJob implements Job {

  @Autowired private SipOrderPaymentService sipOrderPaymentService;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    Long paymentID = data.getLong("paymentID");

    try {
      log.info("Executing SIP order verification job for payment ID: {}", paymentID);
      sipOrderPaymentService.verifySipOrderPayment(paymentID);
      log.info("SIP order verification completed successfully for payment ID: {}", paymentID);
    } catch (Exception e) {
      log.error("Error executing SIP order verification job for payment ID: {}", paymentID, e);
      throw new JobExecutionException(e);
    }
  }
}
