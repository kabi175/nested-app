package com.nested.app.client.tarrakki.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class SipOrderDetail extends OrderDetail {
  @Builder.Default @NotNull OrderType order_type = OrderType.SIP;

  @JsonProperty("mandate_id")
  String mandateID;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("start_date")
  LocalDate startDate;

  @JsonProperty("first_order_today")
  boolean firstOrderToday;

  @Builder.Default String frequency = "monthly";
}
