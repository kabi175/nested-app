package com.nested.app.repository;

import com.nested.app.entity.BankDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for BankDetail entity
 * Provides database access methods for bank detail operations
 */
@Repository
public interface BankDetailRepository extends JpaRepository<BankDetail, Long> {


    List<BankDetail> findAllByUserId(Long userId);

  /**
   * Find bank detail by account number and IFSC code
   *
   * @param accountNumber account number
   * @param ifscCode IFSC code
   * @return Optional bank detail
   */
  List<BankDetail> findAllByAccountNumberAndIfscCode(String accountNumber, String ifscCode);
}
