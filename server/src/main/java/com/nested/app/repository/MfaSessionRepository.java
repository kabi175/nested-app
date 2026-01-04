package com.nested.app.repository;

import com.nested.app.entity.MfaSession;
import com.nested.app.enums.MfaStatus;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MfaSessionRepository extends JpaRepository<MfaSession, UUID> {

  Optional<MfaSession> findByIdAndUserId(UUID id, String userId);

  List<MfaSession> findByUserIdAndStatus(String userId, MfaStatus status);

  @Query("SELECT s FROM MfaSession s WHERE s.status = :status AND s.createdAt < :beforeDate")
  List<MfaSession> findExpiredSessions(
      @Param("status") MfaStatus status, @Param("beforeDate") Timestamp beforeDate);

  @Query(
      "SELECT s FROM MfaSession s WHERE s.userId = :userId AND s.action = :action AND s.status = 'PENDING' ORDER BY s.createdAt DESC")
  List<MfaSession> findActiveSessionsByUserAndAction(
      @Param("userId") String userId, @Param("action") String action);
}
