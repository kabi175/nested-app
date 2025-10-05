package com.nested.app.services;

import com.google.firebase.auth.UserRecord;
import com.nested.app.client.bulkpe.PrefilClient;
import com.nested.app.client.bulkpe.dto.PrefilRequest;
import com.nested.app.client.bulkpe.dto.PrefillResponse;
import com.nested.app.dto.InvestorDto;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.exception.GlobalExceptionHandler;
import com.nested.app.repository.InvestorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Optional;

/** Service class for Investor entity operations Handles business logic for investor management */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvestorService {

  private final InvestorRepository investorRepository;

  /**
   * Update an existing investor
   *
   * @param id investor ID
   * @param investorDto investor data transfer object
   * @return updated investor DTO
   * @throws IllegalArgumentException if investor not found or unique constraints violated
   */
  public InvestorDto updateInvestor(Long id, InvestorDto investorDto) {
    log.info("Updating investor with ID: {}", id);

    try {
      Investor existingInvestor =
          investorRepository
              .findById(id)
              .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));

      // Validate unique constraints for update
      validateUniqueFields(investorDto, id);

      // Update fields
      updateInvestorFields(existingInvestor, investorDto);

      Investor updatedInvestor = investorRepository.save(existingInvestor);

      log.info("Successfully updated investor with ID: {}", id);
      return InvestorDto.fromEntity(updatedInvestor);

    } catch (Exception e) {
      log.error("Failed to update investor with ID: {}. Error: {}", id, e.getMessage());
      throw e;
    }
  }

  /**
   * Get investor by ID
   *
   * @param id investor ID
   * @return investor DTO
   * @throws IllegalArgumentException if investor not found
   */
  @Transactional(readOnly = true)
  public InvestorDto getInvestorById(Long id) {
    log.debug("Fetching investor with ID: {}", id);

    Investor investor =
        investorRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));

    return InvestorDto.fromEntity(investor);
  }

  /**
   * Get investor with full details (addresses and bank details) by ID
   *
   * @param id investor ID
   * @return investor DTO with all details
   * @throws IllegalArgumentException if investor not found
   */
  @Transactional(readOnly = true)
  public InvestorDto getInvestorWithDetails(Long id) {
    log.debug("Fetching investor with details for ID: {}", id);

    Investor investor =
        investorRepository
            .findByIdWithDetails(id)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));

    return InvestorDto.fromEntity(investor);
  }

  /**
   * Delete investor by ID
   *
   * @param id investor ID
   * @throws IllegalArgumentException if investor not found
   */
  public void deleteInvestor(Long id) {
    log.info("Deleting investor with ID: {}", id);

    try {
      if (!investorRepository.existsById(id)) {
        throw new IllegalArgumentException("Investor not found with ID: " + id);
      }

      investorRepository.deleteById(id);
      log.info("Successfully deleted investor with ID: {}", id);

    } catch (Exception e) {
      log.error("Failed to delete investor with ID: {}. Error: {}", id, e.getMessage());
      throw e;
    }
  }

  /**
   * Validate unique fields for create/update operations
   *
   * @param investorDto investor DTO
   * @param excludeId ID to exclude from validation (for updates)
   */
  private void validateUniqueFields(InvestorDto investorDto, Long excludeId) {
    // Check email uniqueness
    if (investorDto.getEmail() != null) {
      if (excludeId == null) {
        Optional<Investor> existingByEmail = investorRepository.findByEmail(investorDto.getEmail());
        if (existingByEmail.isPresent()) {
          throw new IllegalArgumentException("Email already exists: " + investorDto.getEmail());
        }
      } else {
        if (investorRepository.existsByEmailAndIdNot(investorDto.getEmail(), excludeId)) {
          throw new IllegalArgumentException("Email already exists: " + investorDto.getEmail());
        }
      }
    }

    // Check client code uniqueness
    if (investorDto.getClientCode() != null) {
      if (excludeId == null) {
        Optional<Investor> existingByClientCode =
            investorRepository.findByClientCode(investorDto.getClientCode());
        if (existingByClientCode.isPresent()) {
          throw new IllegalArgumentException(
              "Client code already exists: " + investorDto.getClientCode());
        }
      } else {
        if (investorRepository.existsByClientCodeAndIdNot(investorDto.getClientCode(), excludeId)) {
          throw new IllegalArgumentException(
              "Client code already exists: " + investorDto.getClientCode());
        }
      }
    }

    // Check PAN number uniqueness
    if (investorDto.getPanNumber() != null) {
      if (excludeId == null) {
        Optional<Investor> existingByPan =
            investorRepository.findByPanNumber(investorDto.getPanNumber());
        if (existingByPan.isPresent()) {
          throw new IllegalArgumentException(
              "PAN number already exists: " + investorDto.getPanNumber());
        }
      } else {
        if (investorRepository.existsByPanNumberAndIdNot(investorDto.getPanNumber(), excludeId)) {
          throw new IllegalArgumentException(
              "PAN number already exists: " + investorDto.getPanNumber());
        }
      }
    }
  }

  /**
   * Update investor fields from DTO
   *
   * @param investor existing investor entity
   * @param investorDto investor DTO with new data
   */
  private void updateInvestorFields(Investor investor, InvestorDto investorDto) {
    if (investorDto.getFirstName() != null) {
      investor.setFirstName(investorDto.getFirstName());
    }
    if (investorDto.getLastName() != null) {
      investor.setLastName(investorDto.getLastName());
    }
    if (investorDto.getEmail() != null) {
      investor.setEmail(investorDto.getEmail());
    }
    if (investorDto.getClientCode() != null) {
      investor.setClientCode(investorDto.getClientCode());
    }
    if (investorDto.getIncomeSource() != null) {
      investor.setIncomeSource(investorDto.getIncomeSource());
    }
    if (investorDto.getIncomeSlab() != null) {
      investor.setIncomeSlab(investorDto.getIncomeSlab());
    }
    if (investorDto.getInvestorType() != null) {
      investor.setInvestorType(investorDto.getInvestorType());
    }
    if (investorDto.getGender() != null) {
      investor.setGender(investorDto.getGender());
    }
    if (investorDto.getDateOfBirth() != null) {
      investor.setDateOfBirth(investorDto.getDateOfBirth());
    }
    if (investorDto.getOccupation() != null) {
      investor.setOccupation(investorDto.getOccupation());
    }
    if (investorDto.getPanNumber() != null) {
      investor.setPanNumber(investorDto.getPanNumber());
    }
    if (investorDto.getBirthPlace() != null) {
      investor.setBirthPlace(investorDto.getBirthPlace());
    }
    if (investorDto.getBirthCountry() != null) {
      investor.setBirthCountry(investorDto.getBirthCountry());
    }
    if (investorDto.getKycStatus() != null) {
      investor.setKycStatus(investorDto.getKycStatus());
    }
  }
}
