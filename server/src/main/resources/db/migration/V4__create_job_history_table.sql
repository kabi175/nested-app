-- Create job_history table
-- Migration for JobHistory entity to track Quartz job execution history

-- Create the job_history table
CREATE TABLE IF NOT EXISTS job_history (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(255) NOT NULL,
    trigger_name VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_ms BIGINT,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    CONSTRAINT chk_job_history_status CHECK (status IN ('SUCCESS', 'FAILURE'))
);

-- Create indexes for query performance
CREATE INDEX idx_job_history_job_name ON job_history(job_name);
CREATE INDEX idx_job_history_status ON job_history(status);
CREATE INDEX idx_job_history_start_time ON job_history(start_time);

-- Create composite index for common queries
CREATE INDEX idx_job_history_job_name_start_time ON job_history(job_name, start_time DESC);

-- Add comment to the table
COMMENT ON TABLE job_history IS 'Tracks execution history of Quartz jobs including timing, status, and errors';

