-- Add soft delete support for children

ALTER TABLE children
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE children
    ADD COLUMN deleted_at TIMESTAMP;
