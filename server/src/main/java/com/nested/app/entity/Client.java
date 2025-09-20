package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    private String middleName;

    @Column(nullable = false)
    private TaxStatus taxStatus = TaxStatus.INDIVIDUAL;

    @Column(nullable = true)
    private Gender gender;

    private LocalDateTime dateOfBirth; // YYYY-MM-DD

    private Occupation occupation;

    @Column(unique = true)
    private String panNumber;


    // Only Single holdingNature is currently supported
    @Column(nullable = false)
    private HoldingNature holdingNature = HoldingNature.SINGLE;

    @OneToMany(mappedBy="client")
    private List<BankDetail> bankDetails;

    public static enum TaxStatus {
        INDIVIDUAL,
        ON_BEHALF_OF_MINOR,
        HUF,
        CORPORATE,
        NRE,
        NRO
    }

    public static enum Gender {
        MALE,
        FEMALE,
        OTHER,
        TRANS,
    }

    public static enum Occupation {
        SERVICE,
        BUSINESS,
        PROFESSIONAL,
        AGRICULTURE,
        RETIRED,
        HOUSEWIFE,
        STUDENT,
        OTHER
    }

    public static enum HoldingNature {
        SINGLE,
        JOINT,
        ASSOCIATION,
    }

}
