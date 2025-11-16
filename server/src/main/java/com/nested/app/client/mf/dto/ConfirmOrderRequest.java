package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConfirmOrderRequest {
  List<String> buyOrders;

  List<String> sipOrders;

  String email;
  @JsonIgnore private String mobile;
}
