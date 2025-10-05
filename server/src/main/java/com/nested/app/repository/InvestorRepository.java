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
 * Repository interface for Investor entity Provides database access methods for investor operations
 */
@Repository
public interface InvestorRepository extends JpaRepository<Investor, Long> {}
