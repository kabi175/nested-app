package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KycVerificationRequest {
  @JsonIgnore private String pan;
  @JsonIgnore private String name;
  @JsonIgnore private Date dob;

  @JsonProperty("investor_identifier")
  public String getIdentifier() {
    return pan;
  }

  @JsonProperty("pan")
  public Map<String, String> getPan() {
    return Map.of("value", pan);
  }

  @JsonProperty("name")
  public Map<String, String> getName() {
    return Map.of("value", name);
  }

  @JsonProperty("date_of_birth")
  public Map<String, String> getDOB() {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String formattedDate = sdf.format(dob);
    return Map.of("value", formattedDate);
  }
}
