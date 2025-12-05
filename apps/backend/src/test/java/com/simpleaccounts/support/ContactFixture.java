package com.simpleaccounts.support;

import java.time.LocalDateTime;

/**
 * Test fixture builder for Contact entities (customers, suppliers).
 * Provides fluent API for creating test contacts with sensible defaults.
 */
public class ContactFixture {

    private Integer contactId;
    private String contactName = "Test Contact";
    private String email = "test@example.com";
    private String phone = "+971501234567";
    private Integer contactType = 1; // 1=Customer, 2=Supplier
    private String address;
    private String city = "Dubai";
    private String countryCode = "AE";
    private String taxNumber;
    private String currencyCode = "AED";
    private Integer status = 1; // Active
    private Integer createdBy = 1;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Boolean deleteFlag = false;
    private String notes;

    public static ContactFixture aCustomer() {
        return new ContactFixture()
            .withContactType(1)
            .withName("Test Customer");
    }

    public static ContactFixture aSupplier() {
        return new ContactFixture()
            .withContactType(2)
            .withName("Test Supplier");
    }

    public ContactFixture withId(Integer id) {
        this.contactId = id;
        return this;
    }

    public ContactFixture withName(String name) {
        this.contactName = name;
        return this;
    }

    public ContactFixture withEmail(String email) {
        this.email = email;
        return this;
    }

    public ContactFixture withPhone(String phone) {
        this.phone = phone;
        return this;
    }

    public ContactFixture withContactType(Integer type) {
        this.contactType = type;
        return this;
    }

    public ContactFixture withAddress(String address) {
        this.address = address;
        return this;
    }

    public ContactFixture withCity(String city) {
        this.city = city;
        return this;
    }

    public ContactFixture withCountry(String countryCode) {
        this.countryCode = countryCode;
        return this;
    }

    public ContactFixture withTaxNumber(String taxNumber) {
        this.taxNumber = taxNumber;
        return this;
    }

    public ContactFixture withCurrency(String currencyCode) {
        this.currencyCode = currencyCode;
        return this;
    }

    public ContactFixture withCreatedBy(Integer userId) {
        this.createdBy = userId;
        return this;
    }

    public ContactFixture inactive() {
        this.status = 0;
        return this;
    }

    public ContactFixture deleted() {
        this.deleteFlag = true;
        return this;
    }

    public ContactFixture withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public ContactFixture inUAE() {
        this.countryCode = "AE";
        this.city = "Dubai";
        return this;
    }

    public ContactFixture international() {
        this.countryCode = "US";
        this.city = "New York";
        return this;
    }

    public ContactData build() {
        return new ContactData(
            contactId, contactName, email, phone, contactType,
            address, city, countryCode, taxNumber, currencyCode,
            status, createdBy, createdDate, deleteFlag, notes
        );
    }

    public static class ContactData {
        public final Integer contactId;
        public final String contactName;
        public final String email;
        public final String phone;
        public final Integer contactType;
        public final String address;
        public final String city;
        public final String countryCode;
        public final String taxNumber;
        public final String currencyCode;
        public final Integer status;
        public final Integer createdBy;
        public final LocalDateTime createdDate;
        public final Boolean deleteFlag;
        public final String notes;

        public ContactData(Integer contactId, String contactName, String email, String phone,
                          Integer contactType, String address, String city, String countryCode,
                          String taxNumber, String currencyCode, Integer status, Integer createdBy,
                          LocalDateTime createdDate, Boolean deleteFlag, String notes) {
            this.contactId = contactId;
            this.contactName = contactName;
            this.email = email;
            this.phone = phone;
            this.contactType = contactType;
            this.address = address;
            this.city = city;
            this.countryCode = countryCode;
            this.taxNumber = taxNumber;
            this.currencyCode = currencyCode;
            this.status = status;
            this.createdBy = createdBy;
            this.createdDate = createdDate;
            this.deleteFlag = deleteFlag;
            this.notes = notes;
        }

        public boolean isCustomer() {
            return contactType == 1;
        }

        public boolean isSupplier() {
            return contactType == 2;
        }
    }
}
