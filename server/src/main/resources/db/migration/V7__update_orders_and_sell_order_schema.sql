-- Migration for Order and SellOrder entity changes
-- Changes:
-- 1. Order.amount: Changed from NOT NULL to NULL (nullable)
-- 2. SellOrder: Removed duplicate 'amount' field (now using inherited field from Order)
-- 3. SellOrder: Removed 'units' field
-- 4. SellOrder: Keeping 'reason' field

-- IMPORTANT: Backup data before running this migration in production
-- The units column will be dropped, resulting in data loss

-- 1. Make amount column nullable in orders table
-- This allows flexibility for different order types
ALTER TABLE orders
ALTER COLUMN amount DROP NOT NULL;

-- 3. Add reason column if it doesn't exist (for SellOrder)
-- This column stores the reason for selling
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS reason VARCHAR(255);