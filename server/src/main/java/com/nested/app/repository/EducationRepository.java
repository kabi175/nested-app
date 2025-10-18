package com.nested.app.repository;

import com.nested.app.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Address entity Provides database access methods for address operations
 */
@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {}
