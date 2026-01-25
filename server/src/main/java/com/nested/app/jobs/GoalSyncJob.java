package com.nested.app.jobs;

import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.entity.Goal;
import com.nested.app.entity.User;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import com.nested.app.repository.UserRepository;
import com.nested.app.services.PortfolioService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Quartz job that synchronizes a Goal's currentAmount and monthlySip fields. - currentAmount is
 * updated from PortfolioService.getGoalPortfolio().currentValue - monthlySip is updated from the
 * sum of SIP OrderItems where status is COMPLETED or IN_PROGRESS
 */
@Slf4j
@Component
public class GoalSyncJob implements Job {

  private static final List<String> ACTIVE_SIP_STATUSES = List.of("completed", "in_progress");

  @Autowired private PortfolioService portfolioService;
  @Autowired private TenantAwareGoalRepository goalRepository;
  @Autowired private OrderItemsRepository orderItemsRepository;
  @Autowired private UserRepository userRepository;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    Long goalId = data.getLong("goalId");
    Long userId = data.getLong("userId");

    log.info("Executing GoalSyncJob for goalId={}, userId={}", goalId, userId);

    try {
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) {
        log.warn("User not found for userId={}, skipping goal sync", userId);
        return;
      }

      Goal goal = goalRepository.findById(goalId, user).orElse(null);
      if (goal == null) {
        log.warn("Goal not found for goalId={}, userId={}, skipping goal sync", goalId, userId);
        return;
      }

      // Update currentAmount from portfolio
      PortfolioGoalDTO portfolio = portfolioService.getGoalPortfolio(goalId, user);
      if (portfolio != null && portfolio.getCurrentValue() != null) {
        goal.setCurrentAmount(portfolio.getCurrentValue());
        log.debug(
            "Updated goal currentAmount to {} for goalId={}", portfolio.getCurrentValue(), goalId);
      } else {
        goal.setCurrentAmount(0.0);
        log.debug("No portfolio data found, setting currentAmount to 0 for goalId={}", goalId);
      }

      if (portfolio != null && portfolio.getInvestedAmount() != null) {
        goal.setInvestedAmount(portfolio.getInvestedAmount());
        log.debug(
            "Updated goal investedAmount to {} for goalId={}",
            portfolio.getInvestedAmount(),
            goalId);
      } else {
        goal.setInvestedAmount(0.0);
        log.debug("No portfolio data found, setting investedAmount to 0 for goalId={}", goalId);
      }

      // Update monthlySip from SIP order items
      Double sipAmount =
          orderItemsRepository.sumSipOrderItemsAmountByGoalIdAndStatuses(
              goalId, ACTIVE_SIP_STATUSES);
      goal.setMonthlySip(sipAmount != null ? sipAmount : 0.0);
      log.debug("Updated goal monthlySip to {} for goalId={}", sipAmount, goalId);

      goalRepository.save(goal);
      log.info(
          "Successfully synced goal for goalId={}, currentAmount={}, investedAmount={} "
              + "monthlySip={}",
          goalId,
          goal.getCurrentAmount(),
          goal.getInvestedAmount(),
          goal.getMonthlySip());

    } catch (Exception e) {
      log.error("Error executing GoalSyncJob for goalId={}, userId={}", goalId, userId, e);
      throw new JobExecutionException(e);
    }
  }
}
