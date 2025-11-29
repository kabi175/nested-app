-- Add status column to transactions table
-- Migration for Transaction.status field

-- Add the status column with default value 'PENDING'
ALTER TABLE transactions
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- Add a check constraint to ensure only valid status values
ALTER TABLE transactions
ADD CONSTRAINT chk_transaction_status
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));

-- Create an index on status for better query performance
CREATE INDEX idx_transactions_status ON transactions(status);

-- Optional: Update existing records if needed (currently all will default to 'PENDING')
-- UPDATE transactions SET status = 'COMPLETED' WHERE <condition>;

