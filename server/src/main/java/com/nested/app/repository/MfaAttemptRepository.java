package com.nested.app.repository;

import com.nested.app.entity.MfaAttempt;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MfaAttemptRepository extends JpaRepository<MfaAttempt, Long> {

  List<MfaAttempt> findByMfaSessionId(UUID mfaSessionId);

  @Query(
      "SELECT COUNT(a) FROM MfaAttempt a WHERE a.mfaSession.id = :sessionId AND a.success = false")
  Long countFailedAttemptsBySessionId(@Param("sessionId") UUID sessionId);
}
