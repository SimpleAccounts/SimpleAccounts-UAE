--liquibase formatted sql
--changeset gemini:5

INSERT INTO industry_type (industry_type_code, created_by, created_date, default_flag, delete_flag, industry_type_name, version_number) VALUES
(201, 1, CURRENT_DATE, 'N', 'false', 'Technology', 1),
(202, 1, CURRENT_DATE, 'N', 'false', 'Healthcare', 1),
(203, 1, CURRENT_DATE, 'N', 'false', 'Finance', 1),
(204, 1, CURRENT_DATE, 'N', 'false', 'Retail', 1);

