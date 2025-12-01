-- Create folio table
-- Migration for Folio entity

-- Create the folio table
CREATE TABLE IF NOT EXISTS folio (
    id BIGSERIAL PRIMARY KEY,
    ref VARCHAR(255) NOT NULL,
    investor_id BIGINT,
    user_id BIGINT NOT NULL,
    fund_id BIGINT,
    CONSTRAINT fk_folio_investor FOREIGN KEY (investor_id) REFERENCES investors(id),
    CONSTRAINT fk_folio_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_folio_fund FOREIGN KEY (fund_id) REFERENCES funds(id)
);

-- Create unique index on ref to ensure folio reference numbers are unique
CREATE UNIQUE INDEX idx_folio_ref ON folio(ref);

-- Create indexes on foreign keys for better query performance
CREATE INDEX idx_folio_investor_id ON folio(investor_id);
CREATE INDEX idx_folio_user_id ON folio(user_id);
CREATE INDEX idx_folio_fund_id ON folio(fund_id);

