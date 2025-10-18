package com.nested.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.College;
import com.nested.app.entity.College.CollegeType;

/**
 * Repository interface for College entity
 * Provides data access methods for college-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    
    /**
     * Find colleges by name
     * 
     * @param name College name
     * @return List of colleges with the specified name
     */
    List<College> findByName(String name);
    
    /**
     * Find colleges by name containing the given text
     * 
     * @param name Name text to search for
     * @return List of colleges with names containing the specified text
     */
    List<College> findByNameContaining(String name);
    
    /**
     * Find colleges by type
     * 
     * @param type College type
     * @return List of colleges of the specified type
     */
    List<College> findByType(CollegeType type);
    
    /**
     * Find colleges by location
     * 
     * @param location College location
     * @return List of colleges in the specified location
     */
    List<College> findByLocation(String location);
    
    /**
     * Find colleges by course
     * 
     * @param course Course name
     * @return List of colleges offering the specified course
     */
    List<College> findByCourse(String course);
}

