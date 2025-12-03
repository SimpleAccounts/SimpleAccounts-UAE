package com.simpleaccounts.constant;

public class CommonColumnConstants {

    public static final String FIRST_NAME = "firstName";
    public static final String NAME = "name";
    public static final String EMAIL = "email";
    public static final String CONTACT_TYPE = "contactType";
    public static final String CONTACT_BY_TYPE = "contactsByType";
    public static final String DD_MM_YYYY="dd/MM/yyyy";
    public static final String DDMMYYYY="dd-MM-yyyy";
    public static final String START_DATE= "startDate";
    public static final String END_DATE="endDate";
    public static final String ORDER_BY=" order by ";
    public static final String WELCOME_TO_SIMPLEACCOUNTS ="Welcome to SimpleAccounts";

    /*Query Names*/
    public static final String ALL_CONTACT = "allContacts";
    public static final String CONTACT_BY_NAMES = "Contact.contactsByName";
    public static final String CONTACT_BY_EMAIL ="Contact.contactByEmail";
    public static final String CONTACT_BY_ID ="Contact.contactByID";
    public static final String UPDATE_CONTACT ="updateContact";


    public static final String CURRENCY_CODE="currencyCode";
    public static final String CREATED_DATE="createdDate";

    public static final String CHARTOFACCOUNT_ID =  "chartOfAccountId";
    public static final String EXPLANATION_STATUS_CODE =  "explanationStatusCode";


    private CommonColumnConstants(){
        throw new IllegalStateException("Utility class ContactTypeConstants");
    }
}
