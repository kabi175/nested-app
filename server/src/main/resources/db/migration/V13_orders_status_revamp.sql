ALTER TABLE orders
    ADD is_placed BOOLEAN;

ALTER TABLE orders
    ALTER COLUMN is_placed SET DEFAULT false;

UPDATE orders
SET is_placed = false
WHERE status = 'NOT_PLACED';

UPDATE orders
SET is_placed = true
WHERE status = 'PLACED';


ALTER TABLE orders
    ALTER COLUMN is_placed SET NOT NULL;

ALTER TABLE orders
    DROP COLUMN status;

DROP TABLE order_log CASCADE;