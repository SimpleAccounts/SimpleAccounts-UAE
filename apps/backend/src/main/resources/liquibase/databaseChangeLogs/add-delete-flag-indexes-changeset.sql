--liquibase formatted sql

--changeset performance:add-delete-flag-indexes

-- Add indexes on delete_flag columns to improve query performance
-- These indexes will significantly speed up EXISTS and COUNT queries

CREATE INDEX IF NOT EXISTS idx_invoice_delete_flag ON invoice(delete_flag) WHERE delete_flag = false;
CREATE INDEX IF NOT EXISTS idx_expense_delete_flag ON expense(delete_flag) WHERE delete_flag = false;
CREATE INDEX IF NOT EXISTS idx_credit_note_delete_flag ON credit_note(delete_flag) WHERE delete_flag = false;
CREATE INDEX IF NOT EXISTS idx_product_delete_flag ON product(delete_flag) WHERE delete_flag = false;
CREATE INDEX IF NOT EXISTS idx_po_quatation_delete_flag ON po_quatation(delete_flag) WHERE delete_flag = false;

-- Note: Partial indexes (WHERE delete_flag = false) are more efficient than full indexes
-- as they only index the rows we actually query
