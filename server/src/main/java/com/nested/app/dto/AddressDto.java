package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nested.app.entity.Address;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Data Transfer Object for Address entity
 * Used for API requests and responses to transfer address data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Address information")
public class AddressDto {

    @Schema(description = "Unique identifier of the address", example = "1")
    private Long id;

    @Schema(description = "Investor ID associated with this address", example = "1")
    private Long investorId;

    @NotBlank(message = "Address line is required")
    @Size(max = 255, message = "Address line cannot exceed 255 characters")
    @Schema(description = "Address line", example = "123 Main Street, Apartment 4B", required = true)
    private String addressLine;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name cannot exceed 100 characters")
    @Schema(description = "City name", example = "Mumbai", required = true)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State name cannot exceed 100 characters")
    @Schema(description = "State name", example = "Maharashtra", required = true)
    private String state;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name cannot exceed 100 characters")
    @Schema(description = "Country name", example = "India", required = true)
    private String country;

    @NotBlank(message = "Pin code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pin code must be 6 digits")
    @Schema(description = "Pin code", example = "400001", required = true)
    private String pinCode;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Creation timestamp", example = "2023-01-15 10:30:00")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Last update timestamp", example = "2023-01-15 10:30:00")
    private Date updatedAt;

    /**
     * Converts Address entity to AddressDto
     * @param entity Address entity
     * @return AddressDto
     */
    public static AddressDto fromEntity(Address entity) {
        AddressDto dto = new AddressDto();
        dto.setId(entity.getId());
        dto.setInvestorId(entity.getInvestor() != null ? entity.getInvestor().getId() : null);
        dto.setAddressLine(entity.getAddressLine());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setCountry(entity.getCountry());
        dto.setPinCode(entity.getPinCode());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    /**
     * Converts AddressDto to Address entity
     * @param dto AddressDto
     * @return Address entity
     */
    public static Address toEntity(AddressDto dto) {
        Address entity = new Address();
        entity.setId(dto.getId());
        entity.setAddressLine(dto.getAddressLine());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setCountry(dto.getCountry());
        entity.setPinCode(dto.getPinCode());
        return entity;
    }
}
