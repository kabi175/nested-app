package com.nested.app.client.bulkpe.dto;

import lombok.Data;

@Data
public class ReversePennyDropResponse {
    private boolean status;
    private int statusCode;
    private Data data;
    private String message;

    @lombok.Data
    public static class Data {
        private double amount;
        private String referenceId;
        private String upi;
        private String message;
        private String status;
    private String transactionId;
    }
}
