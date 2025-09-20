package com.nested.app.nse;

import com.nested.app.contect.ClientContext;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Client;
import com.nested.app.entity.Fund;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SellOrder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Abstract service for handling orders related to a specific client context.
 * This service provides methods to place buy, sell, and SIP orders for funds.
 * Concrete implementations should provide the actual logic for these operations.
 */
@Service
public abstract class OrderService {
    protected final ClientContext context;

    protected OrderService(ClientContext context) {
        this.context = context;
    }

    /**
     * Place a buy order for the specified fund.
     * @param orders - List of BuyOrder objects containing order details.
     */
    public abstract void placeBuyOrder(List<BuyOrder> orders);

    /**
     * Place a sell order for the specified fund.
     * @param orders - List of SellOrder objects containing order details.
     */
    public abstract void placeSellOrder(List<SellOrder> orders);

    /**
     * Place a SIP order for the specified fund.
     * @param orders - List of SIPOrder objects containing order details.
     */
    public abstract void placeSIPOrder(List<SIPOrder> orders);
}
