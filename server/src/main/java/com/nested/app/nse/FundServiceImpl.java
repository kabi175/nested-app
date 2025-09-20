package com.nested.app.nse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class FundServiceImpl implements FundService {

    @Autowired
    private NseAPIBuild nseAPIBuild;

    private static final String FUND_DETAILS_ENDPOINT = "/nsemfdesk/api/v2/reports/MASTER_DOWNLOAD";

    @Scheduled(fixedDelay = 1000 * 60 * 60 * 24) // Refresh every 24 hours
    @Override
    public void refreshDetails() {
        var content = nseAPIBuild.build(true).post().uri(FUND_DETAILS_ENDPOINT).bodyValue(Map.of("file_type", "SCH")).retrieve().onStatus(HttpStatus.BAD_REQUEST::equals, response ->

                response.bodyToMono(String.class).flatMap(errorBody -> Mono.error(new RuntimeException("400 Bad Request: " + errorBody + "-" + response.request().getURI())))).bodyToMono(String.class).block();

        assert content != null;
        var headers = content.lines().findFirst().orElseThrow().split("\\|");

        content.lines().map(line -> line.split("\\|"));
        //TODO: Store the details in DB
    }
}
