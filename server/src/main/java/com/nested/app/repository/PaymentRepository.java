package com.nested.app.repository;

import com.nested.app.entity.Payment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Payment entity Provides data access methods for payment-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

  /**
   * Find payments by user ID
   *
   * @param userId User ID
   * @return List of payments for the specified user
   */
  List<Payment> findByUserId(Long userId);

  /**
   * Find payments by child ID
   *
   * @param childId Child ID
   * @return List of payments for the specified child
   */
  List<Payment> findByChildId(Long childId);

  /**
   * Find payments by status
   *
   * @param status Payment status
   * @return List of payments with the specified status
   */
  List<Payment> findByStatus(Payment.PaymentStatus status);

  /**
   * Find payments by verification status
   *
   * @param verificationStatus Verification status
   * @return List of payments with the specified verification status
   */
  List<Payment> findByVerificationStatus(Payment.VerificationStatus verificationStatus);

  /**
   * Find payments by user ID and child ID
   *
   * @param userId User ID
   * @param childId Child ID
   * @return List of payments for the specified user and child
   */
  List<Payment> findByUserIdAndChildId(Long userId, Long childId);
}
