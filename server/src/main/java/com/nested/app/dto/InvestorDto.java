package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Investor;
import com.nested.app.enums.IncomeSlab;
import com.nested.app.enums.IncomeSource;
import com.nested.app.enums.Occupation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object for Investor entity
 * Used for API requests and responses to transfer investor data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Investor information")
public class InvestorDto {

    @Schema(description = "Unique identifier of the investor", example = "1")
    private Long id;

    @NotBlank(message = "First name is required")
    @Schema(description = "First name of the investor", example = "John", required = true)
    private String firstName;

    @Schema(description = "Last name of the investor", example = "Doe")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "Email address of the investor", example = "john.doe@example.com", required = true)
    private String email;

    @NotBlank(message = "Client code is required")
    @Schema(description = "Unique client code for the investor", example = "CLI001", required = true)
    private String clientCode;

    @NotNull(message = "Income source is required")
    @Schema(description = "Source of income", example = "SALARY", required = true)
    private IncomeSource incomeSource;

    @NotNull(message = "Income slab is required")
    @Schema(description = "Income slab category", example = "MEDIUM", required = true)
    private IncomeSlab incomeSlab;

    @Schema(description = "Type of investor", example = "individual")
    private String investorType = "individual";

    @NotNull(message = "Gender is required")
    @Schema(description = "Gender of the investor", example = "MALE", required = true)
    private Investor.Gender gender;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(description = "Date of birth", example = "1990-01-15")
    private Date dateOfBirth;

    @Schema(description = "Occupation of the investor", example = "PROFESSIONAL")
    private Occupation occupation = Occupation.PROFESSIONAL;

    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "PAN number format is invalid")
    @Schema(description = "PAN number", example = "ABCDE1234F")
    private String panNumber;

    @Schema(description = "Place of birth", example = "Mumbai")
    private String birthPlace;

    @Schema(description = "Country of birth", example = "India")
    private String birthCountry;

    @Schema(description = "KYC status", example = "COMPLETED")
    private Investor.KYCStatus kycStatus = Investor.KYCStatus.UNKNOWN;

    @Schema(description = "Address associated with the investor")
    private AddressDto address;

    @Schema(description = "List of bank details associated with the investor")
    @JsonProperty("bankDetails")
    private List<BankDetailDto> bankDetails;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Creation timestamp", example = "2023-01-15 10:30:00")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Last update timestamp", example = "2023-01-15 10:30:00")
    private Date updatedAt;

    /**
     * Converts Investor entity to InvestorDto
     * @param entity Investor entity
     * @return InvestorDto
     */
    public static InvestorDto fromEntity(Investor entity) {
        InvestorDto dto = new InvestorDto();
        dto.setId(entity.getId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setClientCode(entity.getClientCode());
        dto.setIncomeSource(entity.getIncomeSource());
        dto.setIncomeSlab(entity.getIncomeSlab());
        dto.setInvestorType(entity.getInvestorType());
        dto.setGender(entity.getGender());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setOccupation(entity.getOccupation());
        dto.setPanNumber(entity.getPanNumber());
        dto.setBirthPlace(entity.getBirthPlace());
        dto.setBirthCountry(entity.getBirthCountry());
        dto.setKycStatus(entity.getKycStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        dto.setAddress(AddressDto.fromEntity(entity.getAddress()));
        
        // Convert bank details
        if (entity.getBankDetails() != null) {
            dto.setBankDetails(entity.getBankDetails().stream()
                .map(BankDetailDto::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    /**
     * Converts InvestorDto to Investor entity
     * @param dto InvestorDto
     * @return Investor entity
     */
    public static Investor toEntity(InvestorDto dto) {
        Investor entity = new Investor();
        entity.setId(dto.getId());
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setClientCode(dto.getClientCode());
        entity.setIncomeSource(dto.getIncomeSource());
        entity.setIncomeSlab(dto.getIncomeSlab());
        entity.setInvestorType(dto.getInvestorType());
        entity.setGender(dto.getGender());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setOccupation(dto.getOccupation());
        entity.setPanNumber(dto.getPanNumber());
        entity.setBirthPlace(dto.getBirthPlace());
        entity.setBirthCountry(dto.getBirthCountry());
        entity.setKycStatus(dto.getKycStatus());
        return entity;
    }
}
