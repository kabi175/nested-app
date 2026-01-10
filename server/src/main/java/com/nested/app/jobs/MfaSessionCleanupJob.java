package com.nested.app.jobs;

import com.nested.app.entity.MfaSession;
import com.nested.app.enums.MfaStatus;
import com.nested.app.repository.MfaSessionRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Scheduled job to clean up expired MFA sessions older than 24 hours. Runs every 6 hours. */
@Slf4j
@Component
@RequiredArgsConstructor
public class MfaSessionCleanupJob {

  private final MfaSessionRepository mfaSessionRepository;

  @Scheduled(fixedDelayString = "6h")
  @Transactional
  public void cleanupExpiredSessions() {
    try {
      log.info("Starting MFA session cleanup job");

      // Calculate cutoff time (24 hours ago)
      Timestamp cutoffTime = Timestamp.from(Instant.now().minusSeconds(24 * 60 * 60));

      // Find expired sessions
      List<MfaSession> expiredSessions =
          mfaSessionRepository.findExpiredSessions(MfaStatus.PENDING, cutoffTime);
      expiredSessions.addAll(
          mfaSessionRepository.findExpiredSessions(MfaStatus.VERIFIED, cutoffTime));
      expiredSessions.addAll(
          mfaSessionRepository.findExpiredSessions(MfaStatus.FAILED, cutoffTime));
      expiredSessions.addAll(
          mfaSessionRepository.findExpiredSessions(MfaStatus.EXPIRED, cutoffTime));

      // Delete expired sessions (cascade will delete attempts)
      int deletedCount = 0;
      for (MfaSession session : expiredSessions) {
        if (session.getCreatedAt().before(cutoffTime)) {
          mfaSessionRepository.delete(session);
          deletedCount++;
        }
      }

      log.info("MFA session cleanup completed: deleted {} sessions", deletedCount);
    } catch (Exception e) {
      log.error("Error executing MFA session cleanup job: {}", e.getMessage(), e);
    }
  }
}
