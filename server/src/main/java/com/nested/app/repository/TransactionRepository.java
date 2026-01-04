package com.nested.app.repository;

import com.nested.app.dto.GoalHoldingProjection;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionType;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  List<Transaction> findByUserId(Long userId);

  List<Transaction> findByUserIdAndGoalId(Long userId, Long goalId);

  Page<Transaction> findByUserIdAndGoalId(Long userId, Long goalId, Pageable pageable);

  List<Transaction> findByUserIdAndFundId(Long userId, Long fundId);

  List<Transaction> findByUserIdAndExecutedAtBetween(Long userId, Timestamp start, Timestamp end);

  List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

  boolean existsBySourceOrderItemId(Long sourceOrderItemId);

  Optional<Transaction> findBySourceOrderItemId(Long sourceOrderItemId);

  boolean existsByProviderTransactionId(String providerTransactionId);

  List<Transaction> findByExternalRef(String externalRef);

  Page<Transaction> findByUserId(Long userId, Pageable pageable);

  Page<Transaction> findByUserIdAndCreatedAtBetween(
      Long userId, Timestamp startDate, Timestamp endDate, Pageable pageable);

  /**
   * Retrieves aggregated holdings data for a specific goal using database-level grouping and
   * calculations. This query groups transactions by fund and computes: - Total units (sum of all
   * transaction units) - Invested amount (sum of positive transaction amounts) - Current NAV (from
   * fund table) Only returns funds with positive total units (excludes fully sold positions).
   *
   * @param userId The user ID
   * @param goalId The goal ID
   * @return List of holdings projections with aggregated data per fund
   */
  @Query(
      """
      SELECT
        f.id AS fundId,
        f.label AS fundLabel,
        AVG(t.unitPrice) as averageNav,
        SUM(t.units) AS totalUnits,
        SUM(CASE WHEN t.units > 0 THEN t.amount ELSE 0 END) AS investedAmount,
        f.nav AS currentNav
      FROM Transaction t
      JOIN t.fund f
      WHERE t.user.id = :userId
        AND t.goal.id = :goalId
      GROUP BY f.id, f.label, f.nav
      HAVING SUM(t.units) > 0
      """)
  List<GoalHoldingProjection> findGoalHoldingsAggregated(
      @Param("userId") Long userId, @Param("goalId") Long goalId);
}
