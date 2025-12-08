package com.nested.app.repository;

import com.nested.app.entity.Child;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

}
