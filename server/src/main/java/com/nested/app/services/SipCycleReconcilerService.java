package com.nested.app.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.*;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Triggers the Spring Batch reconciliation job that advances stuck RUNNING SIPOrders.
 * Processing is chunk-oriented (100 rows per chunk, each with its own transaction).
 * Handles stale STARTED executions left by crashed nodes before retrying.
 */
@Slf4j
@Service
public class SipCycleReconcilerService {
    private static final String JOB_NAME = "sipCycleReconcilerJob";
    private final JobLauncher jobLauncher;
    private final JobExplorer jobExplorer;
    private final JobRepository jobRepository;
    private final Job sipCycleReconcilerJob;

    public SipCycleReconcilerService(JobLauncher jobLauncher, JobExplorer jobExplorer,
            JobRepository jobRepository,
            @Qualifier("sipCycleReconcilerBatchJob") Job sipCycleReconcilerJob) {
        this.jobLauncher = jobLauncher;
        this.jobExplorer = jobExplorer;
        this.jobRepository = jobRepository;
        this.sipCycleReconcilerJob = sipCycleReconcilerJob;
    }

    public void advanceStuckCycles() {
        try {
            JobParameters params = new JobParametersBuilder().addLocalDate("runDate", LocalDate.now()).toJobParameters();
            var execution = jobLauncher.run(sipCycleReconcilerJob, params);
            log.info("SipCycleReconcilerJob completed with status={}", execution.getStatus());
        } catch (JobExecutionAlreadyRunningException e) {
            log.warn("Stale job execution detected (node likely crashed). Abandoning and retrying.");
            abandonStaleExecutions();
            retryRun();
        } catch (Exception e) {
            log.error("SipCycleReconcilerJob failed: {}", e.getMessage(), e);
            throw new RuntimeException("SipCycleReconcilerJob failed", e);
        }
    }

    private void abandonStaleExecutions() {
        jobExplorer.findRunningJobExecutions(JOB_NAME).forEach(exec -> {
            exec.setStatus(BatchStatus.ABANDONED);
            exec.setExitStatus(ExitStatus.UNKNOWN);
            jobRepository.update(exec);
            log.warn("Abandoned stale JobExecution id={} startedAt={}", exec.getId(), exec.getStartTime());
        });
    }

    private void retryRun() {
        try {
            JobParameters params = new JobParametersBuilder().addLocalDate("runDate", LocalDate.now()).toJobParameters();
            var execution = jobLauncher.run(sipCycleReconcilerJob, params);
            log.info("SipCycleReconcilerJob retry completed with status={}", execution.getStatus());
        } catch (Exception e) {
            log.error("SipCycleReconcilerJob retry failed: {}", e.getMessage(), e);
            throw new RuntimeException("SipCycleReconcilerJob retry after stale-execution abandon failed", e);
        }
    }
}
