--liquibase formatted sql
<!-- USER below line on top of script to execute your sql script <author : version>
--changeset Zain Khan:4
SELECT now();

--changeset Zain Khan:5
ALTER TABLE journal ADD COLUMN reversal_flag boolean NOT NULL DEFAULT false;
ALTER TABLE journal_line_item ADD COLUMN reversal_flag boolean NOT NULL DEFAULT false;

--changeset Zain Khan:6
ALTER TABLE transaction_explination_line_item ADD COLUMN exchange_rate numeric(19, 9);

--changeset Suraj & Shoaib:7
ALTER TABLE Expense ADD COLUMN notes varchar(255);

--changeset Zain Khan:8
ALTER TABLE credit_note ADD COLUMN tax_type boolean NOT NULL DEFAULT false;

--changeset Zain Khan:9
ALTER TABLE transaction_explination_line_item DROP COLUMN remanining_balance;
ALTER TABLE transaction_explination_line_item ADD COLUMN explained_amount numeric(19, 2) DEFAULT 0.00;
ALTER TABLE transaction_explination_line_item ADD COLUMN converted_explained_amount numeric(19, 2) DEFAULT 0.00;
ALTER TABLE transaction_explination_line_item ADD COLUMN partially_paid boolean NOT NULL DEFAULT false;

--changeset Zain Khan:10
ALTER TABLE transaction_explanation ADD COLUMN exchange_gain_or_loss_amount numeric(19, 2) DEFAULT 0.00;

--changeset Zain Khan:11
ALTER TABLE po_quatation ADD COLUMN attachment_description varchar(255);

--changeset Mudassar Sayed:12
update mail_theme_templates set module_name = 'QUO', path = 'MailTemplates/theme1/Quotation.html', template_subject = 'QUOTATION - {QuotationNumber}'
where id = 1006;
update mail_theme_templates set module_name = 'QUO', path = 'MailTemplates/theme2/Quotation.html', template_subject = 'QUOTATION - {QuotationNumber}'
where id = 1016;

--changeset Muzammil & Shoaib:13
update role set delete_flag = true where role_code = 2;
update role set delete_flag = true where role_code = 3;
update role set delete_flag = true where role_code = 104;
update role set delete_flag = true where role_code = 105;

--changeset Zain Khan:14
ALTER TABLE contact DROP COLUMN transaction_category_code;

--changeset Zain Khan:15
ALTER TABLE transaction_explination_line_item ADD COLUMN non_converted_invoice_amount numeric(19, 2) DEFAULT 0.00;
ALTER TABLE transaction_explination_line_item ADD COLUMN converted_to_base_currency_amount numeric(19, 2) DEFAULT 0.00;

--changeset Zain Khan:16
INSERT INTO transaction_category (transaction_category_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, order_sequence, selectable_flag, transaction_category_code, transaction_category_description, transaction_category_name, version_number, chart_of_account_id, parent_transaction_category_code, vat_category_code, is_migrated_record) VALUES

    (153, 1, '2020-04-16 17:15:49', 'N', 'false', 'false', NULL, NULL, NULL, 'true', '03-01-007', 'Income', 'Sales Discount', 1, 15, NULL, NULL, 'false');

update transaction_category set transaction_category_name = 'Purchase Discount' where transaction_category_id = 102;

--changeset Shoaib:17
UPDATE country SET country_name = 'United States of America' WHERE country_code = '231';
UPDATE country SET country_name = 'United States of Minor Outlying Island' WHERE country_code = '232';

--changeset Zain Khan:18
ALTER TABLE expense ADD COLUMN vat_claimable boolean NOT NULL DEFAULT false;

--changeset Suraj & Shoaib:19
ALTER TABLE vat_report_filing ADD COLUMN vat_number varchar(50) DEFAULT '-';
INSERT INTO customize_invoice_template(customize_invoice_template_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, prefix, suffix, type, version_number)
VALUES (12, 1,'2022-12-01 00:00:00', false, null, null, null, 'VRN-', 0, 12, 1);
UPDATE country SET country_name = 'Palestine' WHERE country_code = '168';

--changeset Zain Khan:20
ALTER TABLE vat_report_filing DROP COLUMN tax_filed_on;
ALTER TABLE vat_report_filing DROP COLUMN start_date;
ALTER TABLE vat_report_filing DROP COLUMN end_date;
ALTER TABLE vat_report_filing ADD COLUMN tax_filed_on date;
ALTER TABLE vat_report_filing ADD COLUMN start_date date;
ALTER TABLE vat_report_filing ADD COLUMN end_date date;
ALTER TABLE vat_tax_agency DROP COLUMN tax_filed_on;
ALTER TABLE vat_tax_agency ADD COLUMN tax_filed_on date;

--changeset Zain Khan:21
ALTER TABLE po_quatation ADD COLUMN exchange_rate numeric(19,9);

--changeset Zain Khan:22
ALTER TABLE po_quatation ADD COLUMN quotation_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

--changeset Zain Khan:23
UPDATE tax_treatment SET tax_treatment = 'UAE VAT REGISTERED' WHERE tax_treatment_id = '1';
UPDATE tax_treatment SET tax_treatment = 'UAE NON-VAT REGISTERED' WHERE tax_treatment_id = '2';
UPDATE tax_treatment SET tax_treatment = 'UAE VAT REGISTERED FREEZONE' WHERE tax_treatment_id = '3';
UPDATE tax_treatment SET tax_treatment = 'UAE NON-VAT REGISTERED FREEZONE' WHERE tax_treatment_id = '4';

--changeset Zain Khan:24
ALTER TABLE expense ADD COLUMN bank_generated_expense boolean NOT NULL DEFAULT false;

--changeset Zain Khan:25
INSERT INTO transaction_category (transaction_category_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, order_sequence, selectable_flag, transaction_category_code, transaction_category_description, transaction_category_name, version_number, chart_of_account_id, parent_transaction_category_code, vat_category_code, is_migrated_record) VALUES

    (154, 1, '2020-04-16 17:15:49', 'N', 'false', 'false', NULL, NULL, NULL, 'true', '02-02-006', 'Other Liability', 'Output VAT Adjustment', 1, 13, NULL, NULL, 'false'),
    (155, 1, '2020-04-16 17:15:49', 'N', 'false', 'false', NULL, NULL, NULL, 'true', '01-06-007', 'Other Current Asset', 'Input VAT Adjustment', 1, 11, NULL, NULL, 'false');

--changeset Zain Khan:26
UPDATE role SET delete_flag = false where delete_flag=true;

--changeset Zain Khan:27
INSERT INTO bank_details (bank_id, created_by, created_date, delete_flag, bank_name) VALUES
    (63, 1, '2020-04-16 17:15:48', 'false', 'Liv Bank by EmiratesNBD'),
    (64, 1, '2020-04-16 17:15:48', 'false', 'Wio Bank');

--changeset Zain Khan:28
INSERT INTO bank_details (bank_id, created_by, created_date, delete_flag, bank_name) VALUES
	 (999, 1, '2023-04-15 17:15:48', 'false', 'Others');

--changeset Zain Khan:29
ALTER TABLE transaction_explination_line_item ADD COLUMN journal_id integer;
ALTER TABLE IF EXISTS public.transaction_explination_line_item
    ADD CONSTRAINT fk_transaction_explination_line_item_journal_id_journal FOREIGN KEY (journal_id)
    REFERENCES public.journal (journal_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;

--changeset Shoaib:30
INSERT INTO public.simpleaccounts_modules(
    simpleaccounts_module_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, module_type, order_sequence, selectable_flag, simpleaccounts_module_name, version_number, parent_simpleaccounts_module_id)
VALUES (281, 1, '2023-06-26 00:00:00', 'N', false, false, null, null, 'Feature', 388, true, 'Corporate Tax', 1, 152);

INSERT INTO public.role_module_relation(
    role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
VALUES (1939, 1, '2023-06-26 00:00:00', false, null, null, null, 1, 1, 281);

--changeset Ikrama Shaikh:31
CREATE TABLE IF NOT EXISTS public.corporate_tax_filing
(
    corporate_tax_filing_id integer NOT NULL,
    ct_start_date timestamp without time zone,
    ct_end_date timestamp without time zone,
    due_date timestamp without time zone,
    net_income numeric(19, 2) DEFAULT 0.00,
    taxable_amount numeric(19, 2) DEFAULT 0.00,
    tax_amount numeric(19, 2) DEFAULT 0.00,
    ct_filed_on timestamp without time zone,
    status integer DEFAULT 1,
    balance_due numeric(19, 2) DEFAULT 0.00,
    reporting_period character varying(255) COLLATE pg_catalog."default",
    ct_report_for_year character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    version_number integer DEFAULT 1,
    CONSTRAINT corporate_tax_filing_pkey PRIMARY KEY (corporate_tax_filing_id)
    );

    CREATE TABLE IF NOT EXISTS public.corporate_tax_payment
    (
        corporate_tax_payment_id integer NOT NULL,
        total_amount numeric(19, 2) DEFAULT 0.00,
        balance_due numeric(19, 2) DEFAULT 0.00,
        amount_paid numeric(19, 2) DEFAULT 0.00,
        reference_number character varying(255) COLLATE pg_catalog."default",
        payment_date timestamp without time zone,
        created_by integer NOT NULL DEFAULT 0,
        created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        delete_flag boolean NOT NULL DEFAULT false,
        last_updated_by integer,
        last_update_date timestamp without time zone,
        version_number integer DEFAULT 1,
        transaction_id integer,
        corporate_tax_filing_id integer,
        CONSTRAINT corporate_tax_payment_pkey PRIMARY KEY (corporate_tax_payment_id)
        );
        ALTER TABLE IF EXISTS public.corporate_tax_payment
            ADD CONSTRAINT fk_corporate_tax_payment_transaction_id_transaction FOREIGN KEY (transaction_id)
            REFERENCES public.transaction (transaction_id) MATCH SIMPLE
            ON UPDATE NO ACTION
               ON DELETE NO ACTION;

        ALTER TABLE IF EXISTS public.corporate_tax_payment
                   ADD CONSTRAINT fk_corporate_tax_payment_corporate_tax_filing_id_corporate_tax_filing FOREIGN KEY (corporate_tax_filing_id)
                   REFERENCES public.corporate_tax_filing (corporate_tax_filing_id) MATCH SIMPLE
                   ON UPDATE NO ACTION
                      ON DELETE NO ACTION;

    CREATE TABLE IF NOT EXISTS public.corporate_tax_payment_history
    (
        corporate_tax_payment_history_id integer NOT NULL,
        ct_start_date timestamp without time zone,
        ct_end_date timestamp without time zone,
        amount_paid numeric(19, 2) DEFAULT 0.00,
        payment_date timestamp without time zone,
        created_by integer NOT NULL DEFAULT 0,
        created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_updated_by integer,
        last_update_date timestamp without time zone,
        version_number integer DEFAULT 1,
        corporate_tax_payment_id integer,
        CONSTRAINT corporate_tax_payment_history_pkey PRIMARY KEY (corporate_tax_payment_history_id)
        );

        ALTER TABLE IF EXISTS public.corporate_tax_payment_history
                           ADD CONSTRAINT fk_corporate_tax_payment_history_corporate_tax_payment_id_corporate_tax_payment FOREIGN KEY (corporate_tax_payment_id)
                           REFERENCES public.corporate_tax_payment (corporate_tax_payment_id) MATCH SIMPLE
                           ON UPDATE NO ACTION
                              ON DELETE NO ACTION;

      CREATE TABLE IF NOT EXISTS public.corporate_tax_date_setting
      (
          corporate_tax_date_setting_id integer NOT NULL,
          fiscal_year character varying(255) COLLATE pg_catalog."default",
          year_start_date timestamp without time zone,
          year_end_date timestamp without time zone,
          selected_flag boolean NOT NULL DEFAULT false,
          created_by integer NOT NULL DEFAULT 0,
          created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_updated_by integer,
          last_update_date timestamp without time zone,
          version_number integer DEFAULT 1,
          delete_flag boolean NOT NULL DEFAULT false,
          CONSTRAINT corporate_tax_date_setting_id_pkey PRIMARY KEY (corporate_tax_date_setting_id)
          );

      INSERT INTO corporate_tax_date_setting (corporate_tax_date_setting_id,fiscal_year, year_start_date, year_end_date, selected_flag) VALUES
         (1, 'January - December', null, null, false),
         (2, 'June - May', null, null, false);

      ALTER TABLE company ADD COLUMN is_eligible_for_cp boolean NOT NULL DEFAULT false;

  --changeset Ikrama Shaikh:32
  DROP TABLE IF EXISTS corporate_tax_date_setting;
    CREATE TABLE IF NOT EXISTS public.corporate_tax_date_setting
        (
            corporate_tax_date_setting_id integer NOT NULL,
            fiscal_year character varying(255) COLLATE pg_catalog."default",
            selected_flag boolean NOT NULL DEFAULT false,
            created_by integer NOT NULL DEFAULT 0,
            created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_updated_by integer,
            last_update_date timestamp without time zone,
            version_number integer DEFAULT 1,
            delete_flag boolean NOT NULL DEFAULT false,
            CONSTRAINT corporate_tax_date_setting_id_pkey PRIMARY KEY (corporate_tax_date_setting_id)
            );
 --changeset Ikrama Shaikh:33
    INSERT INTO corporate_tax_date_setting (corporate_tax_date_setting_id,fiscal_year,delete_flag) VALUES
             (1, 'January - December',false),
             (2, 'June - May',false);

--changeset Zain Khan:34
ALTER TABLE IF EXISTS public.corporate_tax_payment ADD COLUMN deposit_to_transaction_category_id integer;
ALTER TABLE IF EXISTS public.corporate_tax_payment
    ADD CONSTRAINT fk_corporate_tax_payment_deposit_to_trax_category_id_trax_category FOREIGN KEY (deposit_to_transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;

--changeset Ikrama Shaikh:35
    INSERT INTO public.simpleaccounts_modules(
       simpleaccounts_module_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, module_type, order_sequence, selectable_flag, simpleaccounts_module_name, version_number, parent_simpleaccounts_module_id)
    VALUES (282, 1, '2023-07-04 00:00:00', 'N', false, false, null, null, 'Operation', 390, true, 'Corporate Tax Payment', 1, 281),
           (283, 1, '2023-07-04 00:00:00', 'N', false, false, null, null, 'Operation', 391, true, 'Corporate Tax Payment History', 1, 281);

    INSERT INTO public.role_module_relation(
        role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
    VALUES (1940, 1, '2023-07-04 00:00:00', false, null, null, null, 1, 1, 282),
           (1941, 1, '2023-07-04 00:00:00', false, null, null, null, 1, 1, 283);

--changeset Ikrama Shaikh:36
       INSERT INTO public.simpleaccounts_modules(
          simpleaccounts_module_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, module_type, order_sequence, selectable_flag, simpleaccounts_module_name, version_number, parent_simpleaccounts_module_id)
       VALUES (284, 1, '2023-07-05 00:00:00', 'N', false, false, null, null, 'Operation', 392, true, 'View Corporate Tax', 1, 281);

       INSERT INTO public.role_module_relation(
               role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
           VALUES (1942, 1, '2023-07-05 00:00:00', false, null, null, null, 1, 1, 284);


--changeset Nabeel Khan:37
    INSERT INTO public.simpleaccounts_modules(
        simpleaccounts_module_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, module_type, order_sequence, selectable_flag, simpleaccounts_module_name, version_number, parent_simpleaccounts_module_id)
        VALUES (285, 1, '2023-07-17 00:00:00', 'N', false, false, null, null, 'Feature', 393, true, 'Cash Flow', 1, 152);

    INSERT INTO public.role_module_relation(
        role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
        VALUES (1943, 1, '2023-07-17 00:00:00', false, null, null, null, 1, 1, 285);

--changeset Ikrama Shaikh:38
  ALTER TABLE IF EXISTS public.corporate_tax_filing ADD COLUMN view_ct_report character varying(7000) COLLATE pg_catalog."default";

--changeset Ikrama Shaikh:39
  INSERT INTO public.role_module_relation(
                 role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
             VALUES (1944, 1, '2023-08-02 00:00:00', false, null, null, null, 1, 2, 280);

--changeset Ikrama Shaikh:40
  ALTER TABLE IF EXISTS public.salary DROP COLUMN lop_days;
  ALTER TABLE IF EXISTS public.salary DROP COLUMN no_of_days;
  ALTER TABLE IF EXISTS public.salary ADD COLUMN lop_days numeric(19, 2) DEFAULT 0.00;
  ALTER TABLE IF EXISTS public.salary ADD COLUMN no_of_days numeric(19, 2) DEFAULT 0.00;
  ALTER TABLE IF EXISTS public.employee_salary_component_relation DROP COLUMN no_of_days;
  ALTER TABLE IF EXISTS public.employee_salary_component_relation ADD COLUMN no_of_days numeric(19, 2) DEFAULT 0.00;

--changeset Zain Khan:41
INSERT INTO employee_designation (employee_designation_id, delete_flag, designation_name, designation_id, created_by, created_date) VALUES
(4, 'false', 'Owner', NULL, 1, CURRENT_DATE);
INSERT INTO designation_transaction_category (designation_transaction_category_id, designation_id, transaction_category_id,created_by, created_date, delete_flag) VALUES
                                                                                                                                                                      (18, 1, 59, 1, CURRENT_DATE, 'false'),
                                                                                                                                                                      (19, 1, 34, 1, CURRENT_DATE, 'false'),
                                                                                                                                                                      (20, 1, 62, 1, CURRENT_DATE, 'false'),
                                                                                                                                                                      (21, 1, 64, 1, CURRENT_DATE, 'false'),
                                                                                                                                                                      (22, 1, 91, 1, CURRENT_DATE, 'false'),
                                                                                                                                                                      (23, 1, 113, 1,CURRENT_DATE, 'false'),
                                                                                                                                                                      (24, 1, 63, 1,CURRENT_DATE, 'false');
ALTER TABLE IF EXISTS public.employee_designation ADD COLUMN parent_id integer;
--changeset Zain Khan:42
update designation_transaction_category set designation_id = 4 where designation_transaction_category_id in (18,19,20,21,22,23,24);




--changeset Ikrama Shaikh:43
INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
            (286, 'Debit Notes', 'N', 'false', 394, 3, 'false', 'true', 'Feature', 1,CURRENT_DATE),
            (287, 'Add Debit Notes', 'N', 'false', 395, 286, 'false', 'true', 'Operation', 1,CURRENT_DATE),
            (288, 'Update Debit Notes', 'N', 'false', 396, 286, 'false', 'true', 'Operation', 1,CURRENT_DATE),
            (289, 'View Debit Notes', 'N', 'false', 397, 286, 'false', 'true', 'Operation', 1,CURRENT_DATE),
            (290, 'Refund Debit Notes', 'N', 'false', 398, 286, 'false', 'true', 'Operation', 1,CURRENT_DATE);

INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                       (1945, 1, CURRENT_DATE, false, null, null, null, 1, 1, 286),
                       (1946, 1, CURRENT_DATE, false, null, null, null, 1, 104, 286),
                       (1947, 1, CURRENT_DATE, false, null, null, null, 1, 105, 286),
                       (1948, 1, CURRENT_DATE, false, null, null, null, 1, 1, 287),
                       (1949, 1, CURRENT_DATE, false, null, null, null, 1, 104, 287),
                       (1950, 1, CURRENT_DATE, false, null, null, null, 1, 1, 288),
                       (1951, 1, CURRENT_DATE, false, null, null, null, 1, 104, 288),
                       (1952, 1, CURRENT_DATE, false, null, null, null, 1, 1, 289),
                       (1953, 1, CURRENT_DATE, false, null, null, null, 1, 104, 289),
                       (1954, 1, CURRENT_DATE, false, null, null, null, 1, 105, 289),
                       (1955, 1, CURRENT_DATE, false, null, null, null, 1, 1, 290),
                       (1956, 1, CURRENT_DATE, false, null, null, null, 1, 104, 290);

--changeset Ikrama Shaikh:44
                         ALTER TABLE IF EXISTS public.credit_note ADD COLUMN reference_no character varying(200) COLLATE pg_catalog."default";

--changeset Ikrama Shaikh:45
INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
            (291, 'Apply To Supplier Invoice', 'N', 'false', 399, 286, 'false', 'true', 'Operation', 1,CURRENT_DATE);

INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                       (1957, 1, CURRENT_DATE, false, null, null, null, 1, 1, 291),
                       (1958, 1, CURRENT_DATE, false, null, null, null, 1, 104, 291);

--changeset Ikrama Shaikh:46
UPDATE mail_theme_templates SET template_subject = 'CREDIT NOTE-{creditNoteNumber}' WHERE id = 1007;
UPDATE mail_theme_templates SET template_subject = 'CREDIT NOTE-{creditNoteNumber}' WHERE id = 1017;

--changeset Zain Khan:47
INSERT INTO customize_invoice_template (customize_invoice_template_id, created_by, created_date, delete_flag, type, prefix, suffix) VALUES
(13, 1,  CURRENT_DATE, 'false', 13, 'DN-', 0);

--changeset Zain Khan:48
ALTER TABLE IF EXISTS public.credit_note ADD COLUMN is_reverse_charge_enabled boolean NOT NULL DEFAULT false;

--changeset Nabeel Khan:49
INSERT INTO public.simpleaccounts_modules(
	simpleaccounts_module_id, created_by, created_date, default_flag, delete_flag, editable_flag, last_updated_by, last_update_date, module_type, order_sequence, selectable_flag, simpleaccounts_module_name, version_number, parent_simpleaccounts_module_id)
	VALUES (292, 1, '2023-08-30 00:00:00', 'N', false, false, null, null, 'Operation', 400, true, 'Debit Note Report', 1, 152);

INSERT INTO public.role_module_relation(
	role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id)
	VALUES (1959, 1, '2023-08-30 00:00:00', 'false', null, null, null, 1, 1, 292);

--changeset Ikrama Shaikh:50
	ALTER TABLE IF EXISTS public.credit_note
    DROP COLUMN credit_note__date;
    ALTER TABLE IF EXISTS public.credit_note
    ADD COLUMN credit_note__date timestamp without time zone NOT NULL
                                           DEFAULT (current_timestamp AT TIME ZONE 'UTC')

--changeset Ikrama Shaikh:51
 ALTER TABLE company ADD COLUMN generate_sif boolean NOT NULL DEFAULT true;

--changeset Ikrama Shaikh:52
 INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
             (293, 'Save Payroll Settings', 'N', 'false', 401, 10, 'false', 'true', 'Feature', 1,CURRENT_DATE);

 INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                        (1960, 1, CURRENT_DATE, false, null, null, null, 1, 1, 293);

--changeset Ikrama Shaikh:53
 update chart_of_account_category set chart_of_account_category_description = 'Money Paid To Employee', chart_of_account_category_name = 'Money Paid To Employee' where chart_of_account_category_id = 12;
 update chart_of_account_category set chart_of_account_category_description = 'Money Received From Employee', chart_of_account_category_name = 'Money Received From Employee' where chart_of_account_category_id = 6;

--changeset Ikrama Shaikh:54
  ALTER TABLE IF EXISTS public.employment DROP COLUMN passport_expiry_date;
  ALTER TABLE IF EXISTS public.employment ADD COLUMN passport_expiry_date timestamp without time zone;

  --changeset Nabeel Khan:55
  UPDATE public.salary_component SET delete_flag='true' WHERE salary_component_id=2;

  --changeset Fazil Shaikh:56
  INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
              (294, 'Salary Component', 'N', 'false', 402, 279, 'false', 'true', 'Feature', 1,CURRENT_DATE),
              (295, 'Add Salary Component', 'N', 'false', 403, 294, 'false', 'true', 'Operation', 1,CURRENT_DATE),
              (296, 'Update Salary Component', 'N', 'false', 404, 294, 'false', 'true', 'Operation', 1,CURRENT_DATE);

  INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                         (1961, 1, CURRENT_DATE, false, null, null, null, 1, 1, 294),
                         (1962, 1, CURRENT_DATE, false, null, null, null, 1, 1, 295),
  					    (1963, 1, CURRENT_DATE, false, null, null, null, 1, 1, 296);

--changeset Zain Khan:57
ALTER table  public.expense ALTER column pay_mode drop default;

--changeset Ikrama Shaikh:58
 ALTER TABLE salary_component ADD COLUMN calculation_type integer;
 ALTER TABLE salary_component ADD COLUMN component_type character varying(255) COLLATE pg_catalog."default";

 --changeset Ikrama Shaikh:59
  ALTER TABLE salary_component ADD COLUMN component_code character varying(255) COLLATE pg_catalog."default";

--changeset Ikrama Shaikh:60
  INSERT INTO customize_invoice_template (customize_invoice_template_id, created_by, created_date, delete_flag, type, prefix, suffix) VALUES
  (14, 1,  CURRENT_DATE, 'false', 14, '', 2);

  UPDATE public.salary_component SET component_code='1' WHERE salary_component_id=1;
  UPDATE public.salary_component SET component_code='2' WHERE salary_component_id=3;

--changeset Ikrama Shaikh:61
UPDATE public.salary_component SET delete_flag='true' WHERE salary_component_id=3;
UPDATE public.salary_component SET component_code=null WHERE salary_component_id=3;
UPDATE public.customize_invoice_template SET suffix=1 WHERE customize_invoice_template_id=14;

--changeset Kabir:62

INSERT INTO coac_transaction_category (coac_transaction_category_id, chart_of_account_category_id, transaction_category_id, created_by, created_date, delete_flag) VALUES
(326, 8, 2, 1,CURRENT_DATE, 'false')

--changeset Ikrama Shaikh:63
CREATE TABLE IF NOT EXISTS public.reports_column_configuration
(
    id integer NOT NULL,
    report_name character varying(255) COLLATE pg_catalog."default",
    column_names character varying(2500) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    CONSTRAINT reports_column_configuration_pkey PRIMARY KEY (id)
    );

--changeset Ikrama Shaikh:64
ALTER TABLE reports_column_configuration ADD COLUMN user_id integer;

INSERT INTO reports_column_configuration (id, report_name, column_names, created_by, created_date, delete_flag) VALUES
(1, 'payrollsummary', '{"payrollDate": true,"payrollSubject":  true,"payPeriod":  true,"employeeCount":  true,"generatedBy":  true,"approvedBy":  true,"status":  true,"runDate":  true,"comment":  true,"isActive": true,"payrollApprover":  true,"generatedByName":  true,"payrollApproverName":  true,"totalAmount":  true,"dueAmount":  true}', 1,CURRENT_DATE, 'false'),
(2, 'Sales By Customer','{ "customerName":true,"getSalesWithVat": true,"currentAmount": true,"invoiceCount": true,"invoiceId":true,"salesExcludingvat":true }',1,CURRENT_DATE, 'false'),
(3, 'Expense Details','{"amountWithoutTax": true,"expenseAmount": true,"expenseDate": true,"expenseId": true,"expenseNumber": true,"expenseVatAmount": true, "paidBy": true,"payMode": true, "status": true,"transactionCategoryName: true,"VatName": true }',1,CURRENT_DATE, 'false'),
(4, 'Expense By Category Details','{"expensesAmountSum": true,"expensesAmountWithoutTaxSum": true,"expensesVatAmountSum": true,"transactionCategoryName": true }',1,CURRENT_DATE, 'false'),
(5, 'Receivable Invoice Summary','{"balance": true,"customerName": true,"invoiceDate": true,"invoiceDueDate": true,"invoiceId": true,"invoiceNumber": true,"invoiceTotalAmount": true,"status": true }',1,CURRENT_DATE, 'false'),
(6, 'Receivable Invoice Details','{"balance": true,"currencyName": true,"description": true,"discount": true,"dueDate": true,"invoiceDate": true,"invoiceId": true,"invoiceNumber": true,"productCode": true,"productName": true,"quantity": true,"status": true,"totalAmount": true,"unitPrice": true,"vatAmount": true }',1,CURRENT_DATE, 'false'),
(7, 'Detailed General Ledger','{ "amount":true,"date": true,"debitAmount": true,"invoiceId": true,"invoiceType":true,"name":true,"postingReferenceType": true,"postingReferenceTypeEnum": true,"referenceId": true,"referenceNo": true,"transactionTypeName": true,"transactionRefNo": true }',1,CURRENT_DATE, 'false'),
(8, 'Purchase By Vendor','{ "getSalesWithVat":true,"invoiceCount": true,"invoiceId": true,"salesExcludingvat":true,"vendorName":true }',1,CURRENT_DATE, 'false'),
(9, 'Tax Credit Note Details','{ "balance":true,"creditNoteDate": true,"creditNoteNumber": true,"creditNoteTotalAmount": true,"customerName":true,"id":true,"invoiceId": true,"invoiceNumber": true,"invoicestatus": true,"isCNWithoutProduct": true,"status": true,"type": true }',1,CURRENT_DATE, 'false'),
(10, 'Payable Invoice Summary','{ "balance":true,"invoiceDate": true,"invoiceDueDate": true,"invoiceId": true,"invoiceNumber":true,"status":true,"supplierName": true,"totalInvoiceAmount": true }',1,CURRENT_DATE, 'false'),
(11, 'Payable Invoice Details','{ "balance":true,"description": true,"discount": true,"dueDate": true,"invoiceDate":true,"invoiceId":true,"invoiceNumber": true,"productCode": true,"productName": true,"quantity": true,"status": true,"totalAmount": true,"unitPrice": true,"vatAmount": true, }',1,CURRENT_DATE, 'false'),
(12, 'Debit Note Detail Report','{ "balance":true,"creditNoteDate": true,"creditNoteNumber": true,"creditNoteTotalAmount": true,"customerName":true,"id":true,"invoiceId": true }',1,CURRENT_DATE, 'false');

--changeset Ikrama Shaikh:65
update mail_theme_templates set path = 'MailTemplates/theme2/invoice.ftlh' where id = 1011;
update mail_theme_templates set path = 'MailTemplates/theme2/CreditNote.ftlh' where id = 1017;
update mail_theme_templates set path = 'MailTemplates/theme2/quotation.ftlh' where id = 1016;
update mail_theme_templates set path = 'MailTemplates/theme2/purchaseOrder.ftlh' where id = 1014;

ALTER TABLE configuration ADD COLUMN logged_in_user_email boolean NOT NULL DEFAULT false;
ALTER TABLE configuration ADD COLUMN from_email_address  character varying(255) COLLATE pg_catalog."default";
INSERT INTO configuration (configuration_id, last_updated_by, last_update_date, name, value, created_by, created_date, delete_flag) VALUES
 (15, 1, '2018-02-03 19:31:12', 'FROM_EMAIL_ADDRESS', '', 1,CURRENT_DATE, 'false'),
 (16, 1, '2018-02-03 19:31:12', 'LOGGED_IN_USER_FLAG', 'false', 1,CURRENT_DATE, 'false');

 --changeset Ikrama Shaikh:66
ALTER TABLE transaction ALTER COLUMN explained_transaction_description TYPE character varying(2000) COLLATE pg_catalog.default;
ALTER TABLE expense ALTER COLUMN expense_description TYPE character varying(2000) COLLATE pg_catalog.default;

--changeset Ikrama Shaikh:67
AlTER TABLE credit_note_invoice_relation ADD COLUMN applied_by_invoice_amount numeric(19, 2) DEFAULT 0.00;

--changeset Abdul Khaliq:68
AlTER TABLE po_quatation_line_item ALTER COLUMN description TYPE character varying(2000) COLLATE pg_catalog.default;
AlTER TABLE credit_note_line_item ALTER COLUMN description TYPE character varying(2000) COLLATE pg_catalog.default;
AlTER TABLE invoice_line_item ALTER COLUMN description TYPE character varying(2000) COLLATE pg_catalog.default;

 --changeset Ikrama Shaikh:69
 INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
              (297, 'Statement of Accounts for Customer', 'N', 'false', 405, 152, 'false', 'true', 'Feature', 1,CURRENT_DATE);

 INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                                       (1964, 1, CURRENT_DATE, false, null, null, null, 1, 1, 297),
                                       (1965, 1, CURRENT_DATE, false, null, null, null, 1, 104, 297),
                					    (1966, 1, CURRENT_DATE, false, null, null, null, 1, 105, 297);

 --changeset Ikrama Shaikh:70
INSERT INTO reports_column_configuration (id, report_name, column_names, created_by, created_date, delete_flag) VALUES
(13, 'Statement of Accounts for Customer', '{"contactName": true,"invoiceDate":  true,"type":  true,"invoiceNumber":  true,"totalAmount":  true,"amountPaid":  true,"balanceAmount":  true,"creditNoteDate":  true }', 1,CURRENT_DATE, 'false');

  --changeset Ikrama Shaikh:71
   INSERT INTO simpleaccounts_modules (simpleaccounts_module_id, simpleaccounts_module_name, default_flag, delete_flag, order_sequence, parent_simpleaccounts_module_id, editable_flag, selectable_flag, module_type, created_by, created_date) VALUES
                (298, 'Statement of Accounts for Supplier', 'N', 'false', 406, 152, 'false', 'true', 'Feature', 1,CURRENT_DATE);

   INSERT INTO public.role_module_relation( role_module_relation_id, created_by, created_date, delete_flag, last_updated_by, last_update_date, order_sequence, version_number, role_code, simpleaccounts_module_id) VALUES
                                         (1967, 1, CURRENT_DATE, false, null, null, null, 1, 1, 298),
                                         (1968, 1, CURRENT_DATE, false, null, null, null, 1, 104, 298),
                  					    (1969, 1, CURRENT_DATE, false, null, null, null, 1, 105, 298);

  INSERT INTO reports_column_configuration (id, report_name, column_names, created_by, created_date, delete_flag) VALUES
  (14, 'Statement of Accounts for Supplier', '{"contactName": true,"invoiceDate":  true,"type":  true,"invoiceNumber":  true,"totalAmount":  true,"amountPaid":  true,"balanceAmount":  true,"creditNoteDate":  true }', 1,CURRENT_DATE, 'false');

  --changeset Ikrama Shaikh:72
  INSERT INTO reports_column_configuration (id, report_name, column_names, created_by, created_date, delete_flag) VALUES
  (15, 'Sales By Product', '{"averageAmount": true,"productId":  true,"productName":  true,"quantitySold":  true,"totalAmountForAProduct":  true }', 1,CURRENT_DATE, 'false'),
  (16, 'Purchase By Product', '{"averageAmount": true,"productId":  true,"productName":  true,"quantityPurchased":  true,"totalAmountForAProduct":  true }', 1,CURRENT_DATE, 'false');

--changeset Ikrama Shaikh:73
  INSERT INTO reports_column_configuration (id, report_name, column_names, created_by, created_date, delete_flag) VALUES
  (17, 'AR Aging Report', '{"between15to30": true,"contactName":  true,"currentAmount":  true,"lessthen15":  true,"morethan30":  true,"organizationName":  true,"totalAmount":  true }', 1,CURRENT_DATE, 'false');

--changeset Ikrama Shaikh:74
ALTER TABLE invoice ADD COLUMN generated_by_scan boolean NOT NULL DEFAULT false;
ALTER TABLE contact ADD COLUMN update_contact boolean NOT NULL DEFAULT false;