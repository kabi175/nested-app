package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
  private final boolean systematic = true;
  private final String number_of_installments = "30";
  private final String payment_method = "mandate";

  @JsonIgnore @Builder.Default @NotNull OrderType order_type = OrderType.SIP;

  @JsonProperty("payment_source")
  String mandateID;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("start_date")
  LocalDate startDate;

  @JsonProperty("first_order_today")
  boolean firstOrderToday;

  @Builder.Default String frequency = "monthly";

  @JsonProperty("installment_day")
  private String installmentDay;
}
