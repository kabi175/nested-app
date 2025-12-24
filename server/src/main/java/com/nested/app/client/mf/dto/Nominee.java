package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.RelationshipType;
import java.util.Date;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Nominee {
  private String id;

  @JsonProperty("profile")
  private String investorID;

  private String name;

  private RelationshipType relationship;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private Date date;

  private String pan;

  @JsonProperty("email_address")
  private String email;

  private String address;

  @JsonProperty("guardian_name")
  private String guardianName;

  @JsonProperty("guardian_email_address")
  private String guardianEmail;

  @JsonProperty("guardian_pan")
  private String guardianPan;

  @JsonProperty("guardian_address")
  private String guardianAddress;
}
