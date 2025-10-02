package com.nested.app.entity;

import com.nested.app.enums.IncomeSlab;
import com.nested.app.enums.IncomeSource;
import com.nested.app.enums.Occupation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "investors")
public class Investor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    @Column(nullable = false)
    private String email;

    private String birthPlace;

    private String birthCountry;

    @Column(nullable = false, unique = true)
    private String clientCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncomeSource incomeSource = IncomeSource.SALARY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncomeSlab incomeSlab = IncomeSlab.BELOW_1_LAC;

    private String investorType = "individual";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender = Gender.MALE;

    private Date dateOfBirth; // YYYY-MM-DD

    private Occupation occupation = Occupation.PROFESSIONAL;

    @Column(unique = true)
    private String panNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KYCStatus kycStatus = KYCStatus.UNKNOWN;

    @OneToMany
    private List<BankDetail> bankDetails;

  @OneToOne
  @JoinColumn(name = "address_id")
  private Address address;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Timestamp updatedAt;


    public enum Gender {
        MALE,
        FEMALE,
        TRANSGENDER,
    }

    public enum KYCStatus {
        UNKNOWN, PENDING, COMPLETED, FAILED
    }
}
