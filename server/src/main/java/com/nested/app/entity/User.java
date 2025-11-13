package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.enums.IncomeSlab;
import com.nested.app.enums.IncomeSource;
import com.nested.app.enums.Occupation;
import com.nested.app.listeners.UserEntityListener;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import lombok.With;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Builder
@ToString
@Table(name = "users")
@FilterDef(name = "userFilter", parameters = @ParamDef(name = "userId", type = Long.class))
@Filter(name = "userFilter", condition = "id = :userId")
@EntityListeners(UserEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED) // required by JPA
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
public class User {

  @Id
  @EqualsAndHashCode.Include
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @With
  @Email(message = "Invalid email format")
  private String email;

  // we not are supporting phone number update
  private String phoneNumber;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private MaritalStatus maritalStatus = MaritalStatus.MARRIED;

  @Column(unique = true, nullable = false, updatable = false)
  private String firebaseUid;

  @With private String panNumber;

  @OneToMany private List<BankDetail> bankDetails;

  @With private Date dateOfBirth;

  @With @Builder.Default private boolean isPep = false;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private Gender gender = Gender.MALE;

  @With
  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(name = "address_id")
  private Address address;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private KYCStatus kycStatus = KYCStatus.UNKNOWN;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  // admin only has write access
  @Column(nullable = false)
  @Builder.Default
  private boolean isActive = true;

  @With private String firstName;

  @With private String lastName;

  @With private String fatherName;

  @With private String birthPlace;

  @With @Builder.Default private String birthCountry = "India";

  // admin only has write access
  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role = Role.STANDARD;

  @Column(unique = true)
  private String clientCode;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private IncomeSource incomeSource = IncomeSource.SALARY;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private IncomeSlab incomeSlab = IncomeSlab.ABOVE_5_LAC_UPTO_10_LAC;

  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  private Occupation occupation = Occupation.PROFESSIONAL;

  @OneToOne
  @JoinColumn(name = "investor_id")
  private Investor investor;

  // admin only has write access
  @With
  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PrefillStatus prefillStatus = PrefillStatus.INCOMPLETE;

  @With
  @Column(name = "aadhaar_last4", length = 4)
  private String aadhaarLast4;

  @With
  @Column(name = "signature")
  private String signatureFileID;

  @RequiredArgsConstructor
  public enum Gender {
    MALE("male"),
    FEMALE("female"),
    TRANSGENDER("transgender");

    @JsonValue @Getter private final String value;
  }

  @RequiredArgsConstructor
  public enum KYCStatus {
    UNKNOWN("unknown"),
    PENDING("pending"),
    AADHAAR_PENDING("aadhaar_pending"),
    E_SIGN_PENDING("esign_pending"),
    SUBMITTED("submitted"),
    COMPLETED("completed"),
    FAILED("failed");
    @JsonValue @Getter private final String value;
  }

  public enum Role {
    STANDARD,
    ADMIN
  }

  public enum PrefillStatus {
    INCOMPLETE,
    FAILED_WITH_INVALID_NAME_OR_PHONE_NUMBER,
    UNKNOWN_FAILURE,
    COMPLETED,
    FAILED_WITH_INVALID_PHONE_NUMBER_FORAMATE
  }

  @RequiredArgsConstructor
  public enum MaritalStatus {
    MARRIED("married"),
    UNMARRIED("unmarried"),
    OTHERS("others");
    @Getter @JsonValue private final String value;
  }
}
