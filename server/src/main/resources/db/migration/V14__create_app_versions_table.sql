CREATE TABLE app_versions
(
    id                    BIGSERIAL PRIMARY KEY,
    platform              VARCHAR(20)  NOT NULL UNIQUE,
    min_supported_version VARCHAR(50)  NOT NULL,
    latest_version        VARCHAR(50)  NOT NULL,
    message               TEXT,
    store_url             VARCHAR(255) NOT NULL,
    release_notes         TEXT,
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

