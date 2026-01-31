package com.nested.app.services;

import com.nested.app.dto.GoalDTO;
import com.nested.app.dto.MinifiedBasketDto;
import com.nested.app.dto.MinifiedChildDTO;
import com.nested.app.dto.MinifiedEducationDto;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.entity.Basket;
import com.nested.app.entity.Child;
import com.nested.app.entity.Goal;
import com.nested.app.entity.User;
import com.nested.app.enums.BasketType;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.repository.BasketRepository;
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.EducationRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
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

  private final TenantAwareGoalRepository goalRepository;
  private final BasketRepository basketRepository;
  private final EducationRepository educationRepository;
  private final OrderRepository orderRepository;
  private final ChildRepository childRepository;

  /**
   * Retrieves all goals from the system
   *
   * @param user Current user context
   * @return List of all goals
   */
  @Override
  @Transactional(readOnly = true)
  public List<GoalDTO> getAllGoals(User user, BasketType type) {
    log.info("Retrieving all goals from database for user ID: {}", user.getId());

    try {
      List<Goal> goals;
      if (type == null) {
        goals = goalRepository.findAll(user);
      } else {
        goals = goalRepository.findByBasketType(user, type);
      }
      List<GoalDTO> goalDTOs = goals.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} goals", goalDTOs.size());
      return goalDTOs;

    } catch (Exception e) {
      log.error("Error retrieving goals: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to retrieve goals", e);
    }
  }

  @Override
  public GoalDTO getGoalById(Long goalId, User user) {
    try {
      Optional<Goal> goals = goalRepository.findById(goalId, user);
      return goals.map(this::convertToDTO).orElse(null);
    } catch (Exception e) {
      log.error("Error retrieving goals: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to retrieve goals", e);
    }
  }

  /**
   * Updates an existing goal
   *
   * @param goalDTO Goal data to update
   * @param user Current user context
   * @return Updated goal data
   */
  @Override
  public GoalDTO updateGoal(GoalDTO goalDTO, User user) {
    log.info("Updating goal with ID: {} for user ID: {}", goalDTO.getId(), user.getId());

    try {
      if (goalDTO.getId() == null) {
        throw new IllegalArgumentException("Goal ID cannot be null for update operation");
      }

      Goal existingGoal =
          goalRepository
              .findById(goalDTO.getId(), user)
              .orElseThrow(
                  () -> new RuntimeException("Goal not found with ID: " + goalDTO.getId()));

      // Check if goal can be updated (business rule: cannot update if orders exist)
      if (hasActiveOrders(existingGoal)) {
        throw new IllegalStateException("Cannot update goal when an order exists for this goal");
      }

      // Fetch existing titles for the user excluding the current goal
      List<String> existingTitlesList =
          goalRepository.findAllTitlesByUserExcludingGoal(user, goalDTO.getId());
      Set<String> existingTitles = new HashSet<>(existingTitlesList);

      // Generate unique title if the new title conflicts with existing ones
      String uniqueTitle = generateUniqueTitle(goalDTO.getTitle(), existingTitles);

      // Update fields
      existingGoal.setTitle(uniqueTitle);
      existingGoal.setTargetAmount(goalDTO.getTargetAmount());
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
      throw new ExternalServiceException("Failed to update goal", e);
    }
  }

  /**
   * Creates multiple goalDtos
   *
   * @param goalDtos List of goal data to create
   * @param user Current user context
   * @return List of created goalDtos
   */
  @Override
  public List<GoalDTO> createGoals(List<GoalDTO> goalDtos, User user) {
    log.info("Creating {} goals for user ID: {}", goalDtos.size(), user.getId());

    try {
      // Fetch existing titles for the user (case-insensitive deduplication)
      List<String> existingTitlesList = goalRepository.findAllTitlesByUser(user);
      Set<String> existingTitles = new HashSet<>(existingTitlesList);
      var superFDGoals =
          goalRepository.findByBasketType(user, BasketType.SUPER_FD).stream().toList();

      List<Goal> goalEntities =
          goalDtos.stream()
              .map(this::convertToEntity)
              .toList();

      var toBeSaved = new ArrayList<Goal>();
      goalEntities.forEach(
          goal -> {
            // Generate unique title
            String uniqueTitle = generateUniqueTitle(goal.getTitle(), existingTitles);
            goal.setTitle(uniqueTitle);
            // Track the newly assigned title to handle duplicates within the same batch
            existingTitles.add(uniqueTitle);

            goal.setUser(user);
            Basket basket;
            if (goal.getEducation() == null && goal.getBasket() != null) {
              basket = basketRepository.findById(goal.getBasket().getId()).orElseThrow();
            } else {
              var now = LocalDate.now();
              var futureDate = goal.getTargetDate().toLocalDate();
              var period = Period.between(now, futureDate);
              basket =
                  basketRepository
                      .findFirstByYearsGreaterThanOrderByYears((double) period.getYears())
                      .orElseGet(basketRepository::findFirstByOrderByYearsDesc);
            }

            goal.setBasket(basket);

            if (goal.getTargetAmount() == null) {
              var education = educationRepository.findById(goal.getEducation().getId());
              education.ifPresent(goal::setEducation);

              goal.setTargetAmount(goal.getEducation().getExpectedFee());
            }
            goal.setCurrentAmount(0.0);
            goal.setInvestedAmount(0.0);

            var superFDGoal =
                superFDGoals.stream()
                    .filter(fdGoal -> fdGoal.getBasket().getId().equals(goal.getBasket().getId()))
                    .findFirst()
                    .orElse(null);
            toBeSaved.add(
                Objects.requireNonNullElseGet(superFDGoal, () -> goalRepository.save(goal)));
          });

      List<GoalDTO> savedGoalDTOs =
          toBeSaved.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully created {} goalDtos", savedGoalDTOs.size());
      return savedGoalDTOs;

    } catch (Exception e) {
      log.error("Error creating goalDtos: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to create goalDtos", e);
    }
  }

  /**
   * Updates multiple goals
   *
   * @param goalDtos List of goal data to update
   * @param user Current user context
   * @return List of updated goals
   */
  @Override
  @Transactional
  public List<GoalDTO> updateGoals(List<GoalDTO> goalDtos, User user) {
    log.info("Updating {} goals for user ID: {}", goalDtos.size(), user.getId());

    try {
      List<GoalDTO> updatedGoals =
          goalDtos.stream()
              .map(
                  goalDTO -> {
                    try {
                      return updateGoal(goalDTO, user);
                    } catch (Exception e) {
                      log.error(
                          "Error updating goal with ID {}: {}", goalDTO.getId(), e.getMessage(), e);
                      throw new ExternalServiceException("Failed to update goal", e);
                    }
                  })
              .collect(Collectors.toList());

      log.info("Successfully updated {} goals", updatedGoals.size());
      return updatedGoals;

    } catch (Exception e) {
      log.error("Error updating goals: {}", e.getMessage(), e);
      throw new ExternalServiceException("Failed to update goals", e);
    }
  }

  /**
   * Retrieves goals by basket name with exact match filtering
   *
   * @param basketName The exact name of the basket to search for
   * @param user Current user context
   * @return List of goals associated with the specified basket
   */
  @Override
  @Transactional(readOnly = true)
  public List<GoalDTO> getGoalsByBasketName(String basketName, User user) {
    log.info("Retrieving goals for basket name: {} for user ID: {}", basketName, user.getId());

    try {
      List<Goal> goals = goalRepository.findByBasketTitle(basketName, user);
      List<GoalDTO> goalDTOs = goals.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} goals for basket name: {}", goalDTOs.size(), basketName);
      return goalDTOs;

    } catch (Exception e) {
      log.error("Error retrieving goals for basket name {}: {}", basketName, e.getMessage(), e);
      throw new ExternalServiceException("Failed to retrieve goals by basket name", e);
    }
  }

  /**
   * Generates a unique title by appending numeric suffixes if the title already exists. Uses
   * case-insensitive comparison.
   *
   * @param baseTitle The original title
   * @param existingTitles Set of existing titles (case-insensitive)
   * @return A unique title with suffix if necessary (e.g., "Goal", "Goal 1", "Goal 2")
   */
  private String generateUniqueTitle(String baseTitle, Set<String> existingTitles) {
    // Create a lowercase set for case-insensitive comparison
    Set<String> lowerCaseTitles = new HashSet<>();
    for (String title : existingTitles) {
      lowerCaseTitles.add(title.toLowerCase());
    }

    // Check if base title is unique
    if (!lowerCaseTitles.contains(baseTitle.toLowerCase())) {
      return baseTitle;
    }

    // Find the next available suffix
    int suffix = 1;
    String candidateTitle;
    do {
      candidateTitle = baseTitle + " " + suffix;
      suffix++;
    } while (lowerCaseTitles.contains(candidateTitle.toLowerCase()));

    return candidateTitle;
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
    return orderRepository.existsByGoalId(goal.getId());
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
    dto.setInvestedAmount(goal.getInvestedAmount());
    dto.setTargetDate(goal.getTargetDate());
    dto.setMonthlySip(goal.getMonthlySip());
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
      dto.setBasket(MinifiedBasketDto.fromEntity(goal.getBasket()));
    }

    if (goal.getEducation() != null) {
      dto.setEducation(new MinifiedEducationDto(goal.getEducation().getId()));
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
    goal.setInvestedAmount(goalDTO.getInvestedAmount());
    goal.setTargetDate(goalDTO.getTargetDate());

    if (goalDTO.getEducation() != null) {
      goal.setEducation(goalDTO.getEducation().toEntity());
    }
    goal.setTargetAmount(goalDTO.getTargetAmount());

    if (goalDTO.getChild() != null) {
      goal.setChild(goalDTO.getChild().toEntity());
    }

    if (goalDTO.getBasket() != null) {
      var basket = new Basket();
      basket.setId(goalDTO.getBasket().getId());
      goal.setBasket(basket);
    }

    return goal;
  }

  /**
   * Soft deletes a goal and transfers all associated records to target goal. Only supported for
   * goals with BasketType.EDUCATION.
   *
   * @param goalId The ID of the goal to delete
   * @param user Current user context
   * @throws IllegalArgumentException if validation fails
   */
  @Transactional
  @Override
  public void softDeleteGoal(Long goalId, User user) {
    log.info("Soft deleting goal ID: {}  for user ID: {}", goalId, user.getId());

    // Validate source goal
    Goal sourceGoal =
        goalRepository
            .findByIdIncludingDeleted(goalId, user)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

    if (sourceGoal.getIsDeleted()) {
      throw new IllegalArgumentException("Goal has already been deleted");
    }

    if (sourceGoal.getBasket() == null
        || sourceGoal.getBasket().getBasketType() != BasketType.EDUCATION) {
      throw new IllegalArgumentException("Only education goals can be deleted");
    }

    if (!List.of(Goal.Status.DRAFT, Goal.Status.PAYMENT_PENDING).contains(sourceGoal.getStatus())) {
      throw new IllegalArgumentException("Only draft goals can be deleted");
    }

    // Mark source goal as deleted
    sourceGoal.setIsDeleted(true);
    sourceGoal.setDeletedAt(new Timestamp(System.currentTimeMillis()));

    goalRepository.save(sourceGoal); // Save the goal first to avoid referencing a deleted child

    var goalsForChild = goalRepository.findAllByChildId(sourceGoal.getChild().getId(), user);
    if (goalsForChild.isEmpty()) {
      Child child =
          childRepository
              .findById(sourceGoal.getChild().getId())
              .orElseThrow(() -> new IllegalArgumentException("Child not found"));
      child.setIsDeleted(true);
      child.setDeletedAt(new Timestamp(System.currentTimeMillis()));
      childRepository.save(child);
    }

    log.info("Successfully soft deleted goal ID: {}", goalId);
  }
}
