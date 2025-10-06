package com.nested.app.entity;

import com.nested.app.enums.IncomeSlab;
import com.nested.app.enums.IncomeSource;
import com.nested.app.enums.Occupation;
import com.nested.app.listeners.UserEntityListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.With;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Builder
@Table(name = "users")
@FilterDef(name = "userFilter", parameters = @ParamDef(name = "userId", type = Long.class))
@Filter(name = "userFilter", condition = "id = :userId")
@EntityListeners(UserEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED) // required by JPA
@AllArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @With
  @Column(nullable = false)
  private String name;

  @With
  @Email(message = "Invalid email format")
  private String email;

  // we are supporting phone number update
  @Column(unique = true, nullable = false, updatable = false)
  private String phoneNumber;

  @Column(unique = true, nullable = false, updatable = false)
  private String firebaseUid;

  @Column(unique = true)
  private String panNumber;

  @OneToMany private List<BankDetail> bankDetails;

  private Date dateOfBirth;

  @Enumerated(EnumType.STRING)
  private Gender gender;

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

  private String firstName;

  private String lastName;

  private String birthPlace;

  private String birthCountry;

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

  public enum Gender {
    MALE,
    FEMALE,
    TRANSGENDER,
  }

  public enum KYCStatus {
    UNKNOWN,
    PENDING,
    COMPLETED,
    FAILED
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
}
