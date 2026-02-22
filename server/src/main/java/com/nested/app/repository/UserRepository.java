package com.nested.app.repository;

import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByFirebaseUid(String firebaseUid);

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  Page<User> findByIsActive(boolean isActive, Pageable pageable);

  @Query("SELECT u FROM User u WHERE u.investor.kycRequestRef = :kycRequestRef")
  Optional<User> findByInvestor_KycRequestRef(@Param("kycRequestRef") String kycRequestRef);

  Optional<User> findByInvestor(Investor investor);
}
