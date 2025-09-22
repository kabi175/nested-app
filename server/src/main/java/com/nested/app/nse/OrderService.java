package com.nested.app.nse;

import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SellOrder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Abstract service for handling orders related to a specific client context.
 * This service provides methods to place buy, sell, and SIP orders for funds.
 * Concrete implementations should provide the actual logic for these operations.
 */
@Service
@Validated
public interface OrderService {

    /**
     * Place a buy order for the specified fund.
     *
     * @param orders - List of BuyOrder objects containing order details.
     */
    void placeBuyOrder(@Valid @NotEmpty @NotNull List<BuyOrder> orders);

    /**
     * Place a sell order for the specified fund.
     *
     * @param orders - List of SellOrder objects containing order details.
     */
    void placeSellOrder(@Valid @NotEmpty @NotNull List<SellOrder> orders);

    /**
     * Place a SIP order for the specified fund.
     *
     * @param orders - List of SIPOrder objects containing order details.
     */
    void placeSIPOrder(@Valid @NotEmpty @NotNull List<SIPOrder> orders);
}
