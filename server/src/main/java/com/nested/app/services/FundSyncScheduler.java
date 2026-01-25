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

//  @Scheduled(cron = "0 0 1 * * ?")
  @Scheduled(fixedDelay = 5000000)
  public void syncFunds() {
    var pageable = org.springframework.data.domain.PageRequest.of(0, 100);
    var hasMore = true;
    while (hasMore) {
      log.info("Fetching funds from External provider");
      SchemeResponse response;
      try {
        Thread.sleep(1000);
        response = fundAPIClient.fetchFundsList(pageable).block();
      } catch (Exception e) {
        log.error("Error while fetching funds from External provider");
        response = null;
      }
      hasMore = response != null && response.hasNext();
      pageable = pageable.next();

      log.info(
          "Fetched funds from External provider response {}",
          response == null ? "null" : "present");

      var funds = new ArrayList<Fund>();
      if (response != null && response.getResults() != null) {
        log.info(
            "Fetched funds from External provider result count {}", response.getResults().size());
        for (FundDTO dto : response.getResults()) {
          try {
            Fund fund = fundRepository.findFundByIsinCode(dto.getIsin()).orElse(new Fund());
            mapToFund(dto, fund);
            funds.add(fund);
          } catch (Exception e) {
            // Log and continue
            log.error("Error processing fund DTO: {}, error: {}", dto, e.getMessage());
          }
        }
      }
      try {
        fundRepository.saveAllAndFlush(funds);
      } catch (Exception e) {
        log.error("Error while saving funds to DB");
      }
    }
  }

  private void mapToFund(FundDTO dto, Fund fund) {
    log.info("Fund {}", dto.getSchemeName());
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
