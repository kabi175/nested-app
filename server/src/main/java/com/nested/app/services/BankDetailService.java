package com.nested.app.services;

import com.nested.app.dto.BankDetailDto;
import com.nested.app.entity.BankDetail;
import com.nested.app.entity.Investor;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.InvestorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for BankDetail entity operations
 * Handles business logic for bank detail management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BankDetailService {

    private final BankDetailRepository bankDetailRepository;
    private final InvestorRepository investorRepository;

    /**
     * Create a new bank detail for an investor
     * @param investorId investor ID
     * @param bankDetailDto bank detail data transfer object
     * @return created bank detail DTO
     * @throws IllegalArgumentException if investor not found or account number already exists
     */
    public BankDetailDto createBankDetail(Long investorId, BankDetailDto bankDetailDto) {
        log.info("Creating new bank detail for investor ID: {}", investorId);
        
        try {
            // Validate investor exists
            Investor investor = investorRepository.findById(investorId)
                .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + investorId));
            
            // Validate unique account number
            validateUniqueAccountNumber(bankDetailDto.getAccountNumber(), null);
            
            BankDetail bankDetail = BankDetailDto.toEntity(bankDetailDto);
            bankDetail.setInvestor(investor);
            
            // If this is set as primary, unset other primary accounts
            if (bankDetail.isPrimary()) {
                // SECURITY FIX: Load entities first (automatically filtered by entity-level authorization)
                // This ensures users can only modify their own bank details
                List<BankDetail> existingBankDetails = bankDetailRepository.findByInvestorId(investorId);
                // If empty, means investor doesn't belong to current user (filtered out)
                if (!existingBankDetails.isEmpty()) {
                    existingBankDetails.forEach(bd -> bd.setPrimary(false));
                    bankDetailRepository.saveAll(existingBankDetails);
                }
            }
            
            BankDetail savedBankDetail = bankDetailRepository.save(bankDetail);
            
            log.info("Successfully created bank detail with ID: {} for investor ID: {}", 
                    savedBankDetail.getId(), investorId);
            return BankDetailDto.fromEntity(savedBankDetail);
            
        } catch (Exception e) {
            log.error("Failed to create bank detail for investor ID: {}. Error: {}", 
                     investorId, e.getMessage());
            throw e;
        }
    }

    /**
     * Update an existing bank detail
     * @param bankDetailId bank detail ID
     * @param bankDetailDto bank detail data transfer object
     * @return updated bank detail DTO
     * @throws IllegalArgumentException if bank detail not found or account number already exists
     */
    public BankDetailDto updateBankDetail(Long bankDetailId, BankDetailDto bankDetailDto) {
        log.info("Updating bank detail with ID: {}", bankDetailId);
        
        try {
            BankDetail existingBankDetail = bankDetailRepository.findById(bankDetailId)
                .orElseThrow(() -> new IllegalArgumentException("Bank detail not found with ID: " + bankDetailId));
            
            // Validate unique account number for update
            validateUniqueAccountNumber(bankDetailDto.getAccountNumber(), bankDetailId);
            
            // If this is being set as primary, unset other primary accounts for the same investor
            if (bankDetailDto.getIsPrimary() != null && bankDetailDto.getIsPrimary() && 
                existingBankDetail.getInvestor() != null) {
                // SECURITY FIX: Load entities first (automatically filtered by entity-level authorization)
                // This ensures users can only modify their own bank details
                List<BankDetail> existingBankDetails = bankDetailRepository.findByInvestorId(
                    existingBankDetail.getInvestor().getId());
                // If empty, means investor doesn't belong to current user (filtered out)
                if (!existingBankDetails.isEmpty()) {
                    existingBankDetails.forEach(bd -> bd.setPrimary(false));
                    bankDetailRepository.saveAll(existingBankDetails);
                }
            }
            
            // Update fields
            updateBankDetailFields(existingBankDetail, bankDetailDto);
            
            BankDetail updatedBankDetail = bankDetailRepository.save(existingBankDetail);
            
            log.info("Successfully updated bank detail with ID: {}", bankDetailId);
            return BankDetailDto.fromEntity(updatedBankDetail);
            
        } catch (Exception e) {
            log.error("Failed to update bank detail with ID: {}. Error: {}", bankDetailId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get bank detail by ID
     * @param bankDetailId bank detail ID
     * @return bank detail DTO
     * @throws IllegalArgumentException if bank detail not found
     */
    @Transactional(readOnly = true)
    public BankDetailDto getBankDetailById(Long bankDetailId) {
        log.debug("Fetching bank detail with ID: {}", bankDetailId);
        
        BankDetail bankDetail = bankDetailRepository.findById(bankDetailId)
            .orElseThrow(() -> new IllegalArgumentException("Bank detail not found with ID: " + bankDetailId));
        
        return BankDetailDto.fromEntity(bankDetail);
    }

    /**
     * Get all bank details for a specific investor
     * @param investorId investor ID
     * @return list of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public List<BankDetailDto> getBankDetailsByInvestorId(Long investorId) {
        log.debug("Fetching bank details for investor ID: {}", investorId);
        
        List<BankDetail> bankDetails = bankDetailRepository.findByInvestorId(investorId);
        return bankDetails.stream()
            .map(BankDetailDto::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Get bank details for a specific investor with pagination
     * @param investorId investor ID
     * @param pageable pagination information
     * @return page of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public Page<BankDetailDto> getBankDetailsByInvestorId(Long investorId, Pageable pageable) {
        log.debug("Fetching bank details for investor ID: {} with pagination", investorId);
        
        Page<BankDetail> bankDetails = bankDetailRepository.findByInvestorId(investorId, pageable);
        return bankDetails.map(BankDetailDto::fromEntity);
    }

    /**
     * Get primary bank detail for a specific investor
     * @param investorId investor ID
     * @return primary bank detail DTO
     * @throws IllegalArgumentException if no primary bank detail found
     */
    @Transactional(readOnly = true)
    public BankDetailDto getPrimaryBankDetailByInvestorId(Long investorId) {
        log.debug("Fetching primary bank detail for investor ID: {}", investorId);
        
        BankDetail bankDetail = bankDetailRepository.findByInvestorIdAndIsPrimaryTrue(investorId)
            .orElseThrow(() -> new IllegalArgumentException("No primary bank detail found for investor ID: " + investorId));
        
        return BankDetailDto.fromEntity(bankDetail);
    }

    /**
     * Get all bank details with pagination
     * @param pageable pagination information
     * @return page of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public Page<BankDetailDto> getAllBankDetails(Pageable pageable) {
        log.debug("Fetching all bank details with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<BankDetail> bankDetails = bankDetailRepository.findAll(pageable);
        return bankDetails.map(BankDetailDto::fromEntity);
    }

    /**
     * Search bank details by criteria
     * @param investorId investor ID (optional)
     * @param bankName bank name (optional)
     * @param accountType account type (optional)
     * @param isPrimary primary flag (optional)
     * @param pageable pagination information
     * @return page of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public Page<BankDetailDto> searchBankDetails(Long investorId, String bankName, 
                                               BankDetail.AccountType accountType, Boolean isPrimary, 
                                               Pageable pageable) {
        log.debug("Searching bank details with criteria - investorId: {}, bankName: {}, accountType: {}, isPrimary: {}", 
                 investorId, bankName, accountType, isPrimary);
        
        Page<BankDetail> bankDetails = bankDetailRepository.findByCriteria(investorId, bankName, accountType, isPrimary, pageable);
        return bankDetails.map(BankDetailDto::fromEntity);
    }

    /**
     * Get bank details by bank name
     * @param bankName bank name
     * @param pageable pagination information
     * @return page of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public Page<BankDetailDto> getBankDetailsByBankName(String bankName, Pageable pageable) {
        log.debug("Fetching bank details by bank name: {}", bankName);
        
        Page<BankDetail> bankDetails = bankDetailRepository.findByBankNameContainingIgnoreCase(bankName, pageable);
        return bankDetails.map(BankDetailDto::fromEntity);
    }

    /**
     * Get bank details by IFSC code
     * @param ifscCode IFSC code
     * @return list of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public List<BankDetailDto> getBankDetailsByIfscCode(String ifscCode) {
        log.debug("Fetching bank details by IFSC code: {}", ifscCode);
        
        List<BankDetail> bankDetails = bankDetailRepository.findByIfscCode(ifscCode);
        return bankDetails.stream()
            .map(BankDetailDto::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Get bank details by account type
     * @param accountType account type
     * @param pageable pagination information
     * @return page of bank detail DTOs
     */
    @Transactional(readOnly = true)
    public Page<BankDetailDto> getBankDetailsByAccountType(BankDetail.AccountType accountType, Pageable pageable) {
        log.debug("Fetching bank details by account type: {}", accountType);
        
        Page<BankDetail> bankDetails = bankDetailRepository.findByAccountType(accountType, pageable);
        return bankDetails.map(BankDetailDto::fromEntity);
    }

    /**
     * Set a bank detail as primary for an investor
     * @param bankDetailId bank detail ID
     * @return updated bank detail DTO
     */
    public BankDetailDto setAsPrimary(Long bankDetailId) {
        log.info("Setting bank detail ID: {} as primary", bankDetailId);
        
        try {
            BankDetail bankDetail = bankDetailRepository.findById(bankDetailId)
                .orElseThrow(() -> new IllegalArgumentException("Bank detail not found with ID: " + bankDetailId));
            
            if (bankDetail.getInvestor() == null) {
                throw new IllegalArgumentException("Bank detail is not associated with any investor");
            }
            
            // SECURITY FIX: Load entities first (automatically filtered by entity-level authorization)
            // This ensures users can only modify their own bank details
            List<BankDetail> existingBankDetails = bankDetailRepository.findByInvestorId(
                bankDetail.getInvestor().getId());
            // Filter out the current bank detail and unset primary for others
            existingBankDetails.stream()
                .filter(bd -> !bd.getId().equals(bankDetailId))
                .forEach(bd -> bd.setPrimary(false));
            bankDetailRepository.saveAll(existingBankDetails);
            
            // Set this as primary
            bankDetail.setPrimary(true);
            BankDetail updatedBankDetail = bankDetailRepository.save(bankDetail);
            
            log.info("Successfully set bank detail ID: {} as primary for investor ID: {}", 
                    bankDetailId, bankDetail.getInvestor().getId());
            return BankDetailDto.fromEntity(updatedBankDetail);
            
        } catch (Exception e) {
            log.error("Failed to set bank detail ID: {} as primary. Error: {}", bankDetailId, e.getMessage());
            throw e;
        }
    }

    /**
     * Delete bank detail by ID
     * SECURITY: Uses entity-based delete to ensure entity-level authorization filters are applied
     * @param bankDetailId bank detail ID
     * @throws IllegalArgumentException if bank detail not found
     */
    public void deleteBankDetail(Long bankDetailId) {
        log.info("Deleting bank detail with ID: {}", bankDetailId);
        
        try {
            // SECURITY FIX: Load entity first (automatically filtered by entity-level authorization)
            // This ensures users can only delete their own bank details
            // If bank detail doesn't belong to current user, findById will return empty (filtered out)
            BankDetail bankDetail = bankDetailRepository.findById(bankDetailId)
                .orElseThrow(() -> new IllegalArgumentException("Bank detail not found with ID: " + bankDetailId));
            
            bankDetailRepository.delete(bankDetail);
            log.info("Successfully deleted bank detail with ID: {}", bankDetailId);
            
        } catch (Exception e) {
            log.error("Failed to delete bank detail with ID: {}. Error: {}", bankDetailId, e.getMessage());
            throw e;
        }
    }

    /**
     * Delete all bank details for a specific investor
     * SECURITY: Uses entity-based delete to ensure entity-level authorization filters are applied
     * @param investorId investor ID
     */
    public void deleteBankDetailsByInvestorId(Long investorId) {
        log.info("Deleting all bank details for investor ID: {}", investorId);
        
        try {
            // SECURITY FIX: Load entities first (automatically filtered by entity-level authorization)
            // This ensures users can only delete their own bank details
            List<BankDetail> bankDetails = bankDetailRepository.findByInvestorId(investorId);
            
            // If empty, means investor doesn't belong to current user (filtered out)
            if (bankDetails.isEmpty()) {
                log.warn("No bank details found for investor ID: {} (may not belong to current user)", investorId);
                return;
            }
            
            bankDetailRepository.deleteAll(bankDetails);
            log.info("Successfully deleted {} bank details for investor ID: {}", 
                    bankDetails.size(), investorId);
            
        } catch (Exception e) {
            log.error("Failed to delete bank details for investor ID: {}. Error: {}", 
                     investorId, e.getMessage());
            throw e;
        }
    }

    /**
     * Check if bank detail exists by ID
     * @param bankDetailId bank detail ID
     * @return true if bank detail exists
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long bankDetailId) {
        return bankDetailRepository.existsById(bankDetailId);
    }

    /**
     * Get count of bank details for a specific investor
     * @param investorId investor ID
     * @return count of bank details
     */
    @Transactional(readOnly = true)
    public long getCountByInvestorId(Long investorId) {
        log.debug("Getting count of bank details for investor ID: {}", investorId);
        return bankDetailRepository.countByInvestorId(investorId);
    }

    /**
     * Get count of primary bank details for a specific investor
     * @param investorId investor ID
     * @return count of primary bank details
     */
    @Transactional(readOnly = true)
    public long getPrimaryCountByInvestorId(Long investorId) {
        log.debug("Getting count of primary bank details for investor ID: {}", investorId);
        return bankDetailRepository.countByInvestorIdAndIsPrimaryTrue(investorId);
    }

    /**
     * Validate unique account number for create/update operations
     * @param accountNumber account number
     * @param excludeId ID to exclude from validation (for updates)
     */
    private void validateUniqueAccountNumber(String accountNumber, Long excludeId) {
        if (accountNumber != null) {
            if (excludeId == null) {
                Optional<BankDetail> existingByAccountNumber = bankDetailRepository.findByAccountNumber(accountNumber);
                if (existingByAccountNumber.isPresent()) {
                    throw new IllegalArgumentException("Account number already exists: " + accountNumber);
                }
            } else {
                if (bankDetailRepository.existsByAccountNumberAndIdNot(accountNumber, excludeId)) {
                    throw new IllegalArgumentException("Account number already exists: " + accountNumber);
                }
            }
        }
    }

    /**
     * Update bank detail fields from DTO
     * @param bankDetail existing bank detail entity
     * @param bankDetailDto bank detail DTO with new data
     */
    private void updateBankDetailFields(BankDetail bankDetail, BankDetailDto bankDetailDto) {
        if (bankDetailDto.getBankName() != null) {
            bankDetail.setBankName(bankDetailDto.getBankName());
        }
        if (bankDetailDto.getAccountNumber() != null) {
            bankDetail.setAccountNumber(bankDetailDto.getAccountNumber());
        }
        if (bankDetailDto.getAccountType() != null) {
            bankDetail.setAccountType(bankDetailDto.getAccountType());
        }
        if (bankDetailDto.getIfscCode() != null) {
            bankDetail.setIfscCode(bankDetailDto.getIfscCode());
        }
        if (bankDetailDto.getIsPrimary() != null) {
            bankDetail.setPrimary(bankDetailDto.getIsPrimary());
        }
    }
}
