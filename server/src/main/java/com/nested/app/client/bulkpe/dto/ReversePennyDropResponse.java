package com.nested.app.client.bulkpe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ReversePennyDropResponse {
    private boolean status;
    private int statusCode;
    private ResponseData data;
    private String message;

    @Data
    public static class ResponseData {
        private double amount;

        @JsonProperty("reference_id")
        private String referenceId;

        @JsonProperty("upi")
        private String upi;

        private String message;
        private String status;

        @JsonProperty("transaction_id")
        private String transactionId;
    }
}
