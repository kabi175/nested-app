package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.GoalDTO;
import com.nested.app.dto.MinifiedChildDTO;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.entity.Goal;
import com.nested.app.repository.GoalRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing Goal entities Provides business logic for goal-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GoalServiceImpl implements GoalService {

  private final GoalRepository goalRepository;
  private final UserContext userContext;

  /**
   * Retrieves all goals from the system
   *
   * @return List of all goals
   */
  @Override
  @Transactional(readOnly = true)
  public List<GoalDTO> getAllGoals() {
    log.info("Retrieving all goals from database");

    try {
      List<Goal> goals = goalRepository.findAll();
      List<GoalDTO> goalDTOs = goals.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} goals", goalDTOs.size());
      return goalDTOs;

    } catch (Exception e) {
      log.error("Error retrieving goals: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve goals", e);
    }
  }

  /**
   * Updates an existing goal
   *
   * @param goalDTO Goal data to update
   * @return Updated goal data
   * @throws Exception if update fails
   */
  @Override
  public GoalDTO updateGoal(GoalDTO goalDTO) throws Exception {
    log.info("Updating goal with ID: {}", goalDTO.getId());

    try {
      if (goalDTO.getId() == null) {
        throw new IllegalArgumentException("Goal ID cannot be null for update operation");
      }

      Goal existingGoal =
          goalRepository
              .findById(goalDTO.getId())
              .orElseThrow(
                  () -> new RuntimeException("Goal not found with ID: " + goalDTO.getId()));

      // Check if goal can be updated (business rule: cannot update if orders exist)
      if (hasActiveOrders(existingGoal)) {
        throw new IllegalStateException("Cannot update goal when an order exists for this goal");
      }

      // Update fields
      existingGoal.setTitle(goalDTO.getTitle());
      existingGoal.setTargetAmount(goalDTO.getTargetAmount());
      existingGoal.setCurrentAmount(goalDTO.getCurrentAmount());
      existingGoal.setTargetDate(goalDTO.getTargetDate());

      Goal updatedGoal = goalRepository.save(existingGoal);
      GoalDTO updatedGoalDTO = convertToDTO(updatedGoal);

      log.info("Successfully updated goal with ID: {}", updatedGoal.getId());
      return updatedGoalDTO;

    } catch (IllegalStateException e) {
      log.warn("Cannot update goal with ID {}: {}", goalDTO.getId(), e.getMessage());
      throw e;
    } catch (Exception e) {
      log.error("Error updating goal with ID {}: {}", goalDTO.getId(), e.getMessage(), e);
      throw new RuntimeException("Failed to update goal", e);
    }
  }

  /**
   * Creates multiple goals
   *
   * @param goals List of goal data to create
   * @return List of created goals
   */
  @Override
  public List<GoalDTO> createGoals(List<GoalDTO> goals) {
    log.info("Creating {} goals", goals.size());

    try {

      List<Goal> goalEntities =
          goals.stream().map(this::convertToEntity).collect(Collectors.toList());

      goalEntities.forEach(goal -> goal.setUser(userContext.getUser()));

      List<Goal> savedGoals = goalRepository.saveAll(goalEntities);
      List<GoalDTO> savedGoalDTOs =
          savedGoals.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully created {} goals", savedGoalDTOs.size());
      return savedGoalDTOs;

    } catch (Exception e) {
      log.error("Error creating goals: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to create goals", e);
    }
  }

  /**
   * Updates multiple goals
   *
   * @param goals List of goal data to update
   * @return List of updated goals
   */
  @Override
  public List<GoalDTO> updateGoals(List<GoalDTO> goals) {
    log.info("Updating {} goals", goals.size());

    try {
      List<GoalDTO> updatedGoals =
          goals.stream()
              .map(
                  goal -> {
                    try {
                      return updateGoal(goal);
                    } catch (Exception e) {
                      log.error("Error updating goal with ID {}: {}", goal.getId(), e.getMessage());
                      throw new RuntimeException(
                          "Failed to update goal with ID: " + goal.getId(), e);
                    }
                  })
              .collect(Collectors.toList());

      log.info("Successfully updated {} goals", updatedGoals.size());
      return updatedGoals;

    } catch (Exception e) {
      log.error("Error updating goals: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to update goals", e);
    }
  }

  /**
   * Checks if a goal has active orders This is a business rule check to prevent updating goals with
   * existing orders
   *
   * @param goal Goal to check
   * @return true if goal has active orders, false otherwise
   */
  private boolean hasActiveOrders(Goal goal) {
    log.debug("Checking for active orders for goal ID: {}", goal.getId());

    // TODO: Implement actual check against order repository
    // For now, return false as placeholder
    // In real implementation, this would check if any orders exist for this goal

    return false;
  }

  /**
   * Converts Goal entity to GoalDTO
   *
   * @param goal Goal entity
   * @return GoalDTO
   */
  private GoalDTO convertToDTO(Goal goal) {
    log.debug("Converting Goal entity to DTO for ID: {}", goal.getId());

    GoalDTO dto = new GoalDTO();
    dto.setId(goal.getId());
    dto.setTitle(goal.getTitle());
    dto.setTargetAmount(goal.getTargetAmount());
    dto.setCurrentAmount(goal.getCurrentAmount());
    dto.setTargetDate(goal.getTargetDate());
    dto.setStatus(goal.getStatus());

    // Set user information if available
    if (goal.getUser() != null) {
      dto.setUser(MinifiedUserDTO.fromEntity(goal.getUser()));
    }

    // Set child information if available
    if (goal.getChild() != null) {
      dto.setChild(MinifiedChildDTO.fromEntity(goal.getChild()));
    }

    // Set basket information if available
    if (goal.getBasket() != null) {
      dto.setBasket(goal.getBasket());
    }

    return dto;
  }

  /**
   * Converts GoalDTO to Goal entity
   *
   * @param goalDTO GoalDTO
   * @return Goal entity
   */
  private Goal convertToEntity(GoalDTO goalDTO) {
    log.debug("Converting GoalDTO to entity for title: {}", goalDTO.getTitle());

    Goal goal = new Goal();
    goal.setId(goalDTO.getId());
    goal.setTitle(goalDTO.getTitle());
    goal.setTargetAmount(goalDTO.getTargetAmount());
    goal.setCurrentAmount(goalDTO.getCurrentAmount());
    goal.setTargetDate(goalDTO.getTargetDate());

    if (goalDTO.getChild() != null) {
      goal.setChild(goalDTO.getChild().toEntity());
    }

    return goal;
  }
}
