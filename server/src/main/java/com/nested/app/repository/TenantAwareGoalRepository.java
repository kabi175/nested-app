package com.nested.app.repository;

import com.nested.app.entity.Goal;
import com.nested.app.entity.User;
import com.nested.app.enums.BasketType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Tenant-aware repository implementation for Goal entity Automatically applies user-based filtering
 * to ensure users only see their own goals Admin users bypass filtering and can see all goals
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Repository
public class TenantAwareGoalRepository extends SimpleJpaRepository<Goal, Long> {

  @PersistenceContext private EntityManager entityManager;

  public TenantAwareGoalRepository(EntityManager entityManager) {
    super(Goal.class, entityManager);
    this.entityManager = entityManager;
  }

  /**
   * Find all goals with tenant filtering
   *
   * @param user Current user context
   * @return List of goals visible to user
   */
  public List<Goal> findAll(User user) {
    enableUserFilter(user);
    return super.findAll();
  }

  /**
   * Find goals by basket type with tenant filtering
   *
   * @param user Current user context
   * @param type Basket type to filter by
   * @return List of goals associated with baskets of the specified type
   */
  public List<Goal> findByBasketType(User user, BasketType type) {
    enableUserFilter(user);
    return entityManager
        .createQuery("SELECT g FROM Goal g WHERE g.basket.basketType = :type", Goal.class)
        .setParameter("type", type)
        .getResultList();
  }

  /**
   * Find goal by ID with tenant filtering
   *
   * @param id Goal ID
   * @param user Current user context
   * @return Optional containing goal if found and user has access
   */
  public Optional<Goal> findById(Long id, User user) {
    enableUserFilter(user);
    return super.findById(id);
  }

  /**
   * Find goals by user ID and status Note: User filter is still applied for non-admin users
   *
   * @param userId User ID
   * @param status Goal status
   * @param user Current user context
   * @return List of goals for the specified user with the specified status
   */
  public List<Goal> findByUserIdAndStatus(Long userId, Goal.Status status, User user) {
    enableUserFilter(user);
    return entityManager
        .createQuery(
            "SELECT g FROM Goal g WHERE g.user.id = :userId AND g.status = :status", Goal.class)
        .setParameter("userId", userId)
        .setParameter("status", status)
        .getResultList();
  }

  /**
   * Find goals by basket title with tenant filtering
   *
   * @param basketTitle Exact basket title to search for
   * @param user Current user context
   * @return List of goals associated with the basket having the specified title
   */
  public List<Goal> findByBasketTitle(String basketTitle, User user) {
    enableUserFilter(user);
    return entityManager
        .createQuery("SELECT g FROM Goal g WHERE g.basket.title = :basketTitle", Goal.class)
        .setParameter("basketTitle", basketTitle)
        .getResultList();
  }

  /**
   * Find all goal titles for a user with tenant filtering
   *
   * @param user Current user context
   * @return List of goal titles for the user
   */
  public List<String> findAllTitlesByUser(User user) {
    enableUserFilter(user);
    return entityManager.createQuery("SELECT g.title FROM Goal g", String.class).getResultList();
  }

  /**
   * Find all goal titles for a user excluding a specific goal ID
   *
   * @param user Current user context
   * @param excludeGoalId Goal ID to exclude from results
   * @return List of goal titles for the user excluding the specified goal
   */
  public List<String> findAllTitlesByUserExcludingGoal(User user, Long excludeGoalId) {
    enableUserFilter(user);
    return entityManager
        .createQuery("SELECT g.title FROM Goal g WHERE g.id != :excludeGoalId", String.class)
        .setParameter("excludeGoalId", excludeGoalId)
        .getResultList();
  }

  /**
   * Enables the user filter for tenant isolation Admin users bypass the filter and can see all
   * goals
   *
   * @param user Current user context
   */
  private void enableUserFilter(User user) {
    if (user == null) {
      log.warn("No user context found - filter not applied");
      return;
    }

    // Admin users bypass filtering
    if (Objects.equals(user.getRole(), User.Role.ADMIN)) {
      log.debug("Admin user detected - bypassing user filter");
      return;
    }

    // Apply user filter for regular users
    Long userId = user.getId();
    Session session = entityManager.unwrap(Session.class);
    Filter filter = session.enableFilter("userFilterByUserId");
    filter.setParameter("userId", userId);

    log.debug("Applied userFilterByUserId for user ID: {}", userId);
  }
}
