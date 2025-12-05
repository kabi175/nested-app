package com.nested.app.services;

import com.nested.app.client.finprimitives.FundAPIClient;
import com.nested.app.client.mf.dto.FundDTO;
import com.nested.app.client.mf.dto.SchemeResponse;
import com.nested.app.entity.Fund;
import com.nested.app.repository.FundRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class FundSyncScheduler {
  private final FundAPIClient fundAPIClient;
  private final FundRepository fundRepository;

  @Scheduled(fixedRate = 30000) // For testing: runs every 5 minutes
  public void syncFunds() {
    var pageable = org.springframework.data.domain.PageRequest.of(0, 100);
    var hasMore = true;
    while (hasMore) {
      SchemeResponse response = fundAPIClient.fetchFundsList(pageable).block();
      hasMore = response != null && response.hasNext();
      pageable = pageable.next();

      if (response != null && response.getResults() != null) {
        for (FundDTO dto : response.getResults()) {
          try {
            Fund fund = fundRepository.findFundByIsinCode(dto.getIsin()).orElse(new Fund());
            mapToFund(dto, fund);
            fundRepository.save(fund);
          } catch (Exception e) {
            // Log and continue
            log.error("Error processing fund DTO: {}, error: {}", dto, e.getMessage());
          }
        }
      }
    }
  }

  private void mapToFund(FundDTO dto, Fund fund) {

    fund.setLabel(dto.getSchemeName());
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
