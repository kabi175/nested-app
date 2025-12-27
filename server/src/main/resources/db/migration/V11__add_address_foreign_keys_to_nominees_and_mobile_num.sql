ALTER TABLE nominee
    RENAME COLUMN address TO mobile_number;

ALTER TABLE nominee
    ADD nominee_address_id BIGINT;

ALTER TABLE nominee
    ADD CONSTRAINT uc_nominee_nominee_address UNIQUE (nominee_address_id);

ALTER TABLE nominee
    ADD CONSTRAINT FK_NOMINEE_ON_NOMINEE_ADDRESS FOREIGN KEY (nominee_address_id) REFERENCES addresses (id);

ALTER TABLE nominee
    DROP
        COLUMN guardian_address;

ALTER TABLE nominee
    DROP
        COLUMN guardian_email;

ALTER TABLE nominee
    DROP
        COLUMN guardian_pan;

DROP TABLE users_bank_details CASCADE;