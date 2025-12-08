package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.GoalHoldingDTO;
import com.nested.app.dto.MinifiedGoalDTO;
import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.dto.PortfolioOverallDTO;
import com.nested.app.dto.TransactionDTO;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Transaction;
import com.nested.app.repository.FundRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import com.nested.app.repository.TransactionRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
  private final UserContext userContext;

  @Transactional(readOnly = true)
  public PortfolioOverallDTO getOverallPortfolio() {
    // Fetch all transactions for current request-scoped user; return zeroed DTO if none.
    var user = userContext.getUser();
    if (user == null) {
      return new PortfolioOverallDTO(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, List.of());
    }
    List<Transaction> txns = transactionRepository.findByUserId(user.getId());
    if (txns.isEmpty()) {
      return new PortfolioOverallDTO(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, List.of());
    }

    double totalInvested =
        txns.stream().filter(t -> t.getUnits() > 0).mapToDouble(Transaction::getAmount).sum();
    double totalRealized =
        txns.stream().filter(t -> t.getUnits() < 0).mapToDouble(Transaction::getAmount).sum();

    // Aggregate net units per fund
    Map<Long, Double> fundUnits =
        txns.stream()
            .collect(
                Collectors.groupingBy(
                    t -> t.getFund().getId(), Collectors.summingDouble(Transaction::getUnits)));
    // Cost basis: sum(amount of positive units) - sum(amount of negative units) limited to
    // remaining open units naive approach
    double totalUnits = fundUnits.values().stream().mapToDouble(Double::doubleValue).sum();

    // Fetch current nav for each fund to compute current value
    Map<Long, Fund> fundMap =
        fundRepository.findAllById(fundUnits.keySet()).stream()
            .collect(Collectors.toMap(Fund::getId, f -> f));
    double totalCurrentValue =
        fundUnits.entrySet().stream()
            .mapToDouble(
                e -> {
                  Fund f = fundMap.get(e.getKey());
                  if (f == null) return 0.0;
                  return e.getValue() * f.getNav();
                })
            .sum();

    // Approximate cost of open positions: sum of positive txn amounts minus absolute of negative
    // txn amounts (bounded to not exceed positive)
    double positiveAmount =
        txns.stream().filter(t -> t.getUnits() > 0).mapToDouble(Transaction::getAmount).sum();
    double negativeAmount =
        txns.stream().filter(t -> t.getUnits() < 0).mapToDouble(Transaction::getAmount).sum();
    double openCostBasis = Math.max(0.0, positiveAmount - negativeAmount);
    double unrealizedGain = totalCurrentValue - openCostBasis;
    double returnPct =
        totalInvested > 0 ? (totalCurrentValue - totalInvested) / totalInvested * 100.0 : 0.0;

    // Goal breakdown
    List<PortfolioGoalDTO> goalDtos = buildGoalBreakdown(txns, totalCurrentValue);

    return new PortfolioOverallDTO(
        totalInvested,
        totalCurrentValue,
        totalUnits,
        Math.abs(totalRealized),
        unrealizedGain,
        returnPct,
        goalDtos);
  }

  @Transactional(readOnly = true)
  public PortfolioGoalDTO getGoalPortfolio(Long goalId) {
    var user = userContext.getUser();
    if (user == null) return null;
    List<Transaction> txns = transactionRepository.findByUserIdAndGoalId(user.getId(), goalId);
    if (txns.isEmpty()) return null;
    double currentValue = computeTotalCurrentValue(txns);
    double invested =
        txns.stream().filter(t -> t.getUnits() > 0).mapToDouble(Transaction::getAmount).sum();
    double units = txns.stream().mapToDouble(Transaction::getUnits).sum();
    Goal goal = txns.getFirst().getGoal();
    double progress =
        goal.getTargetAmount() > 0 ? currentValue / goal.getTargetAmount() * 100.0 : 0.0;
    // allocation determined externally; set 0 for single view
    return new PortfolioGoalDTO(
        MinifiedGoalDTO.fromEntity(goal), invested, currentValue, units, progress, 0.0);
  }

  private List<PortfolioGoalDTO> buildGoalBreakdown(
      List<Transaction> txns, double totalCurrentValue) {
    // Group transactions by goal and compute invested, units, current value and percentage shares
    Map<Long, List<Transaction>> byGoal =
        txns.stream()
            .filter(t -> t.getGoal() != null)
            .collect(Collectors.groupingBy(t -> t.getGoal().getId()));
    List<PortfolioGoalDTO> result = new ArrayList<>();
    for (var entry : byGoal.entrySet()) {
      List<Transaction> gTxns = entry.getValue();
      double invested =
          gTxns.stream().filter(t -> t.getUnits() > 0).mapToDouble(Transaction::getAmount).sum();
      double units = gTxns.stream().mapToDouble(Transaction::getUnits).sum();
      double currentValue = computeTotalCurrentValue(gTxns);
      Goal goal = gTxns.getFirst().getGoal();
      double progress =
          goal.getTargetAmount() > 0 ? currentValue / goal.getTargetAmount() * 100.0 : 0.0;
      double allocation = totalCurrentValue > 0 ? currentValue / totalCurrentValue * 100.0 : 0.0;
      result.add(
          new PortfolioGoalDTO(
              MinifiedGoalDTO.fromEntity(goal),
              invested,
              currentValue,
              units,
              progress,
              allocation));
    }
    return result;
  }

  private double computeTotalCurrentValue(List<Transaction> txns) {
    // Sum (net units per fund * latest nav) across all funds in the transaction set
    Map<Long, Double> fundUnits =
        txns.stream()
            .collect(
                Collectors.groupingBy(
                    t -> t.getFund().getId(), Collectors.summingDouble(Transaction::getUnits)));
    if (fundUnits.isEmpty()) return 0.0;
    Map<Long, Fund> fundMap =
        fundRepository.findAllById(fundUnits.keySet()).stream()
            .collect(Collectors.toMap(Fund::getId, f -> f));
    return fundUnits.entrySet().stream()
        .mapToDouble(
            e -> {
              Fund f = fundMap.get(e.getKey());
              if (f == null) return 0.0;
              return e.getValue() * f.getNav();
            })
        .sum();
  }

  @Transactional(readOnly = true)
  public List<TransactionDTO> getGoalTransactions(Long goalId, Pageable pageable) {
    var user = userContext.getUser();
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
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<GoalHoldingDTO> getGoalHoldings(Long goalId) {
    var user = userContext.getUser();
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
        holdingProjections.stream().mapToDouble(h -> h.getTotalUnits() * h.getCurrentNav()).sum();

    // Map projections to DTOs with calculated fields
    return holdingProjections.stream()
        .map(
            h -> {
              double currentValue = h.getTotalUnits() * h.getCurrentNav();
              double returnsAmount = currentValue - h.getInvestedAmount();
              double allocationPercentage =
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
        .collect(Collectors.toList());
  }
}
