package com.nested.app.repository;

import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionType;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  List<Transaction> findByUserId(Long userId);

  List<Transaction> findByUserIdAndGoalId(Long userId, Long goalId);

  List<Transaction> findByUserIdAndFundId(Long userId, Long fundId);

  List<Transaction> findByUserIdAndExecutedAtBetween(Long userId, Timestamp start, Timestamp end);

  List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

  boolean existsBySourceOrderItemId(Long sourceOrderItemId);

  boolean existsByProviderTransactionId(String providerTransactionId);
}
