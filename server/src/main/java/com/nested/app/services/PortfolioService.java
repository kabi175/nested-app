package com.nested.app.services;

import com.nested.app.dto.GoalHoldingDTO;
import com.nested.app.dto.GoalHoldingProjection;
import com.nested.app.dto.MinifiedGoalDTO;
import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.dto.TransactionDTO;
import com.nested.app.entity.User;
import com.nested.app.repository.FundRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import com.nested.app.repository.TransactionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service providing portfolio aggregation views for a user: - Overall portfolio metrics (invested,
 * current value, unrealized gain, returns) - Goal-level breakdowns
 *
 * <p>Simplified cost basis approach: openCostBasis = sum(buy amounts) - sum(sell amounts). This is
 * a naive approximation; replace with FIFO/LIFO or average cost for accurate tax/PnL.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {

  private final TransactionRepository transactionRepository;
  private final TenantAwareGoalRepository goalRepository;
  private final FundRepository fundRepository;

  

  @Transactional(readOnly = true)
  public PortfolioGoalDTO getGoalPortfolio(Long goalId, User user) {
    if (user == null) return null;

    // Fetch aggregated portfolio data from database with calculations done in SQL
    var projection = transactionRepository.findGoalPortfolioAggregated(user.getId(), goalId);
    if (projection == null || projection.getGoalId() == null) return null;

    double currentValue = projection.getCurrentValue();
    double invested = projection.getInvestedAmount();
    double targetAmount = projection.getTargetAmount();
    double progress = targetAmount > 0 ? currentValue / targetAmount * 100.0 : 0.0;

    // allocation determined externally; set 0 for single view
    return new PortfolioGoalDTO(
        new MinifiedGoalDTO(projection.getGoalId(), projection.getGoalTitle()),
        invested,
        currentValue,
        progress,
        0.0);
  }

  @Transactional(readOnly = true)
  public List<TransactionDTO> getGoalTransactions(Long goalId, Pageable pageable, User user) {
    if (user == null) {
      return List.of();
    }

    // Fetch transactions with pagination applied at the database level
    var txnPage = transactionRepository.findByUserIdAndGoalId(user.getId(), goalId, pageable);

    // Map to DTOs
    return txnPage.getContent().stream()
        .map(
            t ->
                new TransactionDTO(
                    t.getId(),
                    t.getFund().getLabel(),
                    t.getType(),
                    t.getUnits(),
                    t.getStatus(),
                    t.getUnitPrice(),
                    t.getAmount(),
                    t.getExecutedAt()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<GoalHoldingDTO> getGoalHoldings(Long goalId, User user) {
    if (user == null) {
      return List.of();
    }

    // Fetch aggregated holdings data from database with grouping and calculations done in SQL
    var holdingProjections = transactionRepository.findGoalHoldingsAggregated(user.getId(), goalId);

    if (holdingProjections.isEmpty()) {
      return List.of();
    }

    // Calculate total goal current value for allocation percentages
    double totalGoalCurrentValue =
        holdingProjections.stream().mapToDouble(GoalHoldingProjection::getCurrentValue).sum();

    // Map projections to DTOs with calculated fields
    return holdingProjections.stream()
        .map(
            h -> {
              Double currentValue = h.getCurrentValue();
              Double returnsAmount = currentValue - h.getInvestedAmount();
              Double allocationPercentage =
                  totalGoalCurrentValue > 0 ? (currentValue / totalGoalCurrentValue * 100.0) : 0.0;

              return new GoalHoldingDTO(
                  h.getFundLabel(),
                  h.getFundId(),
                  h.getCurrentNav(),
                  h.getAverageNav(),
                  h.getTotalUnits(),
                  allocationPercentage,
                  h.getInvestedAmount(),
                  currentValue,
                  returnsAmount);
            })
        .toList();
  }
}
