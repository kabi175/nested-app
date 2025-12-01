-- Add folio_id column to transactions table
-- Migration for Transaction.folio field

-- Add the folio_id column (nullable since existing transactions won't have folios)
ALTER TABLE transactions
ADD COLUMN folio_id BIGINT;

-- Add foreign key constraint to folio table
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_folio
FOREIGN KEY (folio_id) REFERENCES folio(id);

-- Create an index on folio_id for better query performance
CREATE INDEX idx_transactions_folio_id ON transactions(folio_id);

