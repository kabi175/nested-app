package com.nested.app.repository;

import com.nested.app.entity.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Address entity
 * Provides database access methods for address operations
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * Find all addresses for a specific investor
     * @param investorId investor ID
     * @return List of addresses
     */
    List<Address> findByInvestorId(Long investorId);

    /**
     * Find addresses for a specific investor with pagination
     * @param investorId investor ID
     * @param pageable pagination information
     * @return Page of addresses
     */
    Page<Address> findByInvestorId(Long investorId, Pageable pageable);

    /**
     * Find addresses by city
     * @param city city name
     * @param pageable pagination information
     * @return Page of addresses
     */
    Page<Address> findByCityContainingIgnoreCase(String city, Pageable pageable);

    /**
     * Find addresses by state
     * @param state state name
     * @param pageable pagination information
     * @return Page of addresses
     */
    Page<Address> findByStateContainingIgnoreCase(String state, Pageable pageable);

    /**
     * Find addresses by country
     * @param country country name
     * @param pageable pagination information
     * @return Page of addresses
     */
    Page<Address> findByCountryContainingIgnoreCase(String country, Pageable pageable);

    /**
     * Find addresses by pin code
     * @param pinCode pin code
     * @return List of addresses
     */
    List<Address> findByPinCode(String pinCode);

    /**
     * Count addresses for a specific investor
     * @param investorId investor ID
     * @return count of addresses
     */
    long countByInvestorId(Long investorId);

    /**
     * Delete all addresses for a specific investor
     * @param investorId investor ID
     */
    void deleteByInvestorId(Long investorId);

    /**
     * Custom query to find addresses by multiple criteria
     * @param investorId investor ID (optional)
     * @param city city (optional)
     * @param state state (optional)
     * @param country country (optional)
     * @param pageable pagination information
     * @return Page of addresses
     */
    @Query("SELECT a FROM Address a WHERE " +
           "(:investorId IS NULL OR a.investor.id = :investorId) AND " +
           "(:city IS NULL OR LOWER(a.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR LOWER(a.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:country IS NULL OR LOWER(a.country) LIKE LOWER(CONCAT('%', :country, '%')))")
    Page<Address> findByCriteria(@Param("investorId") Long investorId,
                                @Param("city") String city,
                                @Param("state") String state,
                                @Param("country") String country,
                                Pageable pageable);
}
