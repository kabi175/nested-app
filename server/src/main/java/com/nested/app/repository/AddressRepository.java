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

}
