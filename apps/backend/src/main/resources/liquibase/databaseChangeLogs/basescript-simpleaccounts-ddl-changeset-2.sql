--liquibase formatted sql
<!-- USER below line on top of script to execute your sql script <author : version>
--changeset Zain Khan:2

BEGIN;


CREATE TABLE IF NOT EXISTS public.activity
(
    activity_id integer NOT NULL,
    activity_code character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    field_1 character varying(255) COLLATE pg_catalog."default",
    field_2 character varying(255) COLLATE pg_catalog."default",
    field_3 character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    module_code character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    updated_by integer,
    version_number integer DEFAULT 1,
    CONSTRAINT activity_pkey PRIMARY KEY (activity_id)
    );

CREATE TABLE IF NOT EXISTS public.bank_account
(
    bank_account_id integer NOT NULL,
    account_number character varying(255) COLLATE pg_catalog."default",
    bank_account_name character varying(255) COLLATE pg_catalog."default",
    bank_feed_status_code integer,
    bank_name character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_balance numeric(19, 2) DEFAULT 0.00,
    delete_flag boolean NOT NULL DEFAULT false,
    ifsc_code character varying(255) COLLATE pg_catalog."default",
    isprimary_account_flag boolean NOT NULL,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    opening_balance numeric(19, 2) DEFAULT 0.00,
    opening_date timestamp without time zone,
    personal_corporate_account_ind character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'C'::bpchar,
    swift_code character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    bank_account_currency_code integer,
    bank_account_status_code integer,
    bank_account_type_code integer,
    bank_country_code integer,
    transaction_category_code integer,
    CONSTRAINT bank_account_pkey PRIMARY KEY (bank_account_id)
    );

CREATE TABLE IF NOT EXISTS public.bank_account_status
(
    bank_account_status_code integer NOT NULL,
    bank_account_status_description character varying(255) COLLATE pg_catalog."default",
    bank_account_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT bank_account_status_pkey PRIMARY KEY (bank_account_status_code)
    );

CREATE TABLE IF NOT EXISTS public.bank_account_type
(
    bank_account_type_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT bank_account_type_pkey PRIMARY KEY (bank_account_type_code)
    );

CREATE TABLE IF NOT EXISTS public.bank_details
(
    bank_id integer NOT NULL,
    bank_name character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT bank_details_pkey PRIMARY KEY (bank_id)
    );

CREATE TABLE IF NOT EXISTS public.bank_feed_status
(
    bank_feed_status_code integer NOT NULL,
    bank_feed_status_description character varying(255) COLLATE pg_catalog."default",
    bank_feed_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT bank_feed_status_pkey PRIMARY KEY (bank_feed_status_code)
    );

CREATE TABLE IF NOT EXISTS public.chart_of_account
(
    chart_of_account_id integer NOT NULL,
    chart_of_account_category_code character varying(255) COLLATE pg_catalog."default",
    chart_of_account_code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    chart_of_account_description character varying(255) COLLATE pg_catalog."default",
    chart_of_account_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    debit_credit_flag character(1) COLLATE pg_catalog."default" NOT NULL,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    parent_chart_of_account_id integer,
    CONSTRAINT chart_of_account_pkey PRIMARY KEY (chart_of_account_id)
    );

CREATE TABLE IF NOT EXISTS public.chart_of_account_category
(
    chart_of_account_category_id integer NOT NULL,
    chart_of_account_category_code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    chart_of_account_category_description character varying(255) COLLATE pg_catalog."default",
    chart_of_account_category_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    select_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    version_number integer DEFAULT 1,
    parent_chart_of_account_category_id integer,
    CONSTRAINT chart_of_account_category_pkey PRIMARY KEY (chart_of_account_category_id)
    );

CREATE TABLE IF NOT EXISTS public.coa_coa_category
(
    coa_coa_category_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    chart_of_account_id integer,
    chart_of_account_category_id integer,
    CONSTRAINT coa_coa_category_pkey PRIMARY KEY (coa_coa_category_id)
    );

CREATE TABLE IF NOT EXISTS public.coac_transaction_category
(
    coac_transaction_category_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    chart_of_account_category_id integer,
    transaction_category_id integer,
    CONSTRAINT coac_transaction_category_pkey PRIMARY KEY (coac_transaction_category_id)
    );

CREATE TABLE IF NOT EXISTS public.company
(
    company_id integer NOT NULL,
    is_designated_zone boolean DEFAULT false,
    is_registered_vat boolean DEFAULT false,
    account_start_date timestamp without time zone,
    company_address_line1 character varying(255) COLLATE pg_catalog."default",
    company_address_line2 character varying(255) COLLATE pg_catalog."default",
    company_address_line3 character varying(255) COLLATE pg_catalog."default",
    company_bank_code character varying(255) COLLATE pg_catalog."default",
    company_city character varying(255) COLLATE pg_catalog."default",
    company_expense_budget numeric(19, 2) DEFAULT 0.00,
    company_logo bytea,
    compnay_name character varying(255) COLLATE pg_catalog."default",
    company_number character varying(255) COLLATE pg_catalog."default",
    company_po_box_number character varying(255) COLLATE pg_catalog."default",
    company_post_zip_code character varying(255) COLLATE pg_catalog."default",
    company_registration_number character varying(255) COLLATE pg_catalog."default",
    company_revenue_budget numeric(19, 2) DEFAULT 0.00,
    company_state_region character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_format character varying(255) COLLATE pg_catalog."default",
    delete_flag boolean NOT NULL DEFAULT false,
    email_address character varying(255) COLLATE pg_catalog."default",
    fax character varying(255) COLLATE pg_catalog."default",
    invoicing_address_line1 character varying(255) COLLATE pg_catalog."default",
    invoicing_address_line2 character varying(255) COLLATE pg_catalog."default",
    invoicing_address_line3 character varying(255) COLLATE pg_catalog."default",
    invoicing_city character varying(255) COLLATE pg_catalog."default",
    invoicing_po_box_number character varying(255) COLLATE pg_catalog."default",
    invoicing_post_zip_code character varying(255) COLLATE pg_catalog."default",
    invoicing_reference_pattern character varying(255) COLLATE pg_catalog."default",
    invoicing_state_region character varying(255) COLLATE pg_catalog."default",
    last_update_date timestamp without time zone,
    last_updated_by integer,
    mobile_number character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    phone_number character varying(255) COLLATE pg_catalog."default",
    vat_number character varying(255) COLLATE pg_catalog."default",
    vat_registration_date timestamp without time zone,
    version_number integer DEFAULT 1,
    website character varying(255) COLLATE pg_catalog."default",
    company_country_code integer,
    company_state_code integer,
    company_type_code integer,
    currency_code integer,
    industry_type_code integer,
    invoicing_country_code integer,
    CONSTRAINT company_pkey PRIMARY KEY (company_id)
    );

CREATE TABLE IF NOT EXISTS public.company_type
(
    company_type_code integer NOT NULL,
    company_type_description character varying(255) COLLATE pg_catalog."default",
    company_type_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT company_type_pkey PRIMARY KEY (company_type_code)
    );

CREATE TABLE IF NOT EXISTS public.configuration
(
    configuration_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_sequence integer,
    value character varying(5000) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    CONSTRAINT configuration_pkey PRIMARY KEY (configuration_id)
    );

CREATE TABLE IF NOT EXISTS public.contact
(
    contact_id integer NOT NULL,
    address_line1 character varying(255) COLLATE pg_catalog."default",
    address_line2 character varying(255) COLLATE pg_catalog."default",
    address_line3 character varying(255) COLLATE pg_catalog."default",
    billing_email character varying(255) COLLATE pg_catalog."default",
    billing_telephone character varying(255) COLLATE pg_catalog."default",
    city character varying(255) COLLATE pg_catalog."default",
    contact_type integer,
    contract_po_number character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    email character varying(255) COLLATE pg_catalog."default",
    fax character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT false,
    is_billing_shipping_address_same boolean NOT NULL DEFAULT false,
    is_migrated_record boolean NOT NULL DEFAULT false,
    is_registered_for_vat boolean NOT NULL DEFAULT false,
    last_name character varying(255) COLLATE pg_catalog."default",
    last_update_date timestamp without time zone,
    last_updated_by integer,
    middle_name character varying(255) COLLATE pg_catalog."default",
    mobile_number character varying(255) COLLATE pg_catalog."default",
    organization character varying(255) COLLATE pg_catalog."default",
    po_box_number character varying(255) COLLATE pg_catalog."default",
    post_zip_code character varying(255) COLLATE pg_catalog."default",
    shipping_city character varying(255) COLLATE pg_catalog."default",
    shipping_fax character varying(255) COLLATE pg_catalog."default",
    shipping_post_zip_code character varying(255) COLLATE pg_catalog."default",
    shipping_telephone character varying(255) COLLATE pg_catalog."default",
    telephone character varying(255) COLLATE pg_catalog."default",
    vat_registration_number character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    website character varying(255) COLLATE pg_catalog."default",
    country_code integer,
    currency_code integer,
    place_of_supply_id integer,
    shipping_country_code integer,
    shipping_state_id integer,
    state_id integer,
    tax_treatment_id integer,
    transaction_category_code integer,
    CONSTRAINT contact_pkey PRIMARY KEY (contact_id)
    );

CREATE TABLE IF NOT EXISTS public.converted_currency
(
    currency_conversion_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    exchange_rate numeric(19, 9),
    is_active boolean NOT NULL DEFAULT false,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    currency_code integer,
    currency_code_converted_to integer,
    CONSTRAINT converted_currency_pkey PRIMARY KEY (currency_conversion_id)
    );

CREATE TABLE IF NOT EXISTS public.country
(
    country_code integer NOT NULL,
    country_description character varying(255) COLLATE pg_catalog."default",
    country_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    iso_alpha3_code character varying(3) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    currency_code integer,
    CONSTRAINT country_pkey PRIMARY KEY (country_code)
    );

CREATE TABLE IF NOT EXISTS public.credit_note
(
    credit_note_id integer NOT NULL,
    cn_created_on_paid_invoice boolean DEFAULT false,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    credit_note__date date,
    credit_note_number character varying(255) COLLATE pg_catalog."default",
    delete_flag boolean NOT NULL DEFAULT false,
    discount numeric(19, 2) DEFAULT 0.00,
    discount_percentage double precision DEFAULT 0.00,
    due_amount numeric(19, 2) DEFAULT 0.00,
    exchange_rate numeric(19, 9),
    invoice_id integer,
    is_cn_without_product boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    notes character varying(255) COLLATE pg_catalog."default",
    place_of_supply_id integer,
    status integer,
    total_amount numeric(19, 2) DEFAULT 0.00,
    total_excise_amount numeric(19, 2) DEFAULT 0.00,
    total_vat_amount numeric(19, 2) DEFAULT 0.00,
    type integer,
    version_number integer DEFAULT 1,
    contact_id integer,
    currency_code integer,
    vat_id integer,
    CONSTRAINT credit_note_pkey PRIMARY KEY (credit_note_id)
    );

CREATE TABLE IF NOT EXISTS public.credit_note_invoice_relation
(
    credit_note_invoice_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    credit_note_id integer,
    invoice_id integer,
    CONSTRAINT credit_note_invoice_relation_pkey PRIMARY KEY (credit_note_invoice_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.credit_note_line_item
(
    credit_note_line_item_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    discount numeric(19, 2) DEFAULT 0.00,
    discount_type character varying(255) COLLATE pg_catalog."default",
    excise_amount numeric(19, 2) DEFAULT 0.00,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    quantity integer NOT NULL,
    sub_total numeric(19, 2) DEFAULT 0.00,
    unit_price numeric(19, 2) DEFAULT 0.00,
    unit_type character varying(255) COLLATE pg_catalog."default",
    vat_amount numeric(19, 2) DEFAULT 0.00,
    version_number integer DEFAULT 1,
    credit_note_id integer,
    excise_tax_id integer,
    product_id integer,
    transaction_category_id integer,
    unit_type_id integer,
    vat_id integer,
    CONSTRAINT credit_note_line_item_pkey PRIMARY KEY (credit_note_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.currency
(
    currency_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    currency_description character varying(255) COLLATE pg_catalog."default",
    currency_iso_code character varying(3) COLLATE pg_catalog."default",
    currency_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    currency_symbol character varying(255) COLLATE pg_catalog."default",
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT currency_pkey PRIMARY KEY (currency_code)
    );

CREATE TABLE IF NOT EXISTS public.customer_invoice_receipt
(
    customer_invoice_receipt_id bigint NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    due_amount numeric(19, 2) NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    paid_amount numeric(19, 2) NOT NULL,
    version_number integer DEFAULT 1,
    customer_invoice_id integer,
    receipt_id integer,
    transaction_id integer,
    CONSTRAINT customer_invoice_receipt_pkey PRIMARY KEY (customer_invoice_receipt_id)
    );

CREATE TABLE IF NOT EXISTS public.customize_invoice_template
(
    customize_invoice_template_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    prefix character varying(255) COLLATE pg_catalog."default",
    suffix integer,
    type integer,
    version_number integer DEFAULT 1,
    CONSTRAINT customize_invoice_template_pkey PRIMARY KEY (customize_invoice_template_id)
    );

CREATE TABLE IF NOT EXISTS public.date_format
(
    date_format_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    format character varying(255) COLLATE pg_catalog."default",
    last_update_date timestamp without time zone,
    last_updated_by integer,
    version_number integer DEFAULT 1,
    CONSTRAINT date_format_pkey PRIMARY KEY (date_format_id)
    );

CREATE TABLE IF NOT EXISTS public.designation_transaction_category
(
    designation_transaction_category_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    designation_id integer,
    transaction_category_id integer,
    CONSTRAINT designation_transaction_category_pkey PRIMARY KEY (designation_transaction_category_id)
    );

CREATE TABLE IF NOT EXISTS public.document_template
(
    document_template_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_sequence integer,
    template oid NOT NULL,
    type integer NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT document_template_pkey PRIMARY KEY (document_template_id)
    );

CREATE TABLE IF NOT EXISTS public.email_logs
(
    email_logs_id integer NOT NULL,
    base_url character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    email_date timestamp without time zone,
    email_from character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email_to character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    module_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT email_logs_pkey PRIMARY KEY (email_logs_id)
    );

CREATE TABLE IF NOT EXISTS public.employee
(
    employee_id integer NOT NULL,
    blood_group character varying(255) COLLATE pg_catalog."default",
    city character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    date_of_birth timestamp without time zone NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    emergency_contact_name_1 character varying(255) COLLATE pg_catalog."default",
    emergency_contact_name_2 character varying(255) COLLATE pg_catalog."default",
    emergency_contact_number_1 character varying(255) COLLATE pg_catalog."default",
    emergency_contact_number_2 character varying(255) COLLATE pg_catalog."default",
    emergency_contact_relationship_1 character varying(255) COLLATE pg_catalog."default",
    emergency_contact_relationship_2 character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default",
    gender character varying(255) COLLATE pg_catalog."default",
    home_address character varying(255) COLLATE pg_catalog."default",
    is_active boolean,
    last_name character varying(255) COLLATE pg_catalog."default",
    last_update_date timestamp without time zone,
    last_updated_by integer,
    marital_status character varying(255) COLLATE pg_catalog."default",
    middle_name character varying(255) COLLATE pg_catalog."default",
    mobile_number character varying(255) COLLATE pg_catalog."default",
    parent_id integer,
    permanent_address character varying(255) COLLATE pg_catalog."default",
    pin_code integer,
    present_address character varying(255) COLLATE pg_catalog."default",
    profile_image bytea,
    qualification character varying(255) COLLATE pg_catalog."default",
    qualification_year_of_completiondate character varying(255) COLLATE pg_catalog."default",
    university character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    country_code integer,
    employee_designation_id integer,
    salary_role_id integer,
    state_id integer,
    transaction_category_code integer,
    CONSTRAINT employee_pkey PRIMARY KEY (employee_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_bank_details
(
    employee_bank_details_id integer NOT NULL,
    account_holder_name character varying(255) COLLATE pg_catalog."default",
    account_number character varying(255) COLLATE pg_catalog."default",
    bank_id integer,
    bank_name character varying(255) COLLATE pg_catalog."default",
    branch character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    iban character varying(255) COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    routing_code character varying(255) COLLATE pg_catalog."default",
    swift_code character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    employee_id integer,
    CONSTRAINT employee_bank_details_pkey PRIMARY KEY (employee_bank_details_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_designation
(
    employee_designation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    designation_id integer,
    designation_name character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT employee_designation_pkey PRIMARY KEY (employee_designation_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_parent_relation
(
    employee_parent_relation_id integer NOT NULL,
    child_type integer,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    order_sequence integer,
    parent_type integer,
    version_number integer DEFAULT 1,
    child_id integer,
    parent_id integer,
    CONSTRAINT employee_parent_relation_pkey PRIMARY KEY (employee_parent_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_salary_component_relation
(
    employee_salary_component_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    flat_amount character varying(255) COLLATE pg_catalog."default",
    formula character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    monthly_amount numeric(19, 2) DEFAULT 0.00,
    no_of_days integer DEFAULT 30,
    order_sequence integer,
    version_number integer DEFAULT 1,
    yearly_amount numeric(19, 2) DEFAULT 0.00,
    employee_id integer,
    salary_component_id integer,
    salary_structure_id integer,
    CONSTRAINT employee_salary_component_relation_pkey PRIMARY KEY (employee_salary_component_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_transaction_category_relation
(
    employee_transaction_category_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    employee_id integer,
    transaction_category_id integer,
    CONSTRAINT employee_transaction_category_relation_pkey PRIMARY KEY (employee_transaction_category_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.employee_user_relation
(
    employee_user_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    employee_id integer,
    user_id integer,
    CONSTRAINT employee_user_relation_pkey PRIMARY KEY (employee_user_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.employment
(
    employment_id integer NOT NULL,
    agent_id character varying(255) COLLATE pg_catalog."default",
    available_leaves integer,
    contract_type character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctc_type character varying(255) COLLATE pg_catalog."default",
    date_of_joining timestamp without time zone NOT NULL,
    delete_flag boolean NOT NULL DEFAULT false,
    department character varying(255) COLLATE pg_catalog."default",
    employee_code character varying(255) COLLATE pg_catalog."default",
    gross_salary numeric(19, 2),
    labour_card character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    leaves_availed integer,
    order_sequence integer,
    passport_expiry_date timestamp without time zone NOT NULL,
    passport_number character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    visa_expiry_date timestamp without time zone NOT NULL,
    visa_number character varying(255) COLLATE pg_catalog."default",
    employee_id integer,
    CONSTRAINT employment_pkey PRIMARY KEY (employment_id)
    );

CREATE TABLE IF NOT EXISTS public.excise_tax
(
    excise_tax_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" DEFAULT 'N'::bpchar,
    delete_flag boolean DEFAULT false,
    excise_percentage numeric(19, 2),
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT excise_tax_pkey PRIMARY KEY (excise_tax_id)
    );

CREATE TABLE IF NOT EXISTS public.expense
(
    expense_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    edit_flag boolean NOT NULL,
    exchange_rate numeric(19, 9),
    exclusive_vat boolean NOT NULL DEFAULT false,
    expense_amount numeric(19, 2) DEFAULT 0.00,
    expense_date date,
    expense_description character varying(255) COLLATE pg_catalog."default",
    expense_number character varying(255) COLLATE pg_catalog."default",
    expense_type boolean NOT NULL DEFAULT false,
    expense_vat_amount numeric(19, 2) DEFAULT 0.00,
    is_migrated_record boolean NOT NULL DEFAULT false,
    is_reverse_charge_enabled boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    pay_mode character varying(32) COLLATE pg_catalog."default" DEFAULT 'CASH'::character varying,
    payee character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_description character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_file_name character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_path character varying(255) COLLATE pg_catalog."default",
    receipt_number character varying(20) COLLATE pg_catalog."default",
    status integer DEFAULT 1,
    version_number integer DEFAULT 1,
    bank_account_id integer,
    currency_code integer,
    employee_id integer,
    file_attachment_id integer,
    place_of_supply_id integer,
    project_id integer,
    tax_treatment_id integer,
    transaction_category_code integer,
    user_id integer,
    vat_id integer,
    CONSTRAINT expense_pkey PRIMARY KEY (expense_id)
    );

CREATE TABLE IF NOT EXISTS public.explanation_status
(
    explanation_status_code integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean DEFAULT false,
    explanation_status_description character varying(255) COLLATE pg_catalog."default",
    explanation_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    remaining_to_explain_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    version_number integer DEFAULT 1,
    invoice_id integer,
    reconsile_journal_id integer,
    transaction_id integer,
    CONSTRAINT explanation_status_pkey PRIMARY KEY (explanation_status_code)
    );

CREATE TABLE IF NOT EXISTS public.file_attachment
(
    file_attachment_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    file_data oid,
    file_name character varying(255) COLLATE pg_catalog."default",
    file_type character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT file_attachment_pkey PRIMARY KEY (file_attachment_id)
    );

CREATE TABLE IF NOT EXISTS public.grn_supplier_invoice_relation
(
    grn_supplier_invoice_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    grn_id integer,
    invoice_id integer,
    CONSTRAINT grn_supplier_invoice_relation_pkey PRIMARY KEY (grn_supplier_invoice_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.imported_draft_transacton
(
    imported_transaction_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    imported_debit_credit_flag character(1) COLLATE pg_catalog."default" NOT NULL,
    imported_transaction_amount numeric(19, 2) DEFAULT 0.00,
    imported_transaction_date timestamp without time zone,
    imported_transaction_description character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    version_number integer DEFAULT 1,
    bank_account_id integer,
    CONSTRAINT imported_draft_transacton_pkey PRIMARY KEY (imported_transaction_id)
    );

CREATE TABLE IF NOT EXISTS public.industry_type
(
    industry_type_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    industry_type_description character varying(255) COLLATE pg_catalog."default",
    industry_type_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT industry_type_pkey PRIMARY KEY (industry_type_code)
    );

CREATE TABLE IF NOT EXISTS public.inventory
(
    inventory_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    purchase_order integer,
    quantity_sold integer,
    reorder_level integer,
    stock_on_hand integer,
    unit_cost real,
    unit_selling_price real,
    version_number integer DEFAULT 1,
    product_id integer,
    supplier_id integer,
    unit_type_id integer,
    CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id)
    );

CREATE TABLE IF NOT EXISTS public.inventory_history
(
    inventory_history_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    quantity real,
    date date,
    unit_cost real,
    unit_selling_price real,
    version_number integer DEFAULT 1,
    inventory_id integer,
    invoice_id integer,
    product_id integer,
    supplier_id integer,
    CONSTRAINT inventory_history_pkey PRIMARY KEY (inventory_history_id)
    );

CREATE TABLE IF NOT EXISTS public.invoice
(
    invoice_id integer NOT NULL,
    change_shipping_address boolean NOT NULL DEFAULT false,
    cn_created_on_paid_invoice boolean DEFAULT false,
    contact_po_number character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    discount numeric(19, 2) DEFAULT 0.00,
    discount_percentage double precision DEFAULT 0.00,
    discount_type character varying(255) COLLATE pg_catalog."default",
    due_amount numeric(19, 2) DEFAULT 0.00,
    edit_flag boolean NOT NULL,
    exchange_rate numeric(19, 9),
    foot_notes character varying(255) COLLATE pg_catalog."default",
    freeze_flag boolean NOT NULL DEFAULT false,
    invoice_date date,
    invoice_due_date date,
    invoice_due_period character varying(255) COLLATE pg_catalog."default" DEFAULT 'NET_7'::character varying,
    is_migrated_record boolean NOT NULL DEFAULT false,
    is_reverse_charge_enabled boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    notes character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    receipt_attachment_description character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_path character varying(255) COLLATE pg_catalog."default",
    receipt_number character varying(20) COLLATE pg_catalog."default",
    reference_number character varying(255) COLLATE pg_catalog."default",
    shipping_address character varying(255) COLLATE pg_catalog."default",
    shipping_city character varying(255) COLLATE pg_catalog."default",
    shipping_fax character varying(255) COLLATE pg_catalog."default",
    shipping_post_zip_code character varying(255) COLLATE pg_catalog."default",
    shipping_telephone character varying(255) COLLATE pg_catalog."default",
    status integer,
    tax_identification_number character varying(255) COLLATE pg_catalog."default",
    tax_type boolean NOT NULL DEFAULT false,
    total_amount numeric(19, 2) DEFAULT 0.00,
    total_excise_amount numeric(19, 2) DEFAULT 0.00,
    total_vat_amount numeric(19, 2) DEFAULT 0.00,
    type integer,
    version_number integer DEFAULT 1,
    file_attachment_id integer,
    contact_id integer,
    currency_code integer,
    document_template_id integer,
    place_of_supply_id integer,
    project_id integer,
    shipping_country_code integer,
    shipping_state_id integer,
    CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id)
    );

CREATE TABLE IF NOT EXISTS public.invoice_line_item
(
    invoice_line_item_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    discount numeric(19, 2) DEFAULT 0.00,
    discount_type character varying(255) COLLATE pg_catalog."default",
    excise_amount numeric(19, 2) DEFAULT 0.00,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    quantity integer NOT NULL,
    sub_total numeric(19, 2) DEFAULT 0.00,
    unit_price numeric(19, 2) DEFAULT 0.00,
    unit_type character varying(255) COLLATE pg_catalog."default",
    vat_amount numeric(19, 2) DEFAULT 0.00,
    version_number integer DEFAULT 1,
    excise_tax_id integer,
    invoice_id integer,
    product_id integer,
    transaction_category_id integer,
    unit_type_id integer,
    vat_id integer,
    CONSTRAINT invoice_line_item_pkey PRIMARY KEY (invoice_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.journal
(
    journal_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    journal_date date,
    journal_reference_no character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    reference_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sub_total_credit_amount numeric(19, 2) DEFAULT 0.00,
    sub_total_debit_amount numeric(19, 2) DEFAULT 0.00,
    total_credit_amount numeric(19, 2) DEFAULT 0.00,
    total_debit_amount numeric(19, 2) DEFAULT 0.00,
    transaction_date date,
    version_number integer DEFAULT 1,
    currency_id integer,
    CONSTRAINT journal_pkey PRIMARY KEY (journal_id)
    );

CREATE TABLE IF NOT EXISTS public.journal_line_item
(
    journal_line_item_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    credit_amount numeric(19, 2),
    current_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    debit_amount numeric(19, 2),
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    exchange_rate numeric(19, 9),
    is_currency_conversion_enabled boolean DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    reference_id integer NOT NULL,
    reference_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    contact_id integer,
    currency_code integer,
    journal_id integer,
    transaction_category_code integer,
    vat_category_code integer,
    CONSTRAINT journal_line_item_pkey PRIMARY KEY (journal_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.language
(
    language_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    language_description character varying(255) COLLATE pg_catalog."default",
    language_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT language_pkey PRIMARY KEY (language_code)
    );

CREATE TABLE IF NOT EXISTS public.leadger_entry
(
    leadger_entry_id bigint NOT NULL,
    amount double precision,
    balance double precision,
    created_by bigint DEFAULT 0,
    created_time timestamp without time zone,
    delete_flag boolean NOT NULL DEFAULT false,
    note character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    type character varying(255) COLLATE pg_catalog."default",
    updated_by bigint,
    updated_time timestamp without time zone,
    version_number integer DEFAULT 1,
    transaction_category_code integer,
    CONSTRAINT leadger_entry_pkey PRIMARY KEY (leadger_entry_id)
    );

CREATE TABLE IF NOT EXISTS public.mail_theme_templates
(
    id integer NOT NULL,
    module_id integer,
    module_name character varying(255) COLLATE pg_catalog."default",
    path character varying(255) COLLATE pg_catalog."default",
    template_body character varying(5000) COLLATE pg_catalog."default",
    template_enable boolean,
    template_id integer,
    template_subject character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT mail_theme_templates_pkey PRIMARY KEY (id)
    );

CREATE TABLE IF NOT EXISTS public.notes_settings
(
    notes_settings_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    foot_notes character varying(255) COLLATE pg_catalog."default",
    notes character varying(255) COLLATE pg_catalog."default",
    terms_and_conditions character varying(255) COLLATE pg_catalog."default",
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT notes_settings_pkey PRIMARY KEY (notes_settings_id)
    );

CREATE TABLE IF NOT EXISTS public.password_history
(
    password_history_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    user_password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    user_id integer,
    CONSTRAINT password_history_pkey PRIMARY KEY (password_history_id)
    );

CREATE TABLE IF NOT EXISTS public.patch
(
    patch_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    execution_date timestamp without time zone NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    patch_no character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT patch_pkey PRIMARY KEY (patch_id)
    );

CREATE TABLE IF NOT EXISTS public.payment
(
    payment_id integer NOT NULL,
    attachment_description character varying(255) COLLATE pg_catalog."default",
    attachment_file_name character varying(255) COLLATE pg_catalog."default",
    attachment_path character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    invoice_amount numeric(19, 2),
    last_updated_by integer,
    last_update_date timestamp without time zone,
    notes character varying(255) COLLATE pg_catalog."default",
    pay_mode character varying(255) COLLATE pg_catalog."default",
    payment_date timestamp without time zone,
    payment_no character varying(255) COLLATE pg_catalog."default",
    reference_no character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    bank_id integer,
    currency_code integer,
    deposit_to_transaction_category_id integer,
    invoice_id integer,
    project_id integer,
    supplier_id integer,
    CONSTRAINT payment_pkey PRIMARY KEY (payment_id)
    );

CREATE TABLE IF NOT EXISTS public.payment_debit_note_relation
(
    payment_debit_note_relation_id integer NOT NULL,
    applied_debits numeric(19, 2) NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    payment_amount_after_applying_debits numeric(19, 2) NOT NULL,
    version_number integer DEFAULT 1,
    credit_note_id integer,
    payment_id integer,
    CONSTRAINT payment_debit_note_relation_pkey PRIMARY KEY (payment_debit_note_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.payroll
(
    payroll_id integer NOT NULL,
    approved_by character varying(255) COLLATE pg_catalog."default",
    comment character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    due_amount numeric(19, 2) DEFAULT 0.00,
    employee_count integer,
    generated_by character varying(255) COLLATE pg_catalog."default",
    is_active boolean,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    pay_period character varying(255) COLLATE pg_catalog."default",
    payroll_approver integer,
    payroll_date timestamp without time zone,
    payroll_subject character varying(255) COLLATE pg_catalog."default",
    run_date timestamp without time zone,
    status character varying(255) COLLATE pg_catalog."default",
    total_amount numeric(19, 2) DEFAULT 0.00,
    CONSTRAINT payroll_pkey PRIMARY KEY (payroll_id)
    );

CREATE TABLE IF NOT EXISTS public.payroll_employee
(
    payroll_employee_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    employee_id integer,
    payroll_id integer,
    CONSTRAINT payroll_employee_pkey PRIMARY KEY (payroll_employee_id)
    );

CREATE TABLE IF NOT EXISTS public.payroll_history
(
    payroll_history_id integer NOT NULL,
    comment character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    order_sequence integer,
    updated_by integer,
    version_number integer DEFAULT 1,
    payroll_id integer,
    CONSTRAINT payroll_history_pkey PRIMARY KEY (payroll_history_id)
    );

CREATE TABLE IF NOT EXISTS public.place_of_supply
(
    place_of_supply_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    place_of_supply character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT place_of_supply_pkey PRIMARY KEY (place_of_supply_id)
    );

CREATE TABLE IF NOT EXISTS public.po_quatation
(
    id integer NOT NULL,
    quotation_number character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    discount numeric(19, 2) DEFAULT 0.00,
    grn_number character varying(255) COLLATE pg_catalog."default",
    grn_receive_date timestamp without time zone,
    grn_remarks character varying(255) COLLATE pg_catalog."default",
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    notes character varying(255) COLLATE pg_catalog."default",
    po_approve_date timestamp without time zone,
    po_number character varying(255) COLLATE pg_catalog."default",
    po_receive_date timestamp without time zone,
    quotation_expiration_date timestamp without time zone,
    reference_number character varying(255) COLLATE pg_catalog."default",
    rfq_expiry_date timestamp without time zone,
    rfq_number character varying(255) COLLATE pg_catalog."default",
    rfq_receive_date timestamp without time zone,
    status integer,
    excise_type boolean NOT NULL DEFAULT false,
    terms_and_conditions character varying(255) COLLATE pg_catalog."default",
    total_amount numeric(19, 2) DEFAULT 0.00,
    total_excise_amount numeric(19, 2) DEFAULT 0.00,
    total_vat_amount numeric(19, 2) DEFAULT 0.00,
    type integer,
    version_number integer DEFAULT 1,
    file_attachment_id integer,
    currency_code integer,
    customer_id integer,
    place_of_supply_id integer,
    supplier_id integer,
    CONSTRAINT po_quatation_pkey PRIMARY KEY (id)
    );

CREATE TABLE IF NOT EXISTS public.po_quatation_line_item
(
    id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    discount numeric(19, 2) DEFAULT 0.00,
    discount_type character varying(255) COLLATE pg_catalog."default",
    excise_amount numeric(19, 2) DEFAULT 0.00,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    quantity integer NOT NULL,
    remaining_quantity integer NOT NULL DEFAULT 0,
    sub_total numeric(19, 2) DEFAULT 0.00,
    unit_cost numeric(19, 2) DEFAULT 0.00,
    unit_type character varying(255) COLLATE pg_catalog."default",
    vat_amount numeric(19, 2) DEFAULT 0.00,
    version_number integer DEFAULT 1,
    excise_tax integer,
    po_quatation_id integer,
    product_id integer,
    transaction_category_id integer,
    unit_type_id integer,
    vat_id integer,
    CONSTRAINT po_quatation_line_item_pkey PRIMARY KEY (id)
    );

CREATE TABLE IF NOT EXISTS public.product
(
    product_id integer NOT NULL,
    avg_purchase_cost numeric(19, 2),
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean DEFAULT false,
    excise_amount numeric(19, 2),
    excise_status boolean NOT NULL DEFAULT false,
    excise_flag boolean NOT NULL DEFAULT false,
    is_active boolean,
    is_inventory_enabled boolean DEFAULT false,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    order_sequence integer,
    price_type character varying(255) COLLATE pg_catalog."default",
    product_code character varying(255) COLLATE pg_catalog."default",
    product_description character varying(255) COLLATE pg_catalog."default",
    product_name character varying(255) COLLATE pg_catalog."default",
    product_type character varying(255) COLLATE pg_catalog."default",
    unit_price numeric(19, 2),
    vat_included boolean DEFAULT false,
    version_number integer DEFAULT 1,
    product_excise_id integer,
    product_category_id integer,
    product_warehouse_id integer,
    unit_type_id integer,
    product_vat_id integer,
    CONSTRAINT product_pkey PRIMARY KEY (product_id)
    );

CREATE TABLE IF NOT EXISTS public.product_category
(
    product_category_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    product_category_code character varying(255) COLLATE pg_catalog."default",
    product_category_description character varying(255) COLLATE pg_catalog."default",
    product_category_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT product_category_pkey PRIMARY KEY (product_category_id)
    );

CREATE TABLE IF NOT EXISTS public.product_line_item
(
    product_line_item_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    price_type character varying(255) COLLATE pg_catalog."default",
    unit_price numeric(19, 2),
    version_number integer DEFAULT 1,
    product_id integer,
    transaction_category_id integer,
    CONSTRAINT product_line_item_pkey PRIMARY KEY (product_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.product_warehouse
(
    product_warehouse_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    warehouse_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT product_warehouse_pkey PRIMARY KEY (product_warehouse_id)
    );

CREATE TABLE IF NOT EXISTS public.project
(
    project_id integer NOT NULL,
    contract_po_number character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    expense_budget numeric(19, 2) DEFAULT 0.00,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    project_name character varying(255) COLLATE pg_catalog."default",
    revenue_budget numeric(19, 2) DEFAULT 0.00,
    vat_registration_number character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    contact_id integer,
    currency_code integer,
    language_code integer,
    CONSTRAINT project_pkey PRIMARY KEY (project_id)
    );

CREATE TABLE IF NOT EXISTS public.purchase
(
    purchase_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    paymentmode integer,
    purchase_amount numeric(19, 2) DEFAULT 0.00,
    purchase_date timestamp without time zone,
    purchase_description character varying(255) COLLATE pg_catalog."default",
    purchase_due_amount numeric(19, 2) DEFAULT 0.00,
    purchase_due_date timestamp without time zone,
    purchase_due_on integer NOT NULL DEFAULT 0,
    receipt_attachment oid,
    receipt_attachment_description character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_path character varying(255) COLLATE pg_catalog."default",
    receipt_number character varying(20) COLLATE pg_catalog."default",
    status integer,
    version_number integer DEFAULT 1,
    currency_code integer,
    project_id integer,
    contact_id integer,
    transaction_category_code integer,
    transaction_type_code integer,
    claimant_id integer,
    CONSTRAINT purchase_pkey PRIMARY KEY (purchase_id)
    );

CREATE TABLE IF NOT EXISTS public.purchase_line_item
(
    purchase_line_item_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    purchase_product_name character varying(255) COLLATE pg_catalog."default",
    purchase_line_item_description character varying(255) COLLATE pg_catalog."default",
    purchase_line_item_quantity integer,
    purchase_line_item_unit_price numeric(19, 2),
    version_number integer DEFAULT 1,
    purchase_id integer,
    purchase_line_item_product_id integer,
    purchase_line_item_vat_id integer,
    CONSTRAINT purchase_line_item_pkey PRIMARY KEY (purchase_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.quotation_invoice_relation
(
    quotation_invoice_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    invoice_id integer,
    quotation_id integer,
    CONSTRAINT quotation_invoice_relation_pkey PRIMARY KEY (quotation_invoice_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.receipt
(
    receipt_id integer NOT NULL,
    amount numeric(19, 2) DEFAULT 0.00,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    notes character varying(255) COLLATE pg_catalog."default",
    pay_mode character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_description character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_file_name character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_path character varying(255) COLLATE pg_catalog."default",
    receipt_date timestamp without time zone,
    receipt_no character varying(255) COLLATE pg_catalog."default",
    reference_code character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    contact_id integer,
    deposit_to_transaction_category_id integer,
    invoice_id integer,
    CONSTRAINT receipt_pkey PRIMARY KEY (receipt_id)
    );

CREATE TABLE IF NOT EXISTS public.receipt_credit_note_relation
(
    receipt_credit_note_relation_id integer NOT NULL,
    applied_credits numeric(19, 2) NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    receipt_amount_after_applying_credits numeric(19, 2) NOT NULL,
    version_number integer DEFAULT 1,
    credit_note_id integer,
    receipt_id integer,
    CONSTRAINT receipt_credit_note_relation_pkey PRIMARY KEY (receipt_credit_note_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.reconcile_category
(
    reconcile_category_id integer NOT NULL,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    order_sequence integer,
    reconcile_category_code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    reconcile_category_description character varying(255) COLLATE pg_catalog."default",
    reconcile_category_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    parent_reconcile_category_id integer,
    CONSTRAINT reconcile_category_pkey PRIMARY KEY (reconcile_category_id)
    );

CREATE TABLE IF NOT EXISTS public.reconcile_status
(
    reconcile_id integer NOT NULL,
    closing_balance numeric(19, 2) DEFAULT 0.00,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleteflag boolean NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    reconciled_date timestamp without time zone,
    reconciled_duration character varying(255) COLLATE pg_catalog."default",
    reconciled_start_date timestamp without time zone,
    version_number integer DEFAULT 1,
    bank_account_id integer,
    CONSTRAINT reconcile_status_pkey PRIMARY KEY (reconcile_id)
    );

CREATE TABLE IF NOT EXISTS public.rfq_po_grn_relation
(
    rfq_po_grn_relation_id integer NOT NULL,
    child_type integer,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    parent_type integer,
    version_number integer DEFAULT 1,
    child_id integer,
    parent_id integer,
    CONSTRAINT rfq_po_grn_relation_pkey PRIMARY KEY (rfq_po_grn_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.role
(
    role_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    role_description character varying(255) COLLATE pg_catalog."default",
    role_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT role_pkey PRIMARY KEY (role_code)
    );

CREATE TABLE IF NOT EXISTS public.role_module_relation
(
    role_module_relation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    role_code integer,
    simpleaccounts_module_id integer,
    CONSTRAINT role_module_relation_pkey PRIMARY KEY (role_module_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.sa_user
(
    user_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_of_birth timestamp without time zone,
    delete_flag boolean NOT NULL DEFAULT false,
    first_name character varying(255) COLLATE pg_catalog."default",
    forgot_pass_token character varying(4000) COLLATE pg_catalog."default",
    forgot_password_token_expiry_date timestamp without time zone,
    is_active boolean NOT NULL DEFAULT false,
    is_designation_enabled boolean DEFAULT false,
    last_name character varying(255) COLLATE pg_catalog."default",
    last_update_date timestamp without time zone,
    last_updated_by integer,
    user_password character varying(255) COLLATE pg_catalog."default",
    profile_image bytea,
    user_email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    user_timezone character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    company_id integer,
    employee_id integer,
    role_code integer,
    transaction_category_code integer,
    CONSTRAINT sa_user_pkey PRIMARY KEY (user_id),
    CONSTRAINT uk_nx287p54g2ort8safq7312ef5 UNIQUE (user_email)
    );

CREATE TABLE IF NOT EXISTS public.salary
(
    salary_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    lop_days integer,
    no_of_days integer,
    order_sequence integer,
    salary_date timestamp without time zone,
    total_amount numeric(19, 2) DEFAULT 0.00,
    type integer,
    version_number integer DEFAULT 1,
    employee_id integer,
    payroll_id integer,
    salary_component_id integer,
    CONSTRAINT salary_pkey PRIMARY KEY (salary_id)
    );

CREATE TABLE IF NOT EXISTS public.salary_component
(
    salary_component_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    flat_amount character varying(255) COLLATE pg_catalog."default",
    formula character varying(255) COLLATE pg_catalog."default",
    is_editable boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    salary_structure_id integer,
    CONSTRAINT salary_component_pkey PRIMARY KEY (salary_component_id)
    );

CREATE TABLE IF NOT EXISTS public.salary_role
(
    salary_role_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    role_name character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    CONSTRAINT salary_role_pkey PRIMARY KEY (salary_role_id)
    );

CREATE TABLE IF NOT EXISTS public.salary_structure
(
    salary_structure_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    type character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    CONSTRAINT salary_structure_pkey PRIMARY KEY (salary_structure_id)
    );

CREATE TABLE IF NOT EXISTS public.salary_template
(
    salary_template_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    is_active boolean,
    is_editable boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    salary_component_id integer,
    salary_role_id integer,
    CONSTRAINT salary_template_pkey PRIMARY KEY (salary_template_id)
    );

CREATE TABLE IF NOT EXISTS public.searchview
(
    searchview_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    description character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    version_number integer DEFAULT 1,
    CONSTRAINT searchview_pkey PRIMARY KEY (searchview_id)
    );

CREATE TABLE IF NOT EXISTS public.simpleaccounts_modules
(
    simpleaccounts_module_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    editable_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    module_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    order_sequence integer,
    selectable_flag boolean NOT NULL DEFAULT false,
    simpleaccounts_module_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    parent_simpleaccounts_module_id integer,
    CONSTRAINT simpleaccounts_modules_pkey PRIMARY KEY (simpleaccounts_module_id)
    );

CREATE TABLE IF NOT EXISTS public.state
(
    state_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    state_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    country_id integer,
    CONSTRAINT state_pkey PRIMARY KEY (state_id)
    );

CREATE TABLE IF NOT EXISTS public.supplier_invoice_payment
(
    supplier_invoice_payment_id bigint NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    due_amount numeric(19, 2) NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    paid_amount numeric(19, 2) NOT NULL,
    version_number integer DEFAULT 1,
    payment_id integer,
    supplier_invoice_id integer,
    transaction_id integer,
    CONSTRAINT supplier_invoice_payment_pkey PRIMARY KEY (supplier_invoice_payment_id)
    );

CREATE TABLE IF NOT EXISTS public.tax_transaction
(
    tax_transaction_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    due_amount numeric(19, 2),
    end_date date,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    paid_amount numeric(19, 2),
    payment_date date,
    start_date date,
    status integer,
    vat_in numeric(19, 2),
    vat_out numeric(19, 2),
    version_number integer DEFAULT 1,
    CONSTRAINT tax_transaction_pkey PRIMARY KEY (tax_transaction_id)
    );

CREATE TABLE IF NOT EXISTS public.tax_treatment
(
    tax_treatment_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    tax_treatment character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT tax_treatment_pkey PRIMARY KEY (tax_treatment_id)
    );

CREATE TABLE IF NOT EXISTS public.title
(
    title_code integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    title_description character varying(255) COLLATE pg_catalog."default",
    title_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    CONSTRAINT title_pkey PRIMARY KEY (title_code)
    );

CREATE TABLE IF NOT EXISTS public.transaction
(
    transaction_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_creation_mode character varying(32) COLLATE pg_catalog."default" DEFAULT 'MANUAL'::character varying,
    current_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    debit_credit_flag character(1) COLLATE pg_catalog."default" NOT NULL,
    delete_flag boolean NOT NULL DEFAULT false,
    entry_type integer,
    exchange_rate numeric(19, 9),
    explained_transaction_attachement oid,
    explained_transaction_attachement_description character varying(255) COLLATE pg_catalog."default",
    explained_transaction_attachement_file_name character varying(255) COLLATE pg_catalog."default",
    explained_transaction_attachement_path character varying(255) COLLATE pg_catalog."default",
    explained_transaction_description character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    receipt_number character varying(255) COLLATE pg_catalog."default",
    reference_str character varying(255) COLLATE pg_catalog."default",
    transaction_amount numeric(19, 2) DEFAULT 0.00,
    transaction_date timestamp without time zone,
    transaction_description character varying(255) COLLATE pg_catalog."default",
    transaction_due_amount numeric(19, 2) DEFAULT 0.00,
    transaction_explination_status character varying(32) COLLATE pg_catalog."default" DEFAULT 'NOT_EXPLAIN'::character varying,
    version_number integer DEFAULT 1,
    bank_account_id integer,
    transaction_type_code integer,
    coa_category_id integer,
    explanation_user_id integer,
    explained_transaction_category_code integer,
    explanation_bank_account_id integer,
    explanation_customer_contact_id integer,
    explanation_employee_id integer,
    explanation_vendor_contact_id integer,
    file_attachment_id integer,
    parent_transaction_id integer,
    vat_id integer,
    CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_category
(
    transaction_category_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" NOT NULL DEFAULT 'N'::bpchar,
    delete_flag boolean NOT NULL DEFAULT false,
    editable_flag boolean NOT NULL DEFAULT false,
    is_migrated_record boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    selectable_flag boolean NOT NULL DEFAULT false,
    transaction_category_code character varying(255) COLLATE pg_catalog."default",
    transaction_category_description character varying(255) COLLATE pg_catalog."default",
    transaction_category_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    chart_of_account_id integer,
    parent_transaction_category_code integer,
    vat_category_code integer,
    CONSTRAINT transaction_category_pkey PRIMARY KEY (transaction_category_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_category_balance
(
    transaction_category_balance_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    effective_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    opening_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    running_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    version_number integer DEFAULT 1,
    transaction_category_id integer,
    CONSTRAINT transaction_category_balance_pkey PRIMARY KEY (transaction_category_balance_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_category_closing_balance
(
    transaction_category_closing_balance_id integer NOT NULL,
    bank_account_closing_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    bank_account_opening_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    closing_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    transaction_category_closing_balance_date timestamp without time zone,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    effective_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    opening_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    order_sequence integer,
    version_number integer DEFAULT 1,
    transaction_category_id integer,
    CONSTRAINT transaction_category_closing_balance_pkey PRIMARY KEY (transaction_category_closing_balance_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_data_col_mapping
(
    transaction_data_col_mapping_id integer NOT NULL,
    col_name character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    file_col_index integer,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    version_number integer DEFAULT 1,
    date_format_id integer,
    transaction_parsing_setting_id bigint,
    CONSTRAINT transaction_data_col_mapping_pkey PRIMARY KEY (transaction_data_col_mapping_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_expenses_payroll
(
    transaction_expenses_payroll_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    explanation_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    remaining_to_explain_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    version_number integer DEFAULT 1,
    expense_id integer,
    payroll_id integer,
    transaction_id integer,
    CONSTRAINT transaction_expenses_payroll_pkey PRIMARY KEY (transaction_expenses_payroll_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_explanation
(
    transaction_explanation_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    remaining_balance numeric(19, 2) DEFAULT 0.00,
    delete_flag boolean NOT NULL DEFAULT false,
    exchange_rate numeric(19, 9),
    explanation_contact_id integer,
    explanation_employee_id integer,
    explanation_user_id integer,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    paid_amount numeric(19, 2) NOT NULL,
    reference_str character varying(255) COLLATE pg_catalog."default",
    transaction_description character varying(255) COLLATE pg_catalog."default",
    vat_id integer,
    version_number integer DEFAULT 1,
    coa_category_id integer,
    explained_transaction_category_code integer,
    file_attachment_id integer,
    transaction_id integer,
    CONSTRAINT transaction_explanation_pkey PRIMARY KEY (transaction_explanation_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_explination_line_item
(
    transaction_explination_line_item_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    order_sequence integer,
    reference_id integer NOT NULL,
    reference_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    remanining_balance numeric(19, 2) DEFAULT 0.00,
    version_number integer DEFAULT 1,
    transaction_explanation_id integer,
    CONSTRAINT transaction_explination_line_item_pkey PRIMARY KEY (transaction_explination_line_item_id)
    );

CREATE TABLE IF NOT EXISTS public.transaction_parsing_setting
(
    transaction_parsing_setting_id bigint NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    delimiter character varying(255) COLLATE pg_catalog."default",
    end_rows integer,
    header_row_no integer,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    name character varying(255) COLLATE pg_catalog."default",
    other_delimiter character varying(255) COLLATE pg_catalog."default",
    skip_columns character varying(255) COLLATE pg_catalog."default",
    skip_rows integer,
    text_qualifier character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    date_format_id integer,
    CONSTRAINT transaction_parsing_setting_pkey PRIMARY KEY (transaction_parsing_setting_id)
    );

CREATE TABLE IF NOT EXISTS public.transactionview
(
    transaction_id integer NOT NULL,
    bank_account_id integer,
    contact_name character varying(255) COLLATE pg_catalog."default",
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    currency_symbol character varying(255) COLLATE pg_catalog."default",
    current_balance numeric(19, 2),
    debit_credit_flag character(1) COLLATE pg_catalog."default",
    delete_flag boolean NOT NULL DEFAULT false,
    due_amount numeric(19, 2),
    due_on timestamp without time zone,
    entry_type integer,
    explanation_status_name character varying(255) COLLATE pg_catalog."default",
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    parent_transaction integer,
    reference_id integer,
    reference_name character varying(255) COLLATE pg_catalog."default",
    reference_type integer,
    transaction_amount numeric(19, 2),
    transaction_category_name character varying(255) COLLATE pg_catalog."default",
    transaction_date timestamp without time zone,
    transaction_description character varying(255) COLLATE pg_catalog."default",
    transaction_type_name character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    CONSTRAINT transactionview_pkey PRIMARY KEY (transaction_id)
    );

CREATE TABLE IF NOT EXISTS public.transacton_expenses
(
    transacton_expenses_id integer NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    explanation_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    remaining_to_explain_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    version_number integer DEFAULT 1,
    expense_id integer,
    transaction_id integer,
    CONSTRAINT transacton_expenses_pkey PRIMARY KEY (transacton_expenses_id)
    );

CREATE TABLE IF NOT EXISTS public.transacton_invoices
(
    transacton_invoices_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    explanation_status_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    invoice_type integer,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    remaining_to_explain_balance numeric(19, 2) NOT NULL DEFAULT 0.00,
    version_number integer DEFAULT 1,
    invoice_id integer,
    transaction_id integer,
    CONSTRAINT transacton_invoices_pkey PRIMARY KEY (transacton_invoices_id)
    );

CREATE TABLE IF NOT EXISTS public.unit_type
(
    unit_type_id integer NOT NULL,
    unit_type character varying(255) COLLATE pg_catalog."default",
    unit_type_code character varying(255) COLLATE pg_catalog."default",
    unit_type_status boolean,
    version_number integer DEFAULT 1,
    CONSTRAINT unit_type_pkey PRIMARY KEY (unit_type_id)
    );

CREATE TABLE IF NOT EXISTS public.user_contact_transaction_category_relation
(
    user_contact_transaction_category_relation_id integer NOT NULL,
    contact_type integer,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    version_number integer DEFAULT 1,
    contact_id integer,
    transaction_category_id integer,
    CONSTRAINT user_contact_transaction_category_relation_pkey PRIMARY KEY (user_contact_transaction_category_relation_id)
    );

CREATE TABLE IF NOT EXISTS public.user_credential
(
    user_credential_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    user_password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    version_number integer DEFAULT 1,
    user_id integer,
    CONSTRAINT user_credential_pkey PRIMARY KEY (user_credential_id)
    );

CREATE TABLE IF NOT EXISTS public.vat_category
(
    vat_category_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    default_flag character(1) COLLATE pg_catalog."default" DEFAULT 'N'::bpchar,
    delete_flag boolean DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    name character varying(255) COLLATE pg_catalog."default",
    order_sequence integer,
    vat numeric(19, 2),
    version_number integer DEFAULT 1,
    CONSTRAINT vat_category_pkey PRIMARY KEY (vat_category_id)
    );

CREATE TABLE IF NOT EXISTS public.vat_payment
(
    vat_payment_id integer NOT NULL,
    amount numeric(19, 2) DEFAULT 0.00,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    is_vat_reclaimable boolean NOT NULL DEFAULT false,
    last_update_date timestamp without time zone,
    last_updated_by integer,
    notes character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_description character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_file_name character varying(255) COLLATE pg_catalog."default",
    receipt_attachment_path character varying(255) COLLATE pg_catalog."default",
    reference_code character varying(255) COLLATE pg_catalog."default",
    vat_payment_date timestamp without time zone,
    vat_payment_no character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    deposit_to_transaction_category_id integer,
    transaction_id integer,
    vat_report_filing_id integer,
    CONSTRAINT vat_payment_pkey PRIMARY KEY (vat_payment_id)
    );

CREATE TABLE IF NOT EXISTS public.vat_record_payment_history
(
    vat_record_payment_history_id integer NOT NULL,
    amount_paid numeric(19, 2) DEFAULT 0.00,
    amount_reclaimed numeric(19, 2) DEFAULT 0.00,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_of_filing timestamp without time zone,
    delete_flag boolean NOT NULL DEFAULT false,
    end_date timestamp without time zone,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    start_date timestamp without time zone,
    version_number integer DEFAULT 1,
    user_id integer,
    vat_payment_id integer,
    CONSTRAINT vat_record_payment_history_pkey PRIMARY KEY (vat_record_payment_history_id)
    );

CREATE TABLE IF NOT EXISTS public.vat_report_filing
(
    vat_report_filing_id integer NOT NULL,
    balance_due numeric(19, 2) DEFAULT 0.00,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    end_date timestamp without time zone,
    is_vat_reclaimable boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    start_date timestamp without time zone,
    status integer DEFAULT 1,
    tax_filed_on timestamp without time zone,
    total_tax_payable numeric(19, 2) DEFAULT 0.00,
    total_tax_reclaimable numeric(19, 2) DEFAULT 0.00,
    version_number integer DEFAULT 1,
    user_id integer,
    CONSTRAINT vat_report_filing_pkey PRIMARY KEY (vat_report_filing_id)
    );

CREATE TABLE IF NOT EXISTS public.vat_tax_agency
(
    vat_tax_agency_id integer NOT NULL,
    created_by integer NOT NULL DEFAULT 0,
    created_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_flag boolean NOT NULL DEFAULT false,
    last_updated_by integer,
    last_update_date timestamp without time zone,
    order_sequence integer,
    tax_agency_name character varying(255) COLLATE pg_catalog."default",
    tax_agency_number character varying(255) COLLATE pg_catalog."default",
    tax_agent_approval_number character varying(255) COLLATE pg_catalog."default",
    tax_agent_name character varying(255) COLLATE pg_catalog."default",
    tax_filed_on timestamp without time zone,
    taxable_person_name_in_arabic character varying(255) COLLATE pg_catalog."default",
    taxable_person_name_in_english character varying(255) COLLATE pg_catalog."default",
    vat_registration_number character varying(255) COLLATE pg_catalog."default",
    version_number integer DEFAULT 1,
    user_id integer,
    vat_report_filing_id integer,
    CONSTRAINT vat_tax_agency_pkey PRIMARY KEY (vat_tax_agency_id)
    );

ALTER TABLE IF EXISTS public.bank_account
    ADD CONSTRAINT fk_bank_acc_bank_acc_curr_code_bank_acc_curr FOREIGN KEY (bank_account_currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bank_account
    ADD CONSTRAINT fk_bank_acc_bank_acc_status_code_bank_acc_status FOREIGN KEY (bank_account_status_code)
    REFERENCES public.bank_account_status (bank_account_status_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bank_account
    ADD CONSTRAINT fk_bank_acc_bank_cnt_code_bank_cnt FOREIGN KEY (bank_country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bank_account
    ADD CONSTRAINT fk_bank_account_bank_account_type_code_bank_account_type FOREIGN KEY (bank_account_type_code)
    REFERENCES public.bank_account_type (bank_account_type_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bank_account
    ADD CONSTRAINT fk_bank_account_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.chart_of_account
    ADD CONSTRAINT fk_chart_of_account_parent_chart_of_account_id_chart_of_account FOREIGN KEY (parent_chart_of_account_id)
    REFERENCES public.chart_of_account (chart_of_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.chart_of_account_category
    ADD CONSTRAINT fk_coa_cat_parent_coa_cat_id_coa_cat FOREIGN KEY (parent_chart_of_account_category_id)
    REFERENCES public.chart_of_account_category (chart_of_account_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.coa_coa_category
    ADD CONSTRAINT fk_coa_coa_cat_coa_cat_id_coa_cat FOREIGN KEY (chart_of_account_category_id)
    REFERENCES public.chart_of_account_category (chart_of_account_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.coa_coa_category
    ADD CONSTRAINT fk_coa_coa_cat_coa_id_coa FOREIGN KEY (chart_of_account_id)
    REFERENCES public.chart_of_account (chart_of_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.coac_transaction_category
    ADD CONSTRAINT fk_coac_tranx_cat_coa_cat_id_coa_cat FOREIGN KEY (chart_of_account_category_id)
    REFERENCES public.chart_of_account_category (chart_of_account_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.coac_transaction_category
    ADD CONSTRAINT fk_coac_tranx_cat_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_company_country_code FOREIGN KEY (company_country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_company_state_code_state FOREIGN KEY (company_state_code)
    REFERENCES public.state (state_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_company_type_code_company_type FOREIGN KEY (company_type_code)
    REFERENCES public.company_type (company_type_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_industry_type_code_industry_type FOREIGN KEY (industry_type_code)
    REFERENCES public.industry_type (industry_type_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.company
    ADD CONSTRAINT fk_company_invoicing_country_code_country FOREIGN KEY (invoicing_country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_country_code_country FOREIGN KEY (country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_place_of_supply_id_place_of_supply FOREIGN KEY (place_of_supply_id)
    REFERENCES public.place_of_supply (place_of_supply_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_shipping_country_code_country FOREIGN KEY (shipping_country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_shipping_state_id_state FOREIGN KEY (shipping_state_id)
    REFERENCES public.state (state_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_state_id_state FOREIGN KEY (state_id)
    REFERENCES public.state (state_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_tax_treatment_id_tax_treatment FOREIGN KEY (tax_treatment_id)
    REFERENCES public.tax_treatment (tax_treatment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.contact
    ADD CONSTRAINT fk_contact_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.converted_currency
    ADD CONSTRAINT fk_converted_currency_currency_code_converted_to_currency FOREIGN KEY (currency_code_converted_to)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.converted_currency
    ADD CONSTRAINT fk_converted_currency_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.country
    ADD CONSTRAINT fk_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note
    ADD CONSTRAINT fk_credit_note_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note
    ADD CONSTRAINT fk_credit_note_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note
    ADD CONSTRAINT fk_credit_note_vat_id_vat FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_invoice_relation
    ADD CONSTRAINT fk_credit_note_id_credit_note FOREIGN KEY (credit_note_id)
    REFERENCES public.credit_note (credit_note_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_invoice_relation
    ADD CONSTRAINT fk_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_credit_note_id_credit_note FOREIGN KEY (credit_note_id)
    REFERENCES public.credit_note (credit_note_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_excise_tax_id_excise_tax FOREIGN KEY (excise_tax_id)
    REFERENCES public.excise_tax (excise_tax_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_product_id_product FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_unit_type_id_unit_type FOREIGN KEY (unit_type_id)
    REFERENCES public.unit_type (unit_type_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.credit_note_line_item
    ADD CONSTRAINT fk_credit_note_line_item_vat_id_vat FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.customer_invoice_receipt
    ADD CONSTRAINT fk_cust_invoice_receipt_cust_invoice_id_cust_invoice FOREIGN KEY (customer_invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.customer_invoice_receipt
    ADD CONSTRAINT fk_cust_invoice_receipt_receipt_id_receipt FOREIGN KEY (receipt_id)
    REFERENCES public.receipt (receipt_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.customer_invoice_receipt
    ADD CONSTRAINT fk_customer_invoice_receipt_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.designation_transaction_category
    ADD CONSTRAINT fk_desig_tranx_cat_desig_id_desig FOREIGN KEY (designation_id)
    REFERENCES public.employee_designation (employee_designation_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.designation_transaction_category
    ADD CONSTRAINT fk_desig_tranx_cat_transx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT fk_employee_country_code_country FOREIGN KEY (country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT fk_employee_employee_designation_id_employee_designation FOREIGN KEY (employee_designation_id)
    REFERENCES public.employee_designation (employee_designation_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT fk_employee_salary_role_id_salary_role FOREIGN KEY (salary_role_id)
    REFERENCES public.salary_role (salary_role_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT fk_employee_state_id_state FOREIGN KEY (state_id)
    REFERENCES public.state (state_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT fk_employee_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_bank_details
    ADD CONSTRAINT fk_employee_bank_details_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_parent_relation
    ADD CONSTRAINT fk_employee_parent_relation_child_id_employee FOREIGN KEY (child_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_parent_relation
    ADD CONSTRAINT fk_employee_parent_relation_parent_id_employee FOREIGN KEY (parent_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_salary_component_relation
    ADD CONSTRAINT fk_emp_salary_comp_relation_salary_comp_id_salary_comp FOREIGN KEY (salary_component_id)
    REFERENCES public.salary_component (salary_component_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_salary_component_relation
    ADD CONSTRAINT fk_emp_salary_comp_relation_salary_struct_id_salary_struct FOREIGN KEY (salary_structure_id)
    REFERENCES public.salary_structure (salary_structure_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_salary_component_relation
    ADD CONSTRAINT fk_employee_salary_component_relation_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_transaction_category_relation
    ADD CONSTRAINT fk_emp_salary_com_relation_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_transaction_category_relation
    ADD CONSTRAINT fk_emp_tranx_cat_relation_emp_id_emp FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_user_relation
    ADD CONSTRAINT fk_employee_user_relation_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employee_user_relation
    ADD CONSTRAINT fk_employee_user_relation_user_id_sa_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.employment
    ADD CONSTRAINT fk_employment_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_bank_account_bank_account_id FOREIGN KEY (bank_account_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_file_attachment_id_file_attachment FOREIGN KEY (file_attachment_id)
    REFERENCES public.file_attachment (file_attachment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_place_of_supply_id_place_of_supply FOREIGN KEY (place_of_supply_id)
    REFERENCES public.place_of_supply (place_of_supply_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_project_id_project FOREIGN KEY (project_id)
    REFERENCES public.project (project_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_tax_treatment_id_tax_treatment FOREIGN KEY (tax_treatment_id)
    REFERENCES public.tax_treatment (tax_treatment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_user_id_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.expense
    ADD CONSTRAINT fk_expense_vat_id_vat FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.explanation_status
    ADD CONSTRAINT fk_explanation_status_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.explanation_status
    ADD CONSTRAINT fk_explanation_status_reconsile_journal_id_reconsile_journal FOREIGN KEY (reconsile_journal_id)
    REFERENCES public.journal (journal_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.explanation_status
    ADD CONSTRAINT fk_explanation_status_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.grn_supplier_invoice_relation
    ADD CONSTRAINT fk_grn_supplier_invoice_relation_grn_id_grn FOREIGN KEY (grn_id)
    REFERENCES public.po_quatation (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.grn_supplier_invoice_relation
    ADD CONSTRAINT fk_grn_supplier_invoice_relation_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.imported_draft_transacton
    ADD CONSTRAINT fk_imported_draft_transacton_bank_account_id_bank_account FOREIGN KEY (bank_account_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT fk_inventory_product_id_product FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT fk_inventory_supplier_id_supplier FOREIGN KEY (supplier_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT fk_inventory_unit_type_id_unit_type FOREIGN KEY (unit_type_id)
    REFERENCES public.unit_type (unit_type_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory_history
    ADD CONSTRAINT fk_inventory_history_inventory_id_inventory FOREIGN KEY (inventory_id)
    REFERENCES public.inventory (inventory_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory_history
    ADD CONSTRAINT fk_inventory_history_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory_history
    ADD CONSTRAINT fk_inventory_history_product_id_product FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.inventory_history
    ADD CONSTRAINT fk_inventory_history_supplier_id_supplier FOREIGN KEY (supplier_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_document_template_id_document_template FOREIGN KEY (document_template_id)
    REFERENCES public.document_template (document_template_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_file_attachment_id_file_attachment FOREIGN KEY (file_attachment_id)
    REFERENCES public.file_attachment (file_attachment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_place_of_supply_id_place_of_supply FOREIGN KEY (place_of_supply_id)
    REFERENCES public.place_of_supply (place_of_supply_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_project_id_project FOREIGN KEY (project_id)
    REFERENCES public.project (project_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_shipping_country_code_country FOREIGN KEY (shipping_country_code)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice
    ADD CONSTRAINT fk_invoice_shipping_state_id_state FOREIGN KEY (shipping_state_id)
    REFERENCES public.state (state_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_excise_tax_id_excise_tax FOREIGN KEY (excise_tax_id)
    REFERENCES public.excise_tax (excise_tax_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_product_id_product FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_unit_type_id_unit_type FOREIGN KEY (unit_type_id)
    REFERENCES public.unit_type (unit_type_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.invoice_line_item
    ADD CONSTRAINT fk_invoice_line_item_vat_id_vat FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal
    ADD CONSTRAINT fk_journal_currency_id_currency FOREIGN KEY (currency_id)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal_line_item
    ADD CONSTRAINT fk_journal_line_item_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal_line_item
    ADD CONSTRAINT fk_journal_line_item_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal_line_item
    ADD CONSTRAINT fk_journal_line_item_journal_id_journal FOREIGN KEY (journal_id)
    REFERENCES public.journal (journal_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal_line_item
    ADD CONSTRAINT fk_journal_line_item_tranx_cat_code_tranx_cat FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.journal_line_item
    ADD CONSTRAINT fk_journal_line_item_vat_category_code_vat_category FOREIGN KEY (vat_category_code)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.leadger_entry
    ADD CONSTRAINT fk_leadger_entry_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.password_history
    ADD CONSTRAINT fk_password_history_user_user_id FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_bank_id_bank FOREIGN KEY (bank_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_deposit_to_tranx_cat_id_tranx_cat FOREIGN KEY (deposit_to_transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_project_id_project FOREIGN KEY (project_id)
    REFERENCES public.project (project_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT fk_payment_supplier_id_supplier FOREIGN KEY (supplier_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment_debit_note_relation
    ADD CONSTRAINT fk_payment_debit_note_relation_credit_note_id_credit_note FOREIGN KEY (credit_note_id)
    REFERENCES public.credit_note (credit_note_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payment_debit_note_relation
    ADD CONSTRAINT fk_payment_debit_note_relation_payment_id_payment FOREIGN KEY (payment_id)
    REFERENCES public.payment (payment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payroll_employee
    ADD CONSTRAINT fk_payroll_employee_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payroll_employee
    ADD CONSTRAINT fk_payroll_employee_payroll_id_payroll FOREIGN KEY (payroll_id)
    REFERENCES public.payroll (payroll_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.payroll_history
    ADD CONSTRAINT fk_payroll_history_payroll_id_payroll FOREIGN KEY (payroll_id)
    REFERENCES public.payroll (payroll_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation
    ADD CONSTRAINT fk_po_quatation_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation
    ADD CONSTRAINT fk_po_quatation_customer_id_customer FOREIGN KEY (customer_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation
    ADD CONSTRAINT fk_po_quatation_file_attachment_id_file_attachment FOREIGN KEY (file_attachment_id)
    REFERENCES public.file_attachment (file_attachment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation
    ADD CONSTRAINT fk_po_quatation_place_of_supply_id_place_of_supply FOREIGN KEY (place_of_supply_id)
    REFERENCES public.place_of_supply (place_of_supply_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation
    ADD CONSTRAINT fk_po_quatation_supplier_id_supplier FOREIGN KEY (supplier_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_excise_tax_po_quatation_line_item FOREIGN KEY (excise_tax)
    REFERENCES public.excise_tax (excise_tax_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_invoice_line_item_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_po_quatation_po_quatation_line_item FOREIGN KEY (po_quatation_id)
    REFERENCES public.po_quatation (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_product_po_quatation_line_item FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_unit_type_po_quatation_line_item FOREIGN KEY (unit_type_id)
    REFERENCES public.unit_type (unit_type_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.po_quatation_line_item
    ADD CONSTRAINT fk_vat_po_quatation_line_item FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product
    ADD CONSTRAINT fk_product_product_category_id_product_category FOREIGN KEY (product_category_id)
    REFERENCES public.product_category (product_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product
    ADD CONSTRAINT fk_product_product_excise_idproduct_excise FOREIGN KEY (product_excise_id)
    REFERENCES public.excise_tax (excise_tax_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product
    ADD CONSTRAINT fk_product_product_vat_id_product_vat FOREIGN KEY (product_vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product
    ADD CONSTRAINT fk_product_product_warehouse_id_product_warehouse FOREIGN KEY (product_warehouse_id)
    REFERENCES public.product_warehouse (product_warehouse_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product
    ADD CONSTRAINT fk_product_unit_type_id_unit_type FOREIGN KEY (unit_type_id)
    REFERENCES public.unit_type (unit_type_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product_line_item
    ADD CONSTRAINT fk_prod_line_item_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.product_line_item
    ADD CONSTRAINT fk_product_line_item_product_id_product FOREIGN KEY (product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.project
    ADD CONSTRAINT fk_project_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.project
    ADD CONSTRAINT fk_project_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.project
    ADD CONSTRAINT fk_project_language_code_language FOREIGN KEY (language_code)
    REFERENCES public.language (language_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_claimant_id_claimant FOREIGN KEY (claimant_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_currency_code_currency FOREIGN KEY (currency_code)
    REFERENCES public.currency (currency_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_project_id_project FOREIGN KEY (project_id)
    REFERENCES public.project (project_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase
    ADD CONSTRAINT fk_purchase_transaction_type_code_transaction_type FOREIGN KEY (transaction_type_code)
    REFERENCES public.chart_of_account (chart_of_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase_line_item
    ADD CONSTRAINT fk_pur_line_item_pur_line_item_prod_id_pur_line_item_prod FOREIGN KEY (purchase_line_item_product_id)
    REFERENCES public.product (product_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase_line_item
    ADD CONSTRAINT fk_pur_line_item_pur_line_item_vat_id_pur_line_item_vat FOREIGN KEY (purchase_line_item_vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.purchase_line_item
    ADD CONSTRAINT fk_purchase_line_item_purchase_id_purchase FOREIGN KEY (purchase_id)
    REFERENCES public.purchase (purchase_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.quotation_invoice_relation
    ADD CONSTRAINT fk_quotation_invoice_relation_invoice_id FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.quotation_invoice_relation
    ADD CONSTRAINT fk_quotation_invoice_relation_quotation_id_quotation FOREIGN KEY (quotation_id)
    REFERENCES public.po_quatation (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.receipt
    ADD CONSTRAINT fk_receipt_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.receipt
    ADD CONSTRAINT fk_receipt_deposit_to_tranx_category_id_tranx_category FOREIGN KEY (deposit_to_transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.receipt
    ADD CONSTRAINT fk_receipt_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.receipt_credit_note_relation
    ADD CONSTRAINT fk_receipt_credit_note_relation_credit_note_id_credit_note FOREIGN KEY (credit_note_id)
    REFERENCES public.credit_note (credit_note_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.receipt_credit_note_relation
    ADD CONSTRAINT fk_receipt_credit_note_relation_id_receipt FOREIGN KEY (receipt_id)
    REFERENCES public.receipt (receipt_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.reconcile_category
    ADD CONSTRAINT fk_rec_category_parent_rec_category_id_rec_category FOREIGN KEY (parent_reconcile_category_id)
    REFERENCES public.reconcile_category (reconcile_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.reconcile_status
    ADD CONSTRAINT fk_reconcile_status_bank_account_id_bank_account FOREIGN KEY (bank_account_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rfq_po_grn_relation
    ADD CONSTRAINT fk_rfq_po_grn_relation_child_id_rfq_po_grn FOREIGN KEY (child_id)
    REFERENCES public.po_quatation (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.rfq_po_grn_relation
    ADD CONSTRAINT fk_rfq_po_grn_relation_parent_id_rfq_po_grn FOREIGN KEY (parent_id)
    REFERENCES public.po_quatation (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.role_module_relation
    ADD CONSTRAINT fk_role_mod_relation_sa_mod_id_sa_mod FOREIGN KEY (simpleaccounts_module_id)
    REFERENCES public.simpleaccounts_modules (simpleaccounts_module_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.role_module_relation
    ADD CONSTRAINT fk_role_module_relation_role_code_role FOREIGN KEY (role_code)
    REFERENCES public.role (role_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sa_user
    ADD CONSTRAINT fk_sa_user_company_id_company FOREIGN KEY (company_id)
    REFERENCES public.company (company_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sa_user
    ADD CONSTRAINT fk_sa_user_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sa_user
    ADD CONSTRAINT fk_sa_user_role_code_role FOREIGN KEY (role_code)
    REFERENCES public.role (role_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.sa_user
    ADD CONSTRAINT fk_sa_user_transaction_category_code_transaction_category FOREIGN KEY (transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary
    ADD CONSTRAINT fk_salary_employee_id_employee FOREIGN KEY (employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary
    ADD CONSTRAINT fk_salary_payroll_id_payroll FOREIGN KEY (payroll_id)
    REFERENCES public.payroll (payroll_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary
    ADD CONSTRAINT fk_salary_salary_component_id_salary_component FOREIGN KEY (salary_component_id)
    REFERENCES public.salary_component (salary_component_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary_component
    ADD CONSTRAINT fk_salary_component_salary_structure_id_salary_structure FOREIGN KEY (salary_structure_id)
    REFERENCES public.salary_structure (salary_structure_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary_template
    ADD CONSTRAINT fk_salary_template_salary_component_id_salary_component FOREIGN KEY (salary_component_id)
    REFERENCES public.salary_component (salary_component_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.salary_template
    ADD CONSTRAINT fk_salary_template_salary_role_id_salary_role FOREIGN KEY (salary_role_id)
    REFERENCES public.salary_role (salary_role_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.simpleaccounts_modules
    ADD CONSTRAINT fk_sa_modules_parent_sa_module_id_parent_sa_module FOREIGN KEY (parent_simpleaccounts_module_id)
    REFERENCES public.simpleaccounts_modules (simpleaccounts_module_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.state
    ADD CONSTRAINT fk_state_country_id_country FOREIGN KEY (country_id)
    REFERENCES public.country (country_code) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.supplier_invoice_payment
    ADD CONSTRAINT fk_supp_invoice_payment_supp_invoice_id_supp_invoice FOREIGN KEY (supplier_invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.supplier_invoice_payment
    ADD CONSTRAINT fk_supplier_invoice_payment_payment_id_payment FOREIGN KEY (payment_id)
    REFERENCES public.payment (payment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.supplier_invoice_payment
    ADD CONSTRAINT fk_supplier_invoice_payment_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_bank_account_transaction_bank_account_id_bank_account FOREIGN KEY (bank_account_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_coa_category_id_coa_category FOREIGN KEY (coa_category_id)
    REFERENCES public.chart_of_account_category (chart_of_account_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_explanation_bank_account_id_bank_account FOREIGN KEY (explanation_bank_account_id)
    REFERENCES public.bank_account (bank_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_explanation_customer_contact_id_contact FOREIGN KEY (explanation_customer_contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_explanation_employee_id_employee FOREIGN KEY (explanation_employee_id)
    REFERENCES public.employee (employee_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_explanation_user_id_sa_user FOREIGN KEY (explanation_user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_explanation_vendor_contact_id_contact FOREIGN KEY (explanation_vendor_contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_file_attachment_id_file_attachment FOREIGN KEY (file_attachment_id)
    REFERENCES public.file_attachment (file_attachment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_parent_transaction_id_transaction FOREIGN KEY (parent_transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_transaction_type_code_transaction_type FOREIGN KEY (transaction_type_code)
    REFERENCES public.chart_of_account (chart_of_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_transaction_vat_id_vat FOREIGN KEY (vat_id)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction
    ADD CONSTRAINT fk_tranx_explained_tranx_category_code_tranx_category FOREIGN KEY (explained_transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_category
    ADD CONSTRAINT fk_transaction_category_chart_of_account_id_chart_of_account FOREIGN KEY (chart_of_account_id)
    REFERENCES public.chart_of_account (chart_of_account_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_category
    ADD CONSTRAINT fk_transaction_category_vat_category_code_vat_category FOREIGN KEY (vat_category_code)
    REFERENCES public.vat_category (vat_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_category
    ADD CONSTRAINT fk_tranx_category_parent_tranx_category_code_tranx_category FOREIGN KEY (parent_transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_category_balance
    ADD CONSTRAINT fk_tranx_cat_balance_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_category_closing_balance
    ADD CONSTRAINT fk_tranx_cat_closing_balance_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_data_col_mapping
    ADD CONSTRAINT fk_transaction_data_col_mapping_date_format_id_date_format FOREIGN KEY (date_format_id)
    REFERENCES public.date_format (date_format_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_data_col_mapping
    ADD CONSTRAINT fk_tranx_pars_setting_tranx_data_col_map_id_tranx_data_col_map FOREIGN KEY (transaction_parsing_setting_id)
    REFERENCES public.transaction_parsing_setting (transaction_parsing_setting_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_expenses_payroll
    ADD CONSTRAINT fk_transaction_expenses_payroll_expense_id_expense FOREIGN KEY (expense_id)
    REFERENCES public.expense (expense_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_expenses_payroll
    ADD CONSTRAINT fk_transaction_expenses_payroll_payroll_id_payroll FOREIGN KEY (payroll_id)
    REFERENCES public.payroll (payroll_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_expenses_payroll
    ADD CONSTRAINT fk_transaction_expenses_payroll_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_explanation
    ADD CONSTRAINT fk_transaction_explanation_ FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_explanation
    ADD CONSTRAINT fk_transaction_explanation_coa_category_id_coa_category FOREIGN KEY (coa_category_id)
    REFERENCES public.chart_of_account_category (chart_of_account_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_explanation
    ADD CONSTRAINT fk_transaction_explanation_file_attachment_id_file_attachment FOREIGN KEY (file_attachment_id)
    REFERENCES public.file_attachment (file_attachment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_explanation
    ADD CONSTRAINT fk_tranx_exp_exp_tranx_cat_code_tranx_cat FOREIGN KEY (explained_transaction_category_code)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_explination_line_item
    ADD CONSTRAINT fk_tranx_exp_line_item_tranx_exp_id_tranx_expl FOREIGN KEY (transaction_explanation_id)
    REFERENCES public.transaction_explanation (transaction_explanation_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transaction_parsing_setting
    ADD CONSTRAINT fk_transaction_parsing_setting_date_format_id_date_format FOREIGN KEY (date_format_id)
    REFERENCES public.date_format (date_format_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transacton_expenses
    ADD CONSTRAINT fk_transacton_expenses_expense_id_expense FOREIGN KEY (expense_id)
    REFERENCES public.expense (expense_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transacton_expenses
    ADD CONSTRAINT fk_transacton_expenses_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transacton_invoices
    ADD CONSTRAINT fk_transacton_invoices_invoice_id_invoice FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (invoice_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.transacton_invoices
    ADD CONSTRAINT fk_transacton_invoices_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.user_contact_transaction_category_relation
    ADD CONSTRAINT fk_user_contact_tranx_cat_relation_tranx_cat_id_tranx_cat FOREIGN KEY (transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.user_contact_transaction_category_relation
    ADD CONSTRAINT fk_user_contact_tranx_category_relation_contact_id_contact FOREIGN KEY (contact_id)
    REFERENCES public.contact (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.user_credential
    ADD CONSTRAINT fk_user_credential_user_id_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_payment
    ADD CONSTRAINT fk_vat_payment_deposit_to_trax_category_id_trax_category FOREIGN KEY (deposit_to_transaction_category_id)
    REFERENCES public.transaction_category (transaction_category_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_payment
    ADD CONSTRAINT fk_vat_payment_transaction_id_transaction FOREIGN KEY (transaction_id)
    REFERENCES public.transaction (transaction_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_payment
    ADD CONSTRAINT fk_vat_payment_vat_report_filing_id_vat_report_filing FOREIGN KEY (vat_report_filing_id)
    REFERENCES public.vat_report_filing (vat_report_filing_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_record_payment_history
    ADD CONSTRAINT fk_vat_record_payment_history_user_id_sa_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_record_payment_history
    ADD CONSTRAINT fk_vat_record_payment_history_vat_payment_id_vat_payment FOREIGN KEY (vat_payment_id)
    REFERENCES public.vat_payment (vat_payment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_report_filing
    ADD CONSTRAINT fk_vat_report_filing_user_id_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_tax_agency
    ADD CONSTRAINT fk_vat_tax_agency_user_id_sa_user FOREIGN KEY (user_id)
    REFERENCES public.sa_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.vat_tax_agency
    ADD CONSTRAINT fk_vat_tax_agency_vat_report_filing_id_vat_report_filing FOREIGN KEY (vat_report_filing_id)
    REFERENCES public.vat_report_filing (vat_report_filing_id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION;

END;