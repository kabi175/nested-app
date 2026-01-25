-- Add soft delete support for goals

ALTER TABLE goals
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE goals
    ADD COLUMN deleted_at TIMESTAMP;

ALTER TABLE goals
    ADD COLUMN transferred_to_goal_id BIGINT;

ALTER TABLE goals
    ADD CONSTRAINT fk_goals_transferred_to_goal
        FOREIGN KEY (transferred_to_goal_id) REFERENCES goals (id);
