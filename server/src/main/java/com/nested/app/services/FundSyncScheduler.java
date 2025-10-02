package com.nested.app.services;

import com.nested.app.client.tarrakki.FundAPIClient;
import com.nested.app.client.tarrakki.dto.FundDTO;
import com.nested.app.client.tarrakki.dto.FundResponse;
import com.nested.app.entity.Fund;
import com.nested.app.repository.FundRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class FundSyncScheduler {
  private final FundAPIClient fundAPIClient;
  private final FundRepository fundRepository;

  @Scheduled(cron = "0 0 2 * * *") // Runs daily at 2 AM
  public void syncFunds() {
    var pageable = org.springframework.data.domain.PageRequest.of(0, 100);
    var hasMore = true;
    while (hasMore) {
      FundResponse response = fundAPIClient.fetchFundsList(pageable).block();
      hasMore = response != null && response.hasNext();
      pageable = pageable.next();

      if (response != null && response.getResults() != null) {
        for (FundDTO dto : response.getResults()) {
          Long fundId = Long.valueOf(dto.getId());
          Fund fund = fundRepository.findById(fundId).orElse(null);
          if (fund != null) {
            // Update only nav and navDate
            fund.setNav(dto.getNav());
            fund.setNavDate(parseDate(dto.getNav_date()));
            fund.setActive(dto.getStatus().equalsIgnoreCase("active"));
          } else {
            fund = mapToFund(dto);
          }
          // TODO: handle bulk save
          fundRepository.save(fund);
        }
      }
    }
  }

  private Fund mapToFund(FundDTO dto) {
    Fund fund = new Fund();
    fund.setId(Long.valueOf(dto.getId()));
    fund.setLabel(dto.getName());
    fund.setDescription(dto.getCategory() + " - " + dto.getSub_category());
    fund.setName(dto.getName());
    fund.setNav(dto.getNav());
    fund.setNavDate(parseDate(dto.getNav_date()));
    fund.setMimPurchaseAmount(dto.getMin_initial());
    fund.setMimAdditionalPurchaseAmount(dto.getMin_additional());
    fund.setActive("active".equalsIgnoreCase(dto.getStatus()));
    fund.setIsinCode(dto.getIsin());
    fund.setSchemeCode(dto.getAmfi_code());
    return fund;
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
