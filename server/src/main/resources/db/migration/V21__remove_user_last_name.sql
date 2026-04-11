-- Merge last_name into first_name for users who have both fields populated.
-- After this migration, first_name holds the user's full name and last_name
-- is no longer read or written by the application.
UPDATE users
SET first_name = CONCAT(first_name, ' ', last_name)
WHERE last_name IS NOT NULL
  AND last_name != '';

ALTER TABLE users DROP COLUMN last_name;
