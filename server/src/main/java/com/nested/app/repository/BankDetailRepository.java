package com.nested.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.BankDetail;

/**
 * Repository interface for BankDetail entity
 * Provides database access methods for bank detail operations
 */
@Repository
public interface BankDetailRepository extends JpaRepository<BankDetail, Long> {

    /**
     * Find all bank details for a specific investor
     * @param investorId investor ID
     * @return List of bank details
     */
    List<BankDetail> findByInvestorId(Long investorId);

    /**
     * Find bank details for a specific investor with pagination
     * @param investorId investor ID
     * @param pageable pagination information
     * @return Page of bank details
     */
    Page<BankDetail> findByInvestorId(Long investorId, Pageable pageable);

    /**
     * Find primary bank detail for a specific investor
     * @param investorId investor ID
     * @return Optional primary bank detail
     */
    Optional<BankDetail> findByInvestorIdAndIsPrimaryTrue(Long investorId);

    /**
     * Find bank detail by account number
     * @param accountNumber account number
     * @return Optional bank detail
     */
    Optional<BankDetail> findByAccountNumber(String accountNumber);

    /**
     * Find bank details by bank name
     * @param bankName bank name
     * @param pageable pagination information
     * @return Page of bank details
     */
    Page<BankDetail> findByBankNameContainingIgnoreCase(String bankName, Pageable pageable);

    /**
     * Find bank details by IFSC code
     * @param ifscCode IFSC code
     * @return List of bank details
     */
    List<BankDetail> findByIfscCode(String ifscCode);

    /**
     * Find bank details by account type
     * @param accountType account type
     * @param pageable pagination information
     * @return Page of bank details
     */
    Page<BankDetail> findByAccountType(BankDetail.AccountType accountType, Pageable pageable);

    /**
     * Count bank details for a specific investor
     * @param investorId investor ID
     * @return count of bank details
     */
    long countByInvestorId(Long investorId);

    /**
     * Count primary bank details for a specific investor
     * @param investorId investor ID
     * @return count of primary bank details
     */
    long countByInvestorIdAndIsPrimaryTrue(Long investorId);

    /**
     * Check if account number exists for a different bank detail
     * @param accountNumber account number to check
     * @param bankDetailId current bank detail ID to exclude
     * @return true if account number exists for another bank detail
     */
    boolean existsByAccountNumberAndIdNot(String accountNumber, Long bankDetailId);

    /**
     * Delete all bank details for a specific investor
     * @param investorId investor ID
     */
    void deleteByInvestorId(Long investorId);

    /**
     * Set all bank details as non-primary for a specific investor
     * @param investorId investor ID
     */
    @Modifying
    @Query("UPDATE BankDetail b SET b.isPrimary = false WHERE b.investor.id = :investorId")
    void setAllAsNonPrimaryForInvestor(@Param("investorId") Long investorId);

    List<BankDetail> findAllByUserId(Long userId);

    /**
     * Find bank detail by reference ID
     * @param refId reference ID
     * @return Optional bank detail
     */
    Optional<BankDetail> findByRefId(String refId);

    /**
     * Find bank detail by account number and IFSC code
     * @param accountNumber account number
     * @param ifscCode IFSC code
     * @return Optional bank detail
     */
    Optional<BankDetail> findByAccountNumberAndIfscCode(String accountNumber, String ifscCode);

    /**
     * Custom query to find bank details by multiple criteria
     * @param investorId investor ID (optional)
     * @param bankName bank name (optional)
     * @param accountType account type (optional)
     * @param isPrimary primary flag (optional)
     * @param pageable pagination information
     * @return Page of bank details
     */
    @Query("SELECT b FROM BankDetail b WHERE " +
           "(:investorId IS NULL OR b.investor.id = :investorId) AND " +
           "(:bankName IS NULL OR LOWER(b.bankName) LIKE LOWER(CONCAT('%', :bankName, '%'))) AND " +
           "(:accountType IS NULL OR b.accountType = :accountType) AND " +
           "(:isPrimary IS NULL OR b.isPrimary = :isPrimary)")
    Page<BankDetail> findByCriteria(@Param("investorId") Long investorId,
                                   @Param("bankName") String bankName,
                                   @Param("accountType") BankDetail.AccountType accountType,
                                   @Param("isPrimary") Boolean isPrimary,
                                   Pageable pageable);
}
