-- Add minSipAmount column to funds table
ALTER TABLE funds ADD COLUMN min_sip_amount float8 NOT NULL DEFAULT 0.0;
ALTER TABLE funds DROP COLUMN mim_additional_purchase_amount;

