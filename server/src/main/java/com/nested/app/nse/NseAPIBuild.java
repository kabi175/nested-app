package com.nested.app.nse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;

@Component
public class NseAPIBuild {
    private final String baseUrl;
    private final String memberKey;
    private final String apiSecret;
    private final String memberCode;
    private final String userID;
    private String authToken;

    public NseAPIBuild(@Value("${nse.api.base-url}") String baseUrl, @Value("${nse.api.member.key}") String memberKey, @Value("${nse.api.secret}") String apiSecret, @Value("${nse.api.member.code}") String memberCode, @Value("${nse.api.user}") String userID) {
        this.baseUrl = baseUrl;
        this.memberKey = memberKey;
        this.apiSecret = apiSecret;
        this.memberCode = memberCode;
        this.userID = userID;
    }

    public NseAPIBuild withAuthorization(String token) {
        this.authToken = token;
        return this;
    }

    public WebClient build() {
        return build(false);
    }

    public WebClient build(boolean increaseBuffer) {
        // Increase buffer size to 16 MB
        WebClient.Builder builder = WebClient.builder().baseUrl(baseUrl);
        if(increaseBuffer) {
            ExchangeStrategies strategies = ExchangeStrategies.builder().codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)) // 16MB
                    .build();
            builder = builder.exchangeStrategies(strategies).clientConnector(new ReactorClientHttpConnector());
        }

        if (authToken == null) {
            authToken = generateAuthToken();
        }
        var auth = Base64.getEncoder().encodeToString((userID + ":" + authToken).getBytes());
        builder.defaultHeader("Authorization", "Basic " + auth);
        builder.defaultHeader("memberId", memberCode);
        builder.defaultHeader("Content-Type", "application/json");
        builder.defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");
        builder.defaultHeader("Accept", "*/*");
        builder.defaultHeader("Accept-Encoding", "gzip, deflate, br");
        builder.defaultHeader("Accept-Language", "en-US");
        builder.defaultHeader("Host", "nseinvestuat.nseindia.com");
        builder.defaultHeader("Connection", "keep-alive");
        return builder.build();
    }

    private String generateAuthToken() {
        return AesEncryptor.generateEncryptedPassword(memberKey, apiSecret);
    }
}
