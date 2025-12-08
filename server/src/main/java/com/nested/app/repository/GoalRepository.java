package com.nested.app.repository;

import com.nested.app.entity.Goal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Goal entity Provides data access methods for goal-related operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

  /**
   * Find goals by user ID and status
   *
   * @param userId User ID
   * @param status Goal status
   * @return List of goals for the specified user with the specified status
   */
  List<Goal> findByUserIdAndStatus(Long userId, Goal.Status status);
}
