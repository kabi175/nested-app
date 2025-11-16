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
   * Find goals by user ID
   *
   * @param userId User ID
   * @return List of goals for the specified user
   */
  List<Goal> findByUserId(Long userId);

  /**
   * Find goals by child ID
   *
   * @param childId Child ID
   * @return List of goals for the specified child
   */
  List<Goal> findByChildId(Long childId);

  /**
   * Find goals by basket ID
   *
   * @param basketId Basket ID
   * @return List of goals for the specified basket
   */
  List<Goal> findByBasketId(Long basketId);

  /**
   * Find goals by title containing the given text
   *
   * @param title Title text to search for
   * @return List of goals with titles containing the specified text
   */
  List<Goal> findByTitleContaining(String title);

  /**
   * Find active goals (status = 'active')
   *
   * @return List of active goals
   */
  List<Goal> findByStatus(String status);

  /**
   * Find goals by child ID and status
   *
   * @param childId Child ID
   * @param status Goal status
   * @return List of goals for the specified child with the specified status
   */
  List<Goal> findByChildIdAndStatus(Long childId, Goal.Status status);

  /**
   * Find goals by user ID and status
   *
   * @param userId User ID
   * @param status Goal status
   * @return List of goals for the specified user with the specified status
   */
  List<Goal> findByUserIdAndStatus(Long userId, Goal.Status status);
}
