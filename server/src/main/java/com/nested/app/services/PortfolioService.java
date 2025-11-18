package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.dto.PortfolioOverallDTO;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Transaction;
import com.nested.app.repository.FundRepository;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.TransactionRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  private final GoalRepository goalRepository;
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
  public List<PortfolioGoalDTO> getGoalsPortfolio() {
    var user = userContext.getUser();
    if (user == null) {
      return List.of();
    }
    List<Transaction> txns = transactionRepository.findByUserId(user.getId());
    double totalCurrentValue = computeTotalCurrentValue(txns);
    return buildGoalBreakdown(txns, totalCurrentValue);
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
    Goal goal = txns.get(0).getGoal();
    double progress =
        goal.getTargetAmount() > 0 ? currentValue / goal.getTargetAmount() * 100.0 : 0.0;
    // allocation determined externally; set 0 for single view
    return new PortfolioGoalDTO(
        goal.getId(),
        goal.getTitle(),
        goal.getTargetAmount(),
        invested,
        currentValue,
        units,
        progress,
        0.0);
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
      Goal goal = gTxns.get(0).getGoal();
      double progress =
          goal.getTargetAmount() > 0 ? currentValue / goal.getTargetAmount() * 100.0 : 0.0;
      double allocation = totalCurrentValue > 0 ? currentValue / totalCurrentValue * 100.0 : 0.0;
      result.add(
          new PortfolioGoalDTO(
              goal.getId(),
              goal.getTitle(),
              goal.getTargetAmount(),
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
}
