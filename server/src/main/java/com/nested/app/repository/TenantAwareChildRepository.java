package com.nested.app.repository;

import com.nested.app.entity.Child;
import com.nested.app.entity.User;
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
 * Tenant-aware repository implementation for Child entity Automatically applies user-based
 * filtering to ensure users only see their own children Admin users bypass filtering and can see
 * all children
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Repository
public class TenantAwareChildRepository extends SimpleJpaRepository<Child, Long> {

  @PersistenceContext private EntityManager entityManager;

  public TenantAwareChildRepository(EntityManager entityManager) {
    super(Child.class, entityManager);
    this.entityManager = entityManager;
  }

  /**
   * Find all children with tenant filtering
   *
   * @param user Current user context
   * @return List of children visible to user
   */
  public List<Child> findAll(User user) {
    enableUserFilter(user);
    return super.findAll();
  }

  /**
   * Find child by ID with tenant filtering
   *
   * @param id Child ID
   * @param user Current user context
   * @return Optional containing child if found and user has access
   */
  public Optional<Child> findById(Long id, User user) {
    enableUserFilter(user);
    return super.findById(id);
  }

  /**
   * Find children by user ID Note: User filter is still applied for non-admin users
   *
   * @param userId User ID
   * @param user Current user context
   * @return List of children for the specified user
   */
  public List<Child> findByUserId(Long userId, User user) {
    enableUserFilter(user);
    return entityManager
        .createQuery("SELECT c FROM Child c WHERE c.user.id = :userId", Child.class)
        .setParameter("userId", userId)
        .getResultList();
  }

  /**
   * Enables the user filter for tenant isolation Admin users bypass the filter and can see all
   * children
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
