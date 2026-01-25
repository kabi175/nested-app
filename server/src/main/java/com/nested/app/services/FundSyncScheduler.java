package com.nested.app.services;

import com.nested.app.client.finprimitives.FundAPIClient;
import com.nested.app.client.mf.dto.FundDTO;
import com.nested.app.client.mf.dto.SchemeResponse;
import com.nested.app.entity.Fund;
import com.nested.app.repository.FundRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class FundSyncScheduler {
  private final FundAPIClient fundAPIClient;
  private final FundRepository fundRepository;

  private static final String TRACE_ID_KEY = "traceId";
  private static final String SPAN_ID_KEY = "spanId";

  @Scheduled(cron = "0 0 1 * * ?")
  public void syncFunds() {
    // Generate trace ID for this scheduled job run
    String traceId = "SYNC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    String spanId = UUID.randomUUID().toString().substring(0, 8);
    
    MDC.put(TRACE_ID_KEY, traceId);
    MDC.put(SPAN_ID_KEY, spanId);
    
    long startTime = System.currentTimeMillis();
    int totalFundsProcessed = 0;
    int totalFundsSaved = 0;
    int totalErrors = 0;
    int pageNumber = 0;
    
    log.info("========== FUND SYNC STARTED ==========");
    log.info("Job Type: FundSyncScheduler | Trigger: CRON | Interval: Every 1 minute");
    
    try {
      var pageable = org.springframework.data.domain.PageRequest.of(0, 100);
      var hasMore = true;
      
      while (hasMore) {
        pageNumber++;
        log.info("[Page {}] Fetching funds from external provider...", pageNumber);
        
        long fetchStart = System.currentTimeMillis();
        SchemeResponse response;
        
        try {
          Thread.sleep(1000);
          response = fundAPIClient.fetchFundsList(pageable).block();
          long fetchDuration = System.currentTimeMillis() - fetchStart;
          log.info("[Page {}] API call completed in {}ms", pageNumber, fetchDuration);
        } catch (Exception e) {
          totalErrors++;
          log.error("[Page {}] ERROR fetching funds | Exception: {} | Message: {}", 
              pageNumber, e.getClass().getSimpleName(), e.getMessage());
          response = null;
        }
        
        hasMore = response != null && response.hasNext();
        pageable = pageable.next();

        if (response == null) {
          log.warn("[Page {}] Response is NULL - skipping page", pageNumber);
          continue;
        }

        var funds = new ArrayList<Fund>();
        if (response.getResults() != null) {
          int pageCount = response.getResults().size();
          totalFundsProcessed += pageCount;
          log.info("[Page {}] Processing {} funds...", pageNumber, pageCount);
          
          for (FundDTO dto : response.getResults()) {
            try {
              Fund fund = fundRepository.findFundByIsinCode(dto.getIsin()).orElse(new Fund());
              mapToFund(dto, fund);
              funds.add(fund);
            } catch (Exception e) {
              totalErrors++;
              log.error("[Page {}] ERROR processing fund | ISIN: {} | Name: {} | Error: {}", 
                  pageNumber, dto.getIsin(), dto.getSchemeName(), e.getMessage());
            }
          }
        }
        
        try {
          long saveStart = System.currentTimeMillis();
          fundRepository.saveAllAndFlush(funds);
          long saveDuration = System.currentTimeMillis() - saveStart;
          totalFundsSaved += funds.size();
          log.info("[Page {}] Saved {} funds to DB in {}ms", pageNumber, funds.size(), saveDuration);
        } catch (Exception e) {
          totalErrors++;
          log.error("[Page {}] ERROR saving funds to DB | Exception: {} | Message: {}", 
              pageNumber, e.getClass().getSimpleName(), e.getMessage());
        }
        
        log.info("[Page {}] hasMore={}", pageNumber, hasMore);
      }
    } finally {
      long totalDuration = System.currentTimeMillis() - startTime;
      
      log.info("========== FUND SYNC COMPLETED ==========");
      log.info("Summary | Duration: {}ms | Pages: {} | Processed: {} | Saved: {} | Errors: {}", 
          totalDuration, pageNumber, totalFundsProcessed, totalFundsSaved, totalErrors);
      
      if (totalErrors > 0) {
        log.warn("Job completed with {} errors - review logs above", totalErrors);
      }
      
      // Clear MDC after job completes
      MDC.remove(TRACE_ID_KEY);
      MDC.remove(SPAN_ID_KEY);
    }
  }

  private void mapToFund(FundDTO dto, Fund fund) {
    boolean isNew = fund.getId() == null;
    
    if (log.isDebugEnabled()) {
      log.debug("Mapping fund | ISIN: {} | Name: {} | IsNew: {} | Active: {}", 
          dto.getIsin(), dto.getSchemeName(), isNew, dto.isActive());
    }
    
    if(fund.getLabel() == null){
        fund.setLabel(dto.getSchemeName());
    }
    fund.setName(dto.getSchemeName());

    fund.setMimPurchaseAmount(Math.max(dto.getMinAmountBuy(), 100));
    fund.setMinSipAmount(Math.max(dto.getMinAmountBuy(), 500));

    fund.setActive(dto.isActive());
    fund.setIsinCode(dto.getIsin());
  }

  private Timestamp parseDate(String dateStr) {
    if (dateStr == null) return null;
    try {
      LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
      return Timestamp.valueOf(localDate.atStartOfDay());
    } catch (Exception e) {
      return null;
    }
  }
}
