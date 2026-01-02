package com.nested.app.client.bulkpe.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO for Bulkpe webhook request for reverse penny drop
 */
@Data
public class BulkpeWebhookRequest {
    private boolean status;
    
    @JsonProperty("statusCode")
    private int statusCode;
    
    private WebhookData data;
    
    private String message;

    @Data
    public static class WebhookData {
        @JsonProperty("transcation_id")
        private String transcationId;
        
        @JsonProperty("trx_status")
        private String trxStatus;
        
        @JsonProperty("remitter_name")
        private String remitterName;
        
        @JsonProperty("remitter_account_number")
        private String remitterAccountNumber;
        
        @JsonProperty("remitter_ifsc")
        private String remitterIfsc;
        
        @JsonProperty("remitter_vpa")
        private String remitterVpa;
        
        private Double amount;
        
        private Double charge;
        
        @JsonProperty("gst")
        private Double gst;
        
        @JsonProperty("settlement_Amount")
        private String settlementAmount;
        
        @JsonProperty("closing_balance")
        private String closingBalance;
        
        @JsonProperty("yetToSettle")
        private String yetToSettle;
        
        private String type;
        
        private String utr;
        
        @JsonProperty("payment_mode")
        private String paymentMode;
        
        @JsonProperty("payment_remark")
        private String paymentRemark;
        
        @JsonProperty("createdAt")
        private String createdAt;
        
        @JsonProperty("reference_id")
        private String referenceId;
    }
}

