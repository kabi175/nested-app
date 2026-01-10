-- Create MFA tables
-- Migration for MFA (Multi-Factor Authentication) system

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the mfa_sessions table
CREATE TABLE IF NOT EXISTS mfa_sessions
(
    id                   UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),

    user_id              VARCHAR(64) NOT NULL, -- user ID (Firebase UID)
    action               VARCHAR(50) NOT NULL, -- MF_BUY, MF_SELL, BANK_CHANGE, etc

    channel              VARCHAR(20) NOT NULL, -- SMS | WHATSAPP | TOTP
    destination          VARCHAR(64),          -- phone or masked value

    otp_hash             CHAR(64)    NOT NULL, -- SHA-256 hash
    otp_expires_at       TIMESTAMP   NOT NULL, -- 30–60 seconds

    max_attempts         SMALLINT    NOT NULL DEFAULT 3,
    attempts             SMALLINT    NOT NULL DEFAULT 0,

    status               VARCHAR(20) NOT NULL, -- PENDING | VERIFIED | EXPIRED | FAILED

    device_id            VARCHAR(64),          -- device fingerprint (optional)
    ip_address           INET,                 -- audit & risk checks
    user_agent           TEXT,

    mfa_token            TEXT,                 -- short-lived MFA token (JWT)
    mfa_token_expires_at TIMESTAMP,            -- MFA token expiry

    verified_at          TIMESTAMP,
    created_at           TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_mfa_sessions_status CHECK (status IN
                                              ('PENDING', 'VERIFIED', 'EXPIRED',
                                               'FAILED')),
    CONSTRAINT chk_mfa_sessions_channel CHECK (channel IN ('SMS', 'WHATSAPP',
                                                           'TOTP', 'EMAIL'))
);

-- Create the mfa_attempts table
CREATE TABLE IF NOT EXISTS mfa_attempts
(
    id             BIGSERIAL PRIMARY KEY,

    mfa_session_id UUID      NOT NULL,
    attempted_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    success        BOOLEAN   NOT NULL,

    ip_address     INET,
    user_agent     TEXT,

    CONSTRAINT fk_mfa_attempts_session
        FOREIGN KEY (mfa_session_id)
            REFERENCES mfa_sessions (id)
            ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_mfa_sessions_user_id ON mfa_sessions (user_id);
CREATE INDEX idx_mfa_sessions_status ON mfa_sessions (status);
CREATE INDEX idx_mfa_sessions_created_at ON mfa_sessions (created_at);
CREATE INDEX idx_mfa_sessions_user_id_status ON mfa_sessions (user_id, status);
CREATE INDEX idx_mfa_attempts_session_id ON mfa_attempts (mfa_session_id);
CREATE INDEX idx_mfa_attempts_attempted_at ON mfa_attempts (attempted_at);

-- Add comments to tables
COMMENT ON TABLE mfa_sessions IS 'Stores MFA sessions with OTP hashes and verification status';
COMMENT ON TABLE mfa_attempts IS 'Tracks OTP verification attempts for audit and security purposes';

