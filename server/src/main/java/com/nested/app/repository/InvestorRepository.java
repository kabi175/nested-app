package com.nested.app.repository;

import com.nested.app.entity.Investor;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Investor entity
 * Provides database access methods for investor operations
 */
@Repository
public interface InvestorRepository extends JpaRepository<Investor, Long> {

    /**
     * Find investor by email address
     * @param email email address
     * @return Optional investor
     */
    Optional<Investor> findByEmail(String email);

    /**
     * Find investor by client code
     * @param clientCode unique client code
     * @return Optional investor
     */
    Optional<Investor> findByClientCode(String clientCode);

    /**
     * Find investor by PAN number
     * @param panNumber PAN number
     * @return Optional investor
     */
    Optional<Investor> findByPanNumber(String panNumber);

    /**
     * Find investors by KYC status
     * @param kycStatus KYC status
     * @param pageable pagination information
     * @return Page of investors
     */
    Page<Investor> findByKycStatus(Investor.KYCStatus kycStatus, Pageable pageable);

    /**
     * Find investors by first name containing the given string (case insensitive)
     * @param firstName first name to search
     * @param pageable pagination information
     * @return Page of investors
     */
    Page<Investor> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);

    /**
     * Find investors by email containing the given string (case insensitive)
     * @param email email to search
     * @param pageable pagination information
     * @return Page of investors
     */
    Page<Investor> findByEmailContainingIgnoreCase(String email, Pageable pageable);

  /**
   * Custom query to find investors with their addresses and bank details
   *
   * @param investorId investor ID
   * @return Optional investor with loaded relationships
   */
  @EntityGraph(attributePaths = {"address", "bankDetails"})
  @Query("SELECT i FROM Investor i WHERE i.id = :id")
  Optional<Investor> findByIdWithDetails(@Param("investorId") Long investorId);

    /**
     * Check if email exists for a different investor
     * @param email email to check
     * @param investorId current investor ID to exclude
     * @return true if email exists for another investor
     */
    boolean existsByEmailAndIdNot(String email, Long investorId);

    /**
     * Check if client code exists for a different investor
     * @param clientCode client code to check
     * @param investorId current investor ID to exclude
     * @return true if client code exists for another investor
     */
    boolean existsByClientCodeAndIdNot(String clientCode, Long investorId);

    /**
     * Check if PAN number exists for a different investor
     * @param panNumber PAN number to check
     * @param investorId current investor ID to exclude
     * @return true if PAN number exists for another investor
     */
    boolean existsByPanNumberAndIdNot(String panNumber, Long investorId);

    /**
     * Get total count of investors by KYC status
     * @param kycStatus KYC status
     * @return count of investors
     */
    long countByKycStatus(Investor.KYCStatus kycStatus);

    /**
     * Find investors by multiple criteria
     * @param firstName first name (optional)
     * @param email email (optional) 
     * @param kycStatus KYC status (optional)
     * @param pageable pagination information
     * @return Page of investors
     */
    @Query("SELECT i FROM Investor i WHERE " +
           "(:firstName IS NULL OR LOWER(i.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) AND " +
           "(:email IS NULL OR LOWER(i.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:kycStatus IS NULL OR i.kycStatus = :kycStatus)")
    Page<Investor> findByCriteria(@Param("firstName") String firstName,
                                 @Param("email") String email,
                                 @Param("kycStatus") Investor.KYCStatus kycStatus,
                                 Pageable pageable);
}
