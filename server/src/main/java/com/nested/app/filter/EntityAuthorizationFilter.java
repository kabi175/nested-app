package com.nested.app.filter;

import com.nested.app.context.UserContext;
import com.nested.app.entity.User;
import jakarta.persistence.EntityManager;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

/**
 * Entity-level authorization filter
 * Automatically applies to Hibernate filters to restrict data access based on user context
 * This ensures users can only see/modify their own data at the database level
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EntityAuthorizationFilter {

    private final EntityManager entityManager;
    private final UserContext userContext;

    /**
     * Applies authorization filters to the current Hibernate session
     * This should be called at the beginning of each request
     * Note: This method should NOT be @Transactional as it's called from an interceptor
     * before the transaction starts
     */
    public void applyFilters() {
        if (userContext.getUser() == null) {
            // No user context - disable all filters (for public endpoints)
            disableAllFilters();
            return;
        }

        User currentUser = userContext.getUser();
        Session session = entityManager.unwrap(Session.class);

        // Admin can see all data - disable filters
        if (Objects.equals(currentUser.getRole(), User.Role.ADMIN)) {
            log.debug("Admin user detected - disabling all authorization filters");
            disableAllFilters(session);
            return;
        }

        // Regular users - apply filters to restrict to their own data
        Long userId = currentUser.getId();
        String userIdString = userId.toString();

        log.debug("Applying authorization filters for user ID: {}", userId);

        // Apply filters for entities with Long user_id
        applyFilterIfExists(session, "userFilter", "userId", userId);
        applyFilterIfExists(session, "userFilterByUserId", "userId", userId);
        
        // Apply filters for entities with String userId (like Document)
        applyFilterIfExists(session, "userFilterByStringId", "userId", userIdString);
    }

    /**
     * Disables all authorization filters
     */
    public void disableAllFilters() {
        Session session = entityManager.unwrap(Session.class);
        disableAllFilters(session);
    }

    /**
     * Disables all authorization filters on the given session
     */
    private void disableAllFilters(Session session) {
        try {
            session.disableFilter("userFilter");
        } catch (Exception e) {
            // Filter might not exist, ignore
        }
        try {
            session.disableFilter("userFilterByUserId");
        } catch (Exception e) {
            // Filter might not exist, ignore
        }
        try {
            session.disableFilter("userFilterByStringId");
        } catch (Exception e) {
            // Filter might not exist, ignore
        }
    }

    /**
     * Applies a filter if it exists, otherwise silently continues
     */
    private void applyFilterIfExists(Session session, String filterName, String paramName, Object paramValue) {
        try {
            session.enableFilter(filterName).setParameter(paramName, paramValue);
            log.trace("Applied filter: {} with {} = {}", filterName, paramName, paramValue);
        } catch (Exception e) {
            // Filter might not be defined for this entity, that's okay
            log.trace("Filter {} not available (this is normal if entity doesn't use it)", filterName);
        }
    }
}

