package com.nested.app.services;

import com.nested.app.dto.GoalDTO;
import com.nested.app.entity.User;
import com.nested.app.enums.BasketType;
import java.util.List;

/**
 * Service interface for managing Goal entities
 * Provides business logic for goal-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface GoalService {

  /**
   * Retrieves all goals from the system
   *
   * @param user Current user context
   * @return List of all goals
   */
  List<GoalDTO> getAllGoals(User user, BasketType type);

  GoalDTO getGoalById(Long goalId, User user);

  /**
   * Updates an existing goal
   *
   * @param goalDTO Goal data to update
   * @param user Current user context
   * @return Updated goal data
   * @throws Exception if update fails
   */
  GoalDTO updateGoal(GoalDTO goalDTO, User user) throws Exception;

  /**
   * Creates multiple goals
   *
   * @param goals List of goal data to create
   * @param user Current user context
   * @return List of created goals
   */
  List<GoalDTO> createGoals(List<GoalDTO> goals, User user);

  /**
   * Updates multiple goals
   *
   * @param goals List of goal data to update
   * @param user Current user context
   * @return List of updated goals
   */
  List<GoalDTO> updateGoals(List<GoalDTO> goals, User user);

  /**
   * Retrieves goals by basket name
   *
   * @param basketName The exact name of the basket to search for
   * @param user Current user context
   * @return List of goals associated with the specified basket
   */
  List<GoalDTO> getGoalsByBasketName(String basketName, User user);
}
