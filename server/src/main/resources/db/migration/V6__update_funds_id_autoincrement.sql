-- Add auto-incrementing BIGSERIAL sequence for funds id column
ALTER TABLE funds ALTER COLUMN id TYPE BIGINT;
CREATE SEQUENCE IF NOT EXISTS funds_id_seq OWNED BY funds.id;
ALTER TABLE funds ALTER COLUMN id SET DEFAULT nextval('funds_id_seq');

