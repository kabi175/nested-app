package com.nested.app.nse;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.annotation.ActiveUserOnly;
import com.nested.app.annotation.KycCompletedOnly;
import com.nested.app.contect.ClientContext;
import com.nested.app.contect.UserContext;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SellOrder;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;

@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    @Autowired
    private NseAPIBuild nseAPIBuild;

    @KycCompletedOnly
    private ClientContext clientContext;

    @ActiveUserOnly
    private UserContext userContext;


    private static String ORDER_ENTRY_URI = "nsemfdesk/api/v2/transaction/NORMAL";

    @Override
    public void placeBuyOrder(@Valid List<BuyOrder> orders) {
        var translationDetails = orders.stream().map(order -> {
            var req = new BuySellDetails();
            req.setSchemeCode(order.getFund().getSchemeCode());
            req.setTransactionType("P");
//            req.setBuySellType(order.isFresh() ? "Fresh" : "Additional");
//            req.setClientCode(clientContext.getClient().getClientCode());
            req.setDematOrPhysical("D");
            req.setOrderAmount(String.valueOf(order.getAmount()));
            return req;
        }).toList();
        var content = nseAPIBuild.build(true).post().uri(ORDER_ENTRY_URI).bodyValue(new BuySellRequest(translationDetails)).retrieve().bodyToMono(BuySellRequest.class).block();
    }

    @Override
    public void placeSellOrder(List<SellOrder> orders) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void placeSIPOrder(List<SIPOrder> orders) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class BuySellRequest {
    @JsonProperty("transaction_details")
    private List<BuySellDetails> transactionDetails;
}

@Data
@NoArgsConstructor
class BuySellDetails {

    @JsonProperty("scheme_code")
    private String schemeCode;

    @JsonProperty("trxn_type")
    private String transactionType; // BUY, SELL, SIP

    @JsonProperty("buy_sell_type")
    private String buySellType; // Fresh / Additional

    @JsonProperty("client_code")
    private String clientCode;

    @JsonProperty("demat_physical")
    private String dematOrPhysical; // D / P

    @JsonProperty("order_amount")
    private String orderAmount;

    @JsonProperty("kyc_flag")
    private String kycFlag = "Y";

    @JsonProperty("euin_declaration")
    private String euinDecl = "N";

    @JsonProperty("min_redemption_flag")
    private String minRedemption = "N";

    @JsonProperty("dpc_flag")
    private String dpc_flag = "Y";

    @JsonProperty("all_units")
    private String allUnits = "N";

    @JsonProperty("trxn_order_id")
    private String trxnOrderId;

    @JsonProperty("trxn_status")
    private String trxnStatus;

    @JsonProperty("trxn_remark")
    private String trxnRemark;
}