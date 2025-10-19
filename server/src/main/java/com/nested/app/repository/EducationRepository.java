package com.nested.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.Education;

/**
 * Repository interface for Education entity
 * Provides database access methods for education records
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
}

