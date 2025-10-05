package com.nested.app.services;

import com.nested.app.dto.GoalDTO;
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
     * @return List of all goals
     */
    List<GoalDTO> getAllGoals();


    /**
     * Updates an existing goal
     * 
     * @param goalDTO Goal data to update
     * @return Updated goal data
     * @throws Exception if update fails
     */
    GoalDTO updateGoal(GoalDTO goalDTO) throws Exception;
    
    /**
     * Creates multiple goals
     * 
     * @param goals List of goal data to create
     * @return List of created goals
     */
    List<GoalDTO> createGoals(List<GoalDTO> goals);
    
    /**
     * Updates multiple goals
     * 
     * @param goals List of goal data to update
     * @return List of updated goals
     */
    List<GoalDTO> updateGoals(List<GoalDTO> goals);
}
