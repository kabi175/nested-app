package com.nested.app.repository;

import com.nested.app.entity.Payment;
import java.util.List;
import java.util.Optional;
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
   * Find payment by order reference
   *
   * @param ref - Payment reference
   * @return Optional of Payment
   */
  Optional<Payment> findByRef(String ref);
}
