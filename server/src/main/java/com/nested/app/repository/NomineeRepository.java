package com.nested.app.repository;

import com.nested.app.entity.Nominee;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Nominee entity Provides data access methods for nominee-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {

  /**
   * Find all nominees for a specific user
   *
   * @param userId User ID
   * @return List of nominees for the specified user
   */
  List<Nominee> findByUserId(Long userId);

  /**
   * Find a specific nominee for a user by ID
   *
   * @param userId User ID
   * @param nomineeId Nominee ID
   * @return Optional containing the nominee if found
   */
  Optional<Nominee> findByUserIdAndId(Long userId, Long nomineeId);
}
