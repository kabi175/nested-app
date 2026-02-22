package com.nested.app.services;

import com.nested.app.client.mf.ReportApiClient;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.events.GoalSyncEvent;
import com.nested.app.repository.FundRepository;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service for fetching scheme-wise reports for investors. Handles batch processing of report
 * fetches with parallel execution.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SchemeWiseReportService {

  private static final int PAGE_SIZE = 50; // Process 50 investors per page

  private final ReportApiClient reportApiClient;
  private final InvestorRepository investorRepository;
  private final FundRepository fundRepository;
  private final UserRepository userRepository;
  private final GoalRepository goalRepository;
  private final ApplicationEventPublisher publisher;

  /**
   * Fetches scheme-wise reports for all investors with non-null accountRef. Uses pagination to
   * handle large datasets efficiently (supports 50K+ investors). Processes up to 50 investors in
   * parallel to optimize API calls.
   *
   * @return Summary containing success count, failure count, and total processed
   */
  public ReportFetchSummary fetchReportsForAllInvestors() {
    log.info("Starting scheme-wise report fetch for all investors");

    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger failureCount = new AtomicInteger(0);
    AtomicInteger totalProcessed = new AtomicInteger(0);
    AtomicInteger totalInvestors = new AtomicInteger(0);

    int pageNumber = 0;
    Page<Investor> investorPage;

    do {
      Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);
      investorPage = investorRepository.findAll(pageable);

      if (pageNumber == 0) {
        totalInvestors.set((int) investorPage.getTotalElements());
        log.info("Found {} total investors", totalInvestors.get());
      }

      // Filter investors with valid accountRef
      var eligibleInvestors =
          investorPage.getContent().stream()
              .filter(
                  investor ->
                      investor.getAccountRef() != null && !investor.getAccountRef().isBlank())
              .toList();

      log.info(
          "Page {}: Processing {} eligible investors out of {} in page",
          pageNumber,
          eligibleInvestors.size(),
          investorPage.getNumberOfElements());

      if (!eligibleInvestors.isEmpty()) {
        processInvestorBatch(eligibleInvestors, successCount, failureCount);
        totalProcessed.addAndGet(eligibleInvestors.size());
      }

      pageNumber++;
    } while (investorPage.hasNext());

    log.info(
        "Completed scheme-wise report fetch. Total Investors: {}, Eligible: {}, Success: {}, Failures: {}",
        totalInvestors.get(),
        totalProcessed.get(),
        successCount.get(),
        failureCount.get());

    return new ReportFetchSummary(totalProcessed.get(), successCount.get(), failureCount.get());
  }

  public void fetchReportsForUser(User user) {
    var investor = investorRepository.findById(user.getInvestor().getId()).orElseThrow();
    if (investor.getAccountRef() != null && !investor.getAccountRef().isBlank()) {
      fetchReportForInvestor(investor).block();
      var goals = goalRepository.findByUserId(user.getId());
      goals.forEach(
          goal -> {
            publisher.publishEvent(new GoalSyncEvent(goal.getId(), user));
          });
    }
  }

  /**
   * Processes a batch of investors in parallel.
   *
   * @param investors List of investors to process
   * @param successCount Atomic counter for successful fetches
   * @param failureCount Atomic counter for failed fetches
   */
  private void processInvestorBatch(
      java.util.List<Investor> investors, AtomicInteger successCount, AtomicInteger failureCount) {

    // Process investors in parallel with concurrency of 50
    Flux.fromIterable(investors)
        .flatMap(
            investor ->
                fetchReportForInvestor(investor)
                    .doOnSuccess(
                        response -> {
                          successCount.incrementAndGet();
                          log.debug(
                              "Successfully fetched report for investor id={}, accountRef={}",
                              investor.getId(),
                              investor.getAccountRef());
                        })
                    .doOnError(
                        error -> {
                          failureCount.incrementAndGet();
                          log.error(
                              "Failed to fetch report for investor id={}, accountRef={}: {}",
                              investor.getId(),
                              investor.getAccountRef(),
                              error.getMessage());
                        })
                    .onErrorResume(
                        error -> Mono.empty()), // Continue processing other investors on error
            10) // Process 5 requests in parallel
        .blockLast(); // Wait for all requests to complete
  }

  /**
   * Fetches scheme-wise report for a single investor.
   *
   * @param investor The investor to fetch report for
   * @return Mono containing the report response
   */
  private Mono<?> fetchReportForInvestor(Investor investor) {
    userRepository
        .findByInvestor(investor)
        .ifPresent(
            user -> {
              var goals = goalRepository.findByUserId(user.getId());
              goals.forEach(
                  goal -> {
                    publisher.publishEvent(
                        new GoalSyncEvent(goal.getId(), user, 60)); // sync with a 1min delay
                  });
            });
    return reportApiClient
        .fetchSchemeWiseReport(investor.getAccountRef())
        .doOnSubscribe(
            subscription ->
                log.debug(
                    "Fetching scheme-wise report for investor id={}, accountRef={}",
                    investor.getId(),
                    investor.getAccountRef()))
        .doOnSuccess(
            resp ->
                resp.getData()
                    .getRows()
                    .forEach(
                        report ->
                            fundRepository
                                .findFundByIsinCode(report.getIsin())
                                .ifPresent(
                                    fund -> {
                                      fund.setNavDate(parseDate(report.getAsOn()));
                                      fund.setNav(report.getNav().doubleValue());
                                      fundRepository.save(fund);
                                    })));
  }

  private Timestamp parseDate(String dateStr) {
    if (dateStr == null) return null;
    try {
      LocalDate date = LocalDate.parse(dateStr);
      return Timestamp.valueOf(date.atStartOfDay());
    } catch (Exception e) {
      return null;
    }
  }

  /** Summary of report fetch operation. */
  public record ReportFetchSummary(int totalProcessed, int successCount, int failureCount) {
    public boolean hasFailures() {
      return failureCount > 0;
    }

    public double successRate() {
      return totalProcessed > 0 ? (double) successCount / totalProcessed * 100 : 0;
    }
  }
}
