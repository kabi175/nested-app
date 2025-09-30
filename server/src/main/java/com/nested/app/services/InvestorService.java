package com.nested.app.services;

import com.nested.app.dto.InvestorDto;
import com.nested.app.entity.Investor;
import com.nested.app.exception.GlobalExceptionHandler;
import com.nested.app.repository.InvestorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service class for Investor entity operations
 * Handles business logic for investor management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvestorService {

    private final InvestorRepository investorRepository;

    /**
     * Create a new investor
     * @param investorDto investor data transfer object
     * @return created investor DTO
     * @throws IllegalArgumentException if email, client code, or PAN already exists
     */
    public InvestorDto createInvestor(InvestorDto investorDto) {
        log.info("Creating new investor with email: {}", investorDto.getEmail());
        
        try {
            // Validate unique constraints
            validateUniqueFields(investorDto, null);
            
            Investor investor = InvestorDto.toEntity(investorDto);
            Investor savedInvestor = investorRepository.save(investor);
            
            log.info("Successfully created investor with ID: {}", savedInvestor.getId());
            return InvestorDto.fromEntity(savedInvestor);
            
        } catch (Exception e) {
            log.error("Failed to create investor with email: {}. Error: {}", 
                     investorDto.getEmail(), e.getMessage());
            throw e;
        }
    }

    /**
     * Update an existing investor
     * @param id investor ID
     * @param investorDto investor data transfer object
     * @return updated investor DTO
     * @throws IllegalArgumentException if investor not found or unique constraints violated
     */
    public InvestorDto updateInvestor(Long id, InvestorDto investorDto) {
        log.info("Updating investor with ID: {}", id);
        
        try {
            Investor existingInvestor = investorRepository.findById(id)
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
     * @param id investor ID
     * @return investor DTO
     * @throws IllegalArgumentException if investor not found
     */
    @Transactional(readOnly = true)
    public InvestorDto getInvestorById(Long id) {
        log.debug("Fetching investor with ID: {}", id);
        
        Investor investor = investorRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));
        
        return InvestorDto.fromEntity(investor);
    }

    /**
     * Get investor with full details (addresses and bank details) by ID
     * @param id investor ID
     * @return investor DTO with all details
     * @throws IllegalArgumentException if investor not found
     */
    @Transactional(readOnly = true)
    public InvestorDto getInvestorWithDetails(Long id) {
        log.debug("Fetching investor with details for ID: {}", id);
        
        Investor investor = investorRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));
        
        return InvestorDto.fromEntity(investor);
    }

    /**
     * Get investor by email
     * @param email email address
     * @return investor DTO
     * @throws IllegalArgumentException if investor not found
     */
    @Transactional(readOnly = true)
    public InvestorDto getInvestorByEmail(String email) {
        log.debug("Fetching investor with email: {}", email);
        
        Investor investor = investorRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with email: " + email));
        
        return InvestorDto.fromEntity(investor);
    }

    /**
     * Get investor by client code
     * @param clientCode client code
     * @return investor DTO
     * @throws IllegalArgumentException if investor not found
     */
    @Transactional(readOnly = true)
    public InvestorDto getInvestorByClientCode(String clientCode) {
        log.debug("Fetching investor with client code: {}", clientCode);
        
        Investor investor = investorRepository.findByClientCode(clientCode)
            .orElseThrow(() -> new IllegalArgumentException("Investor not found with client code: " + clientCode));
        
        return InvestorDto.fromEntity(investor);
    }

    /**
     * Get all investors with pagination
     * @param pageable pagination information
     * @return page of investor DTOs
     */
    @Transactional(readOnly = true)
    public Page<InvestorDto> getAllInvestors(Pageable pageable) {
        log.debug("Fetching all investors with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Investor> investors = investorRepository.findAll(pageable);
        return investors.map(InvestorDto::fromEntity);
    }

    /**
     * Search investors by criteria
     * @param firstName first name (optional)
     * @param email email (optional)
     * @param kycStatus KYC status (optional)
     * @param pageable pagination information
     * @return page of investor DTOs
     */
    @Transactional(readOnly = true)
    public Page<InvestorDto> searchInvestors(String firstName, String email, 
                                           Investor.KYCStatus kycStatus, Pageable pageable) {
        log.debug("Searching investors with criteria - firstName: {}, email: {}, kycStatus: {}", 
                 firstName, email, kycStatus);
        
        Page<Investor> investors = investorRepository.findByCriteria(firstName, email, kycStatus, pageable);
        return investors.map(InvestorDto::fromEntity);
    }

    /**
     * Get investors by KYC status
     * @param kycStatus KYC status
     * @param pageable pagination information
     * @return page of investor DTOs
     */
    @Transactional(readOnly = true)
    public Page<InvestorDto> getInvestorsByKycStatus(Investor.KYCStatus kycStatus, Pageable pageable) {
        log.debug("Fetching investors with KYC status: {}", kycStatus);
        
        Page<Investor> investors = investorRepository.findByKycStatus(kycStatus, pageable);
        return investors.map(InvestorDto::fromEntity);
    }

    /**
     * Update investor KYC status
     * @param id investor ID
     * @param kycStatus new KYC status
     * @return updated investor DTO
     */
    public InvestorDto updateKycStatus(Long id, Investor.KYCStatus kycStatus) {
        log.info("Updating KYC status for investor ID: {} to {}", id, kycStatus);
        
        try {
            Investor investor = investorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + id));
            
            Investor.KYCStatus oldStatus = investor.getKycStatus();
            investor.setKycStatus(kycStatus);
            
            Investor updatedInvestor = investorRepository.save(investor);
            
            log.info("Successfully updated KYC status for investor ID: {} from {} to {}", 
                    id, oldStatus, kycStatus);
            return InvestorDto.fromEntity(updatedInvestor);
            
        } catch (Exception e) {
            log.error("Failed to update KYC status for investor ID: {}. Error: {}", id, e.getMessage());
            throw e;
        }
    }

    /**
     * Delete investor by ID
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
     * Check if investor exists by ID
     * @param id investor ID
     * @return true if investor exists
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return investorRepository.existsById(id);
    }

    /**
     * Get count of investors by KYC status
     * @param kycStatus KYC status
     * @return count of investors
     */
    @Transactional(readOnly = true)
    public long getCountByKycStatus(Investor.KYCStatus kycStatus) {
        log.debug("Getting count of investors with KYC status: {}", kycStatus);
        return investorRepository.countByKycStatus(kycStatus);
    }

    /**
     * Validate unique fields for create/update operations
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
                Optional<Investor> existingByClientCode = investorRepository.findByClientCode(investorDto.getClientCode());
                if (existingByClientCode.isPresent()) {
                    throw new IllegalArgumentException("Client code already exists: " + investorDto.getClientCode());
                }
            } else {
                if (investorRepository.existsByClientCodeAndIdNot(investorDto.getClientCode(), excludeId)) {
                    throw new IllegalArgumentException("Client code already exists: " + investorDto.getClientCode());
                }
            }
        }

        // Check PAN number uniqueness
        if (investorDto.getPanNumber() != null) {
            if (excludeId == null) {
                Optional<Investor> existingByPan = investorRepository.findByPanNumber(investorDto.getPanNumber());
                if (existingByPan.isPresent()) {
                    throw new IllegalArgumentException("PAN number already exists: " + investorDto.getPanNumber());
                }
            } else {
                if (investorRepository.existsByPanNumberAndIdNot(investorDto.getPanNumber(), excludeId)) {
                    throw new IllegalArgumentException("PAN number already exists: " + investorDto.getPanNumber());
                }
            }
        }
    }

    /**
     * Update investor fields from DTO
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
