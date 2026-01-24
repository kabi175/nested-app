ALTER TABLE app_versions
    ADD COLUMN min_build_number   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN rollout_percentage INTEGER NOT NULL DEFAULT 100;

-- Initial data
-- Initial data
INSERT INTO app_versions (platform, min_supported_version, latest_version,
                          message, store_url, release_notes, created_at,
                          updated_at, min_build_number, rollout_percentage)
VALUES ('ANDROID', '1.0.0', '1.0.0', 'Please update to the latest version.',
        'https://play.google.com/store/apps/details?id=com.nested.app',
        'Initial release', NOW(), NOW(), 0, 100),
       ('IOS', '1.0.0', '1.0.0', 'Please update to the latest version.',
        'https://apps.apple.com/app/id123456789', 'Initial release', NOW(),
        NOW(), 0, 100);
