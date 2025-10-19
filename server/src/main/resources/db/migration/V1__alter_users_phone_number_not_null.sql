-- Migration to make phone_number column NULLABLE in users table
-- Created: 2025-10-19

-- Step 1: Make the column nullable (drop NOT NULL constraint if exists)
ALTER TABLE users
ALTER COLUMN phone_number DROP NOT NULL;

-- Step 2: Add a comment for documentation
COMMENT ON COLUMN users.phone_number IS 'User phone number - optional for authentication';
