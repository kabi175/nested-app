package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nested.app.entity.BankDetail;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Data Transfer Object for BankDetail entity
 * Used for API requests and responses to transfer bank detail data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bank detail information")
public class BankDetailDto {

    @Schema(description = "Unique identifier of the bank detail", example = "1")
    private Long id;

    @Schema(description = "Investor ID associated with this bank detail", example = "1")
    private Long investorId;

    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name cannot exceed 100 characters")
    @Schema(description = "Name of the bank", example = "State Bank of India", required = true)
    private String bankName;

    @NotBlank(message = "Account number is required")
    @Pattern(regexp = "^[0-9]{9,18}$", message = "Account number must be between 9 and 18 digits")
    @Schema(description = "Bank account number", example = "1234567890123456", required = true)
    private String accountNumber;

    @NotNull(message = "Account type is required")
    @Schema(description = "Type of bank account", example = "SAVINGS", required = true)
    private BankDetail.AccountType accountType;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "IFSC code format is invalid")
    @Schema(description = "IFSC code of the bank branch", example = "SBIN0001234", required = true)
    private String ifscCode;

    @NotNull(message = "Primary flag is required")
    @Schema(description = "Whether this is the primary bank account", example = "true", required = true)
    private Boolean isPrimary;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Creation timestamp", example = "2023-01-15 10:30:00")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Last update timestamp", example = "2023-01-15 10:30:00")
    private Date updatedAt;

    /**
     * Converts BankDetail entity to BankDetailDto
     * @param entity BankDetail entity
     * @return BankDetailDto
     */
    public static BankDetailDto fromEntity(BankDetail entity) {
        BankDetailDto dto = new BankDetailDto();
        dto.setId(entity.getId());
        dto.setInvestorId(entity.getInvestor() != null ? entity.getInvestor().getId() : null);
        dto.setBankName(entity.getBankName());
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setAccountType(entity.getAccountType());
        dto.setIfscCode(entity.getIfscCode());
        dto.setIsPrimary(entity.isPrimary());
        return dto;
    }

    /**
     * Converts BankDetailDto to BankDetail entity
     * @param dto BankDetailDto
     * @return BankDetail entity
     */
    public static BankDetail toEntity(BankDetailDto dto) {
        BankDetail entity = new BankDetail();
        entity.setId(dto.getId());
        entity.setBankName(dto.getBankName());
        entity.setAccountNumber(dto.getAccountNumber());
        entity.setAccountType(dto.getAccountType());
        entity.setIfscCode(dto.getIfscCode());
        entity.setPrimary(dto.getIsPrimary());
        return entity;
    }
}
