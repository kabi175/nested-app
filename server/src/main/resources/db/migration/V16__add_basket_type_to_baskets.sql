-- Add basket_type column to baskets table
ALTER TABLE baskets
    ADD COLUMN basket_type VARCHAR(50) NOT NULL DEFAULT 'EDUCATION';

UPDATE baskets
set basket_type = 'SUPER_FD'
where title in
      ('gold-silver-basket',
       'secure-money', 'grow-money');

-- Add index for faster lookups by basket_type
CREATE INDEX idx_baskets_basket_type ON baskets (basket_type);
