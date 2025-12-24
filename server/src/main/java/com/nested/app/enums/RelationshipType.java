package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum RelationshipType {
  FATHER("father"),
  MOTHER("mother"),
  AUNT("aunt"),
  BROTHER("brother"),
  BROTHER_IN_LAW("brother_in_law"),
  DAUGHTER("daughter"),
  DAUGHTER_IN_LAW("daughter_in_law"),
  FATHER_IN_LAW("father_in_law"),
  GRAND_DAUGHTER("grand_daughter"),
  GRAND_FATHER("grand_father"),
  GRAND_MOTHER("grand_mother"),
  GRAND_SON("grand_son"),
  MOTHER_IN_LAW("mother_in_law"),
  NEPHEW("nephew"),
  NIECE("niece"),
  SISTER("sister"),
  SISTER_IN_LAW("sister_in_law"),
  SON("son"),
  SON_IN_LAW("son_in_law"),
  SPOUSE("spouse"),
  UNCLE("uncle"),
  OTHER("other"),
  COURT_APPOINTED_LEGAL_GUARDIAN("court_appointed_legal_guardian");

  @Getter @JsonValue private final String value;
}
