ALTER TABLE answers
    ADD COLUMN table_id VARCHAR(50) NOT NULL DEFAULT 'empty';

ALTER TABLE comments
    ADD COLUMN table_id VARCHAR(50) NOT NULL DEFAULT 'empty';