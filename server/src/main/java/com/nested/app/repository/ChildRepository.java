package com.nested.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.Child;

/**
 * Repository interface for Child entity
 * Provides data access methods for child-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {
    
    /**
     * Find children by user ID
     * 
     * @param userId User ID
     * @return List of children for the specified user
     */
    List<Child> findByUserId(Long userId);
    
    /**
     * Find children by first name
     * 
     * @param firstName First name to search for
     * @return List of children with the specified first name
     */
    List<Child> findByFirstName(String firstName);
    
    /**
     * Find children by last name
     * 
     * @param lastName Last name to search for
     * @return List of children with the specified last name
     */
    List<Child> findByLastName(String lastName);
    
    /**
     * Find children by gender
     * 
     * @param gender Gender to search for
     * @return List of children with the specified gender
     */
    List<Child> findByGender(String gender);
    
    /**
     * Find children by invest under child flag
     * 
     * @param investUnderChild Flag indicating if investment is under child
     * @return List of children with the specified investment flag
     */
    List<Child> findByInvestUnderChild(boolean investUnderChild);
}
