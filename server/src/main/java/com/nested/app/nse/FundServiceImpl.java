package com.nested.app.nse;

import com.nested.app.entity.Fund;
import com.nested.app.repository.FundsRepository;
import org.apache.commons.lang3.stream.Streams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundServiceImpl implements FundService {

    @Autowired
    private NseAPIBuild nseAPIBuild;

    @Autowired
    private FundsRepository fundsRepository;

    private static final String FUND_DETAILS_ENDPOINT = "/nsemfdesk/api/v2/reports/MASTER_DOWNLOAD";

    @Scheduled(fixedDelay = 1000 * 60 * 60 * 24) // Refresh every 24 hours
    @Override
    public void refreshDetails() {
        var content = nseAPIBuild.build(true).post().uri(FUND_DETAILS_ENDPOINT).bodyValue(Map.of("file_type", "SCH")).retrieve().onStatus(HttpStatus.BAD_REQUEST::equals, response ->

                response.bodyToMono(String.class).flatMap(errorBody -> Mono.error(new RuntimeException("400 Bad Request: " + errorBody + "-" + response.request().getURI())))).bodyToMono(String.class).block();

        var funds = contructFunds(content);
        var fundsFromDB = fundsRepository.findAllById(funds.stream().map(Fund::getId).toList());
        var idVsFunds = fundsFromDB.stream().collect(Collectors.toMap(Fund::getId, fund -> fund));
        var newFunds = new ArrayList<Fund>();


        for (var fund : funds) {
            if (idVsFunds.containsKey(fund.getId())) {
                var existingFund = idVsFunds.get(fund.getId());
                existingFund.setIsinCode(fund.getIsinCode());
                existingFund.setPurchaseAllowed(fund.isPurchaseAllowed());
                existingFund.setMimPurchaseAmount(fund.getMimPurchaseAmount());
                existingFund.setMimAdditionalPurchaseAmount(fund.getMimAdditionalPurchaseAmount());
                existingFund.setMaxAdditionalPurchaseAmount(fund.getMaxAdditionalPurchaseAmount());
                existingFund.setSchemeType(fund.getSchemeType());
                existingFund.setAmcCode(fund.getAmcCode());
                existingFund.setSchemeCode(fund.getSchemeCode());
                existingFund.setName(fund.getName());
            } else {
                newFunds.add(fund);
            }
        }

        fundsRepository.saveAll(Streams.of(newFunds, fundsFromDB).flatMap(List::stream).toList());
    }

    private List<Fund> contructFunds(String content) {
        if (content == null) {
            return List.of();
        }
        var headers = Arrays.asList(content.lines().findFirst().orElseThrow().split("\\|"));
        var uniqueSrNoIndex = headers.indexOf("UNIQUE SR NO");
        var schemeCodeIndex = headers.indexOf("SCHEME CODE");
        var isinCodeIndex = headers.indexOf("ISIN");
        var amcCodeIndex = headers.indexOf("AMC SCHEME CODE");
        var schemeTypeIndex = headers.indexOf("SCHEME TYPE");
        var schemeNameIndex = headers.indexOf("SCHEME NAME");
        var sipAllowedIndex = headers.indexOf("SIP ALLOWED");
        var settlementTypeIndex = headers.indexOf("SETTLEMENT TYPE");
        var amcActiveFlag = headers.indexOf("AMC ACTIVE FLAG");
        var purchaseAllowanceIndex = headers.indexOf("PURCHASE ALLOWED");
        var minPurchaseAmountIndex = headers.indexOf("NEW PURCHASE MIN AMOUNT");
        var minAdditionalPurchaseAmountIndex = headers.indexOf("ADDITIONAL PURCHASE MIN AMOUNT");
        var maxAdditionalPurchaseAmountIndex = headers.indexOf("ADDITIONAL PURCHASE MAX AMOUNT");
        return content.lines().skip(1).map(line -> line.split("\\|")).map(fundData -> {
            var fund = new Fund();
            fund.setId(Long.parseLong(fundData[uniqueSrNoIndex]));
            fund.setSchemeCode(fundData[schemeCodeIndex]);
            fund.setIsinCode(fundData[isinCodeIndex]);
            fund.setAmcCode(fundData[amcCodeIndex]);
            fund.setLabel(fundData[schemeNameIndex]);
            fund.setName(fundData[schemeNameIndex]);

            fund.setNav("0.0");
            fund.setNavDate(Timestamp.from(Instant.now()));

            fund.setMimPurchaseAmount(Double.parseDouble(fundData[minPurchaseAmountIndex].isBlank() ? "0.0" : fundData[minPurchaseAmountIndex]));
            fund.setMimAdditionalPurchaseAmount(Double.parseDouble(fundData[minAdditionalPurchaseAmountIndex].isBlank() ? "0.0" : fundData[minAdditionalPurchaseAmountIndex]));
            fund.setMaxAdditionalPurchaseAmount(Double.parseDouble(fundData[maxAdditionalPurchaseAmountIndex].isBlank() ? "0.0" : fundData[maxAdditionalPurchaseAmountIndex]));
            fund.setSettlementType(fundData[settlementTypeIndex]);
            fund.setSchemeType(fundData[schemeTypeIndex]);

            fund.setPurchaseAllowed(fundData[purchaseAllowanceIndex].equalsIgnoreCase("Y"));
            fund.setAmcActive(fundData[amcActiveFlag].equalsIgnoreCase("Y"));
            fund.setSipAllowed(fundData[sipAllowedIndex].equalsIgnoreCase("Y"));
            return fund;
        }).toList();
    }
}
