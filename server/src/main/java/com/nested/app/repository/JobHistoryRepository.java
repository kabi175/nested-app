package com.nested.app.repository;

import com.nested.app.entity.JobHistory;
import com.nested.app.enums.JobExecutionStatus;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repository for managing JobHistory entities. Provides query methods for job execution history and
 * cleanup operations.
 */
@Repository
public interface JobHistoryRepository extends JpaRepository<JobHistory, Long> {

  /**
   * Find all job history records for a specific job name.
   *
   * @param jobName the name of the job
   * @return list of job history records
   */
  List<JobHistory> findByJobName(String jobName);

  /**
   * Find all job history records for a specific job name with pagination.
   *
   * @param jobName the name of the job
   * @param pageable pagination information
   * @return page of job history records
   */
  Page<JobHistory> findByJobName(String jobName, Pageable pageable);

  /**
   * Find all job history records with a specific status.
   *
   * @param status the execution status
   * @return list of job history records
   */
  List<JobHistory> findByStatus(JobExecutionStatus status);

  /**
   * Find all job history records within a time range.
   *
   * @param startTime the start of the time range
   * @param endTime the end of the time range
   * @return list of job history records
   */
  List<JobHistory> findByStartTimeBetween(Timestamp startTime, Timestamp endTime);

  /**
   * Find all job history records for a specific job and status.
   *
   * @param jobName the name of the job
   * @param status the execution status
   * @return list of job history records
   */
  List<JobHistory> findByJobNameAndStatus(String jobName, JobExecutionStatus status);

  /**
   * Delete all job history records older than the specified timestamp. Used for retention policy
   * enforcement.
   *
   * @param timestamp the cutoff timestamp
   * @return number of records deleted
   */
  @Modifying
  @Transactional
  @Query("DELETE FROM JobHistory jh WHERE jh.startTime < :timestamp")
  int deleteByStartTimeBefore(@Param("timestamp") Timestamp timestamp);

  /**
   * Count failed job executions within a time range.
   *
   * @param startTime the start of the time range
   * @param endTime the end of the time range
   * @return count of failed executions
   */
  @Query(
      "SELECT COUNT(jh) FROM JobHistory jh WHERE jh.status = 'FAILURE' AND jh.startTime BETWEEN"
          + " :startTime AND :endTime")
  long countFailuresBetween(
      @Param("startTime") Timestamp startTime, @Param("endTime") Timestamp endTime);
}
