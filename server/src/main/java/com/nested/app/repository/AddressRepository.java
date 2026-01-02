package com.nested.app.repository;

import com.nested.app.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Address entity Provides database access methods for address operations
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {}
