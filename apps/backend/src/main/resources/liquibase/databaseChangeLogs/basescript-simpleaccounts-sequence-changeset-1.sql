--liquibase formatted sql
<!-- USER below line on top of script to execute your sql script <author : version>

--changeset Zain Khan:1

create sequence ACTIVITY_SEQ start 10000 increment 1;
create sequence BANK_ACCOUNT_SEQ start 10000 increment 1;
create sequence BANK_ACCOUNT_STATUS_SEQ start 10000 increment 1;
create sequence BANK_ACCOUNT_TYPE_SEQ start 10000 increment 1;
create sequence BANK_DETAILS_SEQ start 10000 increment 1;
create sequence BANK_FEED_STATUS_SEQ start 10000 increment 1;
create sequence CHART_OF_ACCOUNT_CATEGORY_SEQ start 10000 increment 1;
create sequence CHART_OF_ACCOUNT_SEQ start 10000 increment 1;
create sequence COA_COA_CATEGORY_SEQ start 10000 increment 1;
create sequence COAC_TRANSACTION_CATEGORY_IDCOAC_TRANSACTION_CATEGORY_SEQ start 10000 increment 1;
create sequence COMPANY_SEQ start 10000 increment 1;
create sequence COMPANY_TYPE_SEQ start 10000 increment 1;
create sequence CONFIGURATION_SEQ start 10000 increment 1;
create sequence CONTACT_SEQ start 10000 increment 1;
create sequence CONVERTED_CURRENCY_SEQ start 10000 increment 1;
create sequence COUNTRY_SEQ start 10000 increment 1;
create sequence CREDIT_NOTE_INVOICE_RELATION_SEQ start 10000 increment 1;
create sequence CREDIT_NOTE_LINE_ITEM_SEQ start 10000 increment 1;
create sequence CREDIT_NOTE_SEQ start 10000 increment 1;
create sequence CURRENCY_SEQ start 10000 increment 1;
create sequence CUSTOMER_INVOICE_RECEIPT_SEQ start 10000 increment 1;
create sequence CUSTOMIZE_INVOICE_TEMPLATE_SEQ start 10000 increment 1;
create sequence DATE_FORMAT_SEQ start 10000 increment 1;
create sequence DESIGNATION_TRANSACTION_CATEGORY_SEQ start 10000 increment 1;
create sequence DOCUMENT_TEMPLATE_SEQ start 10000 increment 1;
create sequence EMAIL_LOGS_SEQ start 10000 increment 1;
create sequence EMPLOYEE_BANK_DETAILS_SEQ start 10000 increment 1;
create sequence EMPLOYEE_DESIGNATION_SEQ start 10000 increment 1;
create sequence EMPLOYEE_PARENT_RELATION_SEQ start 10000 increment 1;
create sequence EMPLOYEE_SALARY_COMPONENT_RELATION_SEQ start 10000 increment 1;
create sequence EMPLOYEE_SEQ start 10000 increment 1;
create sequence EMPLOYEE_TRANSACTION_CATEGORY_RELATION_SEQ start 10000 increment 1;
create sequence EMPLOYEE_USER_RELATION_SEQ start 10000 increment 1;
create sequence EMPLOYMENT_SEQ start 10000 increment 1;
create sequence EXCISE_TAX_SEQ start 10000 increment 1;
create sequence EXPENSE_SEQ start 10000 increment 1;
create sequence EXPLANATION_STATUS_SEQ start 10000 increment 1;
create sequence FILE_ATTACHMENT_SEQ start 10000 increment 1;
create sequence GRN_SUPPLIER_INVOICE_RELATION_SEQ start 10000 increment 1;
create sequence IMPORTED_DRAFT_TRANSACTON_SEQ start 10000 increment 1;
create sequence INDUSTRY_TYPE_SEQ start 10000 increment 1;
create sequence INVENTORY_HISTORY_SEQ start 10000 increment 1;
create sequence INVENTORY_SEQ start 10000 increment 1;
create sequence INVOICE_LINE_ITEM_SEQ start 10000 increment 1;
create sequence INVOICE_SEQ start 10000 increment 1;
create sequence JOURNAL_LINE_ITEM_SEQ start 10000 increment 1;
create sequence JOURNAL_SEQ start 10000 increment 1;
create sequence LANGUAGE_SEQ start 10000 increment 1;
create sequence LEADGER_ENTRY_SEQ start 10000 increment 1;
create sequence MAIL_THEME_TEMPLATES_SEQ start 10000 increment 1;
create sequence NOTES_SETTINGS_SEQ start 10000 increment 1;
create sequence PASSWORD_HISTORY_SEQ start 10000 increment 1;
create sequence PATCH_SEQ start 10000 increment 1;
create sequence PAYMENT_DEBIT_NOTE_RELATION_SEQ start 10000 increment 1;
create sequence PAYMENT_SEQ start 10000 increment 1;
create sequence PAYROLL_EMPLOYEE_SEQ start 10000 increment 1;
create sequence PAYROLL_HISTORY_SEQ start 10000 increment 1;
create sequence PAYROLL_SEQ start 10000 increment 1;
create sequence PLACE_OF_SUPPLY_SEQ start 10000 increment 1;
create sequence PO_QUATATION_LINE_ITEM_SEQ start 10000 increment 1;
create sequence PO_QUATATION_SEQ start 10000 increment 1;
create sequence PRODUCT_CATEGORY_SEQ start 10000 increment 1;
create sequence PRODUCT_LINE_ITEM_SEQ start 10000 increment 1;
create sequence PRODUCT_SEQ start 10000 increment 1;
create sequence PRODUCT_WAREHOUSE_SEQ start 10000 increment 1;
create sequence PROJECT_SEQ start 10000 increment 1;
create sequence PURCHASE_LINE_ITEM_SEQ start 10000 increment 1;
create sequence PURCHASE_SEQ start 10000 increment 1;
create sequence QUOTATION_INVOICE_RELATION_SEQ start 10000 increment 1;
create sequence RECEIPT_CREDIT_NOTE_RELATION_SEQ start 10000 increment 1;
create sequence RECEIPT_SEQ start 10000 increment 1;
create sequence RECONCILE_CATEGORY_SEQ start 10000 increment 1;
create sequence RECONCILESTATUS_SEQ start 10000 increment 1;
create sequence RFQ_PO_GRN_RELATION_SEQ start 10000 increment 1;
create sequence ROLE_MODULE_RELATION_SEQ start 10000 increment 1;
create sequence ROLE_SEQ start 10000 increment 1;
create sequence SALARY_COMPONENT_SEQ start 10000 increment 1;
create sequence SALARY_ROLE_SEQ start 10000 increment 1;
create sequence SALARY_SEQ start 10000 increment 1;
create sequence SALARY_STRUCTURE_SEQ start 10000 increment 1;
create sequence SALARY_TEMPLATE_SEQ start 10000 increment 1;
create sequence SIMPLEACCOUNTS_MODULES_SEQ start 10000 increment 1;
create sequence STATE_SEQ start 10000 increment 1;
create sequence SUPPLIER_INVOICE_PAYMENT_SEQ start 10000 increment 1;
create sequence TAX_TRANSACTION_SEQ start 10000 increment 1;
create sequence TAX_TREATMENT_SEQ start 10000 increment 1;
create sequence TITLE_SEQ start 10000 increment 1;
create sequence TRANSACTION_CATEGORY_BALANCE_SEQ start 10000 increment 1;
create sequence TRANSACTION_CATEGORY_CLOSING_BALANCE_SEQ start 10000 increment 1;
create sequence TRANSACTION_CATEGORY_SEQ start 10000 increment 1;
create sequence TRANSACTION_DATA_COL_MAPPING_SEQ start 10000 increment 1;
create sequence TRANSACTION_EXPENSES_PAYROLL_SEQ start 10000 increment 1;
create sequence TRANSACTION_EXPLANATION_SEQ start 10000 increment 1;
create sequence TRANSACTION_EXPLINATION_LINE_ITEM_SEQ start 10000 increment 1;
create sequence TRANSACTION_PARSING_SETTING_SEQ start 10000 increment 1;
create sequence TRANSACTION_SEQ start 10000 increment 1;
create sequence TRANSACTON_EXPENSES_SEQ start 10000 increment 1;
create sequence TRANSACTON_INVOICES_SEQ start 10000 increment 1;
create sequence UNIT_TYPE_SEQ start 10000 increment 1;
create sequence USER_CONTACT_TRANSACTION_CATEGORY_RELATION_SEQ start 10000 increment 1;
create sequence USER_CREDENTIAL_SEQ start 10000 increment 1;
create sequence USER_SEQ start 10000 increment 1;
create sequence VAT_CATEGORY_SEQ start 10000 increment 1;
create sequence VAT_PAYMENT_SEQ start 10000 increment 1;
create sequence VAT_RECORD_PAYMENT_HISTORY_SEQ start 10000 increment 1;
create sequence VAT_REPORT_FILING_SEQ start 10000 increment 1;
create sequence VAT_TAX_AGENCY_SEQ start 10000 increment 1;

--changeset Zain Khan:2
create sequence CORPORATE_TAX_FILING_SEQ start 10000 increment 1;

--changeset Ikrama Shaikh:3
create sequence CORPORATE_TAX_DATE_SETTING_SEQ start 10000 increment 1;

--changeset Zain Khan:4
create sequence CORPORATE_TAX_PAYMENT_SEQ start 10000 increment 1;
create sequence CORPORATE_TAX_PAYMENT_HISTORY_SEQ start 10000 increment 1;

--changeset Ikrama Shaikh:5
create sequence REPORTS_COLUMN_CONFIGURATION_SEQ start 10000 increment 1;
