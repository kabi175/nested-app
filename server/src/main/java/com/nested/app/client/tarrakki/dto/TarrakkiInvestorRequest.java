package com.nested.app.client.tarrakki.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class TarrakkiInvestorRequest {
  private InvestorType investor_type;
  private String first_name;
  private String last_name;
  private LocalDate dob;
  private Gender gender;
  private String pan;
  private String email;
  private String mobile;
  private AddressDTO address;
  private String email_declaration;
  private String mobile_declaration;
  private FatcaDetailDTO fatca_detail;
  public enum InvestorType {
    INDIVIDUAL,
    MINOR
  }
  public enum Gender {
    MALE,
    FEMALE,
    OTHER
  }

  @Data
  public static class FatcaDetailDTO {
    private String occupation;
    private String income_source;
    private String income_slab;
    private String birth_place;
    private String birth_country;
  }

  @Data
  public static class AddressDTO {
    private String address_line_1;
    private String address_line_2;
    private String address_line_3;
    private String city;
    private String state;
    private String country;
    private String pincode;
  }
}
