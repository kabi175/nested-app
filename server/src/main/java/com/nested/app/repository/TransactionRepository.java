package com.nested.app.repository;

import com.nested.app.dto.GoalHoldingProjection;
import com.nested.app.dto.GoalPortfolioProjection;
import com.nested.app.entity.Transaction;
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

  boolean existsBySourceOrderItemId(Long sourceOrderItemId);

  Optional<Transaction> findBySourceOrderItemId(Long sourceOrderItemId);

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
        SUM(t.amount) AS investedAmount,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN t.units * f.nav ELSE t.amount END) AS currentValue,
        f.nav AS currentNav
      FROM Transaction t
      JOIN t.fund f
      WHERE t.user.id = :userId
        AND t.goal.id = :goalId
        AND t.status in ('COMPLETED', 'SUBMITTED')
      GROUP BY f.id, f.label, f.nav
      """)
  List<GoalHoldingProjection> findGoalHoldingsAggregated(
      @Param("userId") Long userId, @Param("goalId") Long goalId);

  /**
   * Retrieves aggregated portfolio data for a specific goal using database-level calculations. This
   * query computes: - Invested amount (sum of amounts where units > 0) - Current value (sum of net
   * units per fund * current NAV) - Total units (sum of all transaction units)
   *
   * @param userId The user ID
   * @param goalId The goal ID
   * @return Optional containing the aggregated portfolio projection if data exists
   */
  @Query(
      """
      SELECT
        g.id AS goalId,
        g.title AS goalTitle,
        g.targetAmount AS targetAmount,
        COALESCE(SUM(t.amount), 0) AS investedAmount,
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN t.units * f.nav ELSE t.amount END), 0) AS currentValue
      FROM Goal g
      LEFT JOIN Transaction t ON t.goal.id = g.id AND t.user.id = :userId AND t.status in ('COMPLETED', 'SUBMITTED')
      LEFT JOIN t.fund f
      WHERE g.id = :goalId
      GROUP BY g.id, g.title, g.targetAmount
      """)
  GoalPortfolioProjection findGoalPortfolioAggregated(
      @Param("userId") Long userId, @Param("goalId") Long goalId);
}
