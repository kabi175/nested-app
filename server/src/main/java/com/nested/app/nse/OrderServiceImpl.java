package com.nested.app.nse;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.annotation.ActiveUserOnly;
import com.nested.app.annotation.KycCompletedOnly;
import com.nested.app.contect.ClientContext;
import com.nested.app.contect.UserContext;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Order;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SellOrder;
import com.nested.app.repository.BuyOrderRepository;
import com.nested.app.repository.OrderLogRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Objects;

@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    @Autowired
    private NseAPIBuild nseAPIBuild;

    @KycCompletedOnly
    private ClientContext clientContext;

    @ActiveUserOnly
    private UserContext userContext;

    private BuyOrderRepository buyOrderRepository;

    private OrderLogRepository orderLogRepository;


    private static String ORDER_ENTRY_URI = "nsemfdesk/api/v2/transaction/NORMAL";
    private static String ORDER_ENTRY_SUCCESS_STATUS = "TRXN SUCCESS";

    @Override
    public void placeBuyOrder(@Valid List<BuyOrder> orders) {
        var translationDetails = orders.stream().map(order -> {
            var req = new BuySellDetails();
            req.setSchemeCode(order.getFund().getSchemeCode());
            req.setTransactionType("P");
            req.setBuySellType(buyOrderRepository.existsByFund(order.getFund()) ? "Fresh" : "Additional");
            req.setClientCode(clientContext.getClient().getClientCode());
            req.setOrderAmount(String.valueOf(order.getAmount()));
            req.setRefID(order.getId().toString());
            return req;
        }).toList();

        var response = makeOrderEntryRequest(new BuySellRequest(translationDetails));
        handleOrderResponse(response, orders);
    }

    @Override
    public void placeSellOrder(List<SellOrder> orders) {
        var translationDetails = orders.stream().map(order -> {
            var req = new BuySellDetails();
            req.setSchemeCode(order.getFund().getSchemeCode());
            req.setTransactionType("R");
            req.setClientCode(clientContext.getClient().getClientCode());
            req.setOrderQuantity(String.valueOf(order.getUnits()));
            req.setRefID(order.getId().toString());
            return req;
        }).toList();

        var response = makeOrderEntryRequest(new BuySellRequest(translationDetails));
        handleOrderResponse(response, orders);
    }

    @Override
    public void placeSIPOrder(List<SIPOrder> orders) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    private BuySellRequest makeOrderEntryRequest(BuySellRequest request) {
        var response = nseAPIBuild.build().post().uri(ORDER_ENTRY_URI).bodyValue(request).retrieve().bodyToMono(BuySellRequest.class).block();
        if (response == null || response.getTransactionDetails() == null || response.getTransactionDetails().isEmpty()) {
            throw new RuntimeException("Failed to place order");
        }
        return response;
    }

    private void handleOrderResponse(BuySellRequest response, List<? extends Order> orders) {
        response.getTransactionDetails().forEach(orderDetail -> {
            var order = orders.stream().filter(o -> Objects.equals(o.getId(), Long.parseLong(orderDetail.getRefID()))).findFirst().orElseThrow();
            order.setTxnID(orderDetail.getTrxnOrderId());

            if (Objects.equals(orderDetail.getTrxnStatus(), ORDER_ENTRY_SUCCESS_STATUS)) {
                order.setStatus(Order.OrderStatus.PLACED);
            } else {
                order.setStatus(Order.OrderStatus.FAILED);
            }
        });

        orderLogRepository.saveAll(orders.stream().map(order -> {
            var log = new com.nested.app.entity.OrderLog();
            log.setOrder(order);
            log.setStatus(order.getStatus());
            return log;
        }).toList());

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

    @JsonProperty("order_ref_number")
    private String refID;

    @JsonProperty("scheme_code")
    private String schemeCode;

    @JsonProperty("trxn_type")
    private String transactionType; // P - Purchase, R - Redemption

    @JsonProperty("buy_sell_type")
    private String buySellType; // Fresh / Additional

    @JsonProperty("client_code")
    private String clientCode;

    @JsonProperty("order_amount")
    private String orderAmount;

    @JsonProperty("redemption_units")
    private String orderQuantity;

    @JsonProperty("demat_physical")
    private String dematOrPhysical = "P"; // D / P

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