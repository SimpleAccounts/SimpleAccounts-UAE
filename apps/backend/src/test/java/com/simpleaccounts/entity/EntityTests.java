package com.simpleaccounts.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("Entity Tests")
class EntityTests {

    @Nested
    @DisplayName("Contact Entity Tests")
    class ContactEntityTests {
        @Test
        @DisplayName("Should create contact with all fields")
        void testContactEntity() {
            Contact contact = new Contact();
            contact.setContactId(1);
            contact.setFirstName("John");
            contact.setMiddleName("Middle");
            contact.setLastName("Doe");
            contact.setEmail("john@test.com");
            contact.setOrganization("Test Org");
            contact.setTelephone("123456789");
            contact.setMobileNumber("987654321");
            contact.setAddressLine1("123 Test St");
            contact.setAddressLine2("Suite 100");
            contact.setCity("Dubai");
            contact.setPoBoxNumber("12345");
            contact.setContactType(1);
            contact.setIsActive(true);
            contact.setDeleteFlag(false);
            contact.setCreatedBy(1);
            contact.setCreatedDate(LocalDateTime.now());

            assertThat(contact.getContactId()).isEqualTo(1);
            assertThat(contact.getFirstName()).isEqualTo("John");
            assertThat(contact.getMiddleName()).isEqualTo("Middle");
            assertThat(contact.getLastName()).isEqualTo("Doe");
            assertThat(contact.getEmail()).isEqualTo("john@test.com");
            assertThat(contact.getOrganization()).isEqualTo("Test Org");
            assertThat(contact.getTelephone()).isEqualTo("123456789");
            assertThat(contact.getMobileNumber()).isEqualTo("987654321");
            assertThat(contact.getAddressLine1()).isEqualTo("123 Test St");
            assertThat(contact.getAddressLine2()).isEqualTo("Suite 100");
            assertThat(contact.getCity()).isEqualTo("Dubai");
            assertThat(contact.getPoBoxNumber()).isEqualTo("12345");
            assertThat(contact.getContactType()).isEqualTo(1);
            assertThat(contact.getIsActive()).isTrue();
            assertThat(contact.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("User Entity Tests")
    class UserEntityTests {
        @Test
        @DisplayName("Should create user with all fields")
        void testUserEntity() {
            User user = new User();
            user.setUserId(1);
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setUserEmail("john@test.com");
            user.setPassword("password123");
            user.setUserTimezone("UTC");
            user.setIsActive(true);
            user.setDeleteFlag(false);
            user.setCreatedBy(1);
            user.setCreatedDate(LocalDateTime.now());

            Company company = new Company();
            company.setCompanyId(1);
            company.setCompanyName("Test Company");
            user.setCompany(company);

            Role role = new Role();
            role.setRoleCode(1);
            role.setRoleName("Admin");
            user.setRole(role);

            assertThat(user.getUserId()).isEqualTo(1);
            assertThat(user.getFirstName()).isEqualTo("John");
            assertThat(user.getLastName()).isEqualTo("Doe");
            assertThat(user.getUserEmail()).isEqualTo("john@test.com");
            assertThat(user.getPassword()).isEqualTo("password123");
            assertThat(user.getUserTimezone()).isEqualTo("UTC");
            assertThat(user.getIsActive()).isTrue();
            assertThat(user.getDeleteFlag()).isFalse();
            assertThat(user.getCompany()).isNotNull();
            assertThat(user.getRole()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Company Entity Tests")
    class CompanyEntityTests {
        @Test
        @DisplayName("Should create company with all fields")
        void testCompanyEntity() {
            Company company = new Company();
            company.setCompanyId(1);
            company.setCompanyName("Test Company");
            company.setCompanyAddressLine1("123 Test St");
            company.setCompanyAddressLine2("Suite 100");
            company.setCompanyCity("Dubai");
            company.setVatNumber("VAT123456");
            company.setCompanyRegistrationNumber("REG123");
            company.setEmailAddress("company@test.com");
            company.setPhoneNumber("123456789");
            company.setWebsite("www.company.com");
            company.setDeleteFlag(false);
            company.setCreatedBy(1);
            company.setCreatedDate(LocalDateTime.now());

            assertThat(company.getCompanyId()).isEqualTo(1);
            assertThat(company.getCompanyName()).isEqualTo("Test Company");
            assertThat(company.getCompanyAddressLine1()).isEqualTo("123 Test St");
            assertThat(company.getCompanyAddressLine2()).isEqualTo("Suite 100");
            assertThat(company.getCompanyCity()).isEqualTo("Dubai");
            assertThat(company.getVatNumber()).isEqualTo("VAT123456");
            assertThat(company.getCompanyRegistrationNumber()).isEqualTo("REG123");
            assertThat(company.getEmailAddress()).isEqualTo("company@test.com");
            assertThat(company.getPhoneNumber()).isEqualTo("123456789");
            assertThat(company.getWebsite()).isEqualTo("www.company.com");
            assertThat(company.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("Currency Entity Tests")
    class CurrencyEntityTests {
        @Test
        @DisplayName("Should create currency with all fields")
        void testCurrencyEntity() {
            Currency currency = new Currency();
            currency.setCurrencyCode(1);
            currency.setCurrencyName("UAE Dirham");
            currency.setCurrencyIsoCode("AED");
            currency.setCurrencySymbol("AED");
            currency.setCurrencyDescription("UAE Currency");
            currency.setDeleteFlag(false);
            currency.setCreatedBy(1);
            currency.setCreatedDate(LocalDateTime.now());

            assertThat(currency.getCurrencyCode()).isEqualTo(1);
            assertThat(currency.getCurrencyName()).isEqualTo("UAE Dirham");
            assertThat(currency.getCurrencyIsoCode()).isEqualTo("AED");
            assertThat(currency.getCurrencySymbol()).isEqualTo("AED");
            // getDescription() returns computed value: currencyDescription + " - " + currencyIsoCode + "(" + currencySymbol + ")"
            assertThat(currency.getDescription()).isEqualTo("UAE Currency - AED(AED)");
            assertThat(currency.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("Country Entity Tests")
    class CountryEntityTests {
        @Test
        @DisplayName("Should create country with all fields")
        void testCountryEntity() {
            Country country = new Country();
            country.setCountryCode(1);
            country.setCountryName("United Arab Emirates");
            country.setIsoAlpha3Code("ARE");
            country.setCountryDescription("UAE Description");

            assertThat(country.getCountryCode()).isEqualTo(1);
            assertThat(country.getCountryName()).isEqualTo("United Arab Emirates");
            assertThat(country.getIsoAlpha3Code()).isEqualTo("ARE");
            assertThat(country.getCountryDescription()).isEqualTo("UAE Description");
        }
    }

    @Nested
    @DisplayName("Role Entity Tests")
    class RoleEntityTests {
        @Test
        @DisplayName("Should create role with all fields")
        void testRoleEntity() {
            Role role = new Role();
            role.setRoleCode(1);
            role.setRoleName("Admin");
            role.setRoleDescription("Administrator Role");

            assertThat(role.getRoleCode()).isEqualTo(1);
            assertThat(role.getRoleName()).isEqualTo("Admin");
            assertThat(role.getRoleDescription()).isEqualTo("Administrator Role");
        }
    }

    @Nested
    @DisplayName("Invoice Entity Tests")
    class InvoiceEntityTests {
        @Test
        @DisplayName("Should create invoice with all fields")
        void testInvoiceEntity() {
            Invoice invoice = new Invoice();
            invoice.setId(1);
            invoice.setReferenceNumber("INV-001");
            invoice.setInvoiceDate(LocalDate.now());
            invoice.setInvoiceDueDate(LocalDate.now().plusDays(30));
            invoice.setTotalAmount(new BigDecimal("1000.00"));
            invoice.setTotalVatAmount(new BigDecimal("50.00"));
            invoice.setDeleteFlag(false);
            invoice.setCreatedBy(1);
            invoice.setCreatedDate(LocalDateTime.now());

            assertThat(invoice.getId()).isEqualTo(1);
            assertThat(invoice.getReferenceNumber()).isEqualTo("INV-001");
            assertThat(invoice.getInvoiceDate()).isNotNull();
            assertThat(invoice.getInvoiceDueDate()).isNotNull();
            assertThat(invoice.getTotalAmount()).isEqualByComparingTo("1000.00");
            assertThat(invoice.getTotalVatAmount()).isEqualByComparingTo("50.00");
            assertThat(invoice.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("BankAccount Entity Tests")
    class BankAccountEntityTests {
        @Test
        @DisplayName("Should create bank account with all fields")
        void testBankAccountEntity() {
            BankAccount bankAccount = new BankAccount();
            bankAccount.setBankAccountId(1);
            bankAccount.setBankName("Test Bank");
            bankAccount.setBankAccountName("Savings Account");
            bankAccount.setAccountNumber("1234567890");
            bankAccount.setOpeningBalance(new BigDecimal("10000.00"));
            bankAccount.setCurrentBalance(new BigDecimal("15000.00"));
            bankAccount.setDeleteFlag(false);
            bankAccount.setCreatedBy(1);
            bankAccount.setCreatedDate(LocalDateTime.now());

            assertThat(bankAccount.getBankAccountId()).isEqualTo(1);
            assertThat(bankAccount.getBankName()).isEqualTo("Test Bank");
            assertThat(bankAccount.getBankAccountName()).isEqualTo("Savings Account");
            assertThat(bankAccount.getAccountNumber()).isEqualTo("1234567890");
            assertThat(bankAccount.getOpeningBalance()).isEqualByComparingTo("10000.00");
            assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo("15000.00");
            assertThat(bankAccount.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("TransactionCategory Entity Tests")
    class TransactionCategoryEntityTests {
        @Test
        @DisplayName("Should create transaction category with all fields")
        void testTransactionCategoryEntity() {
            TransactionCategory category = new TransactionCategory();
            category.setTransactionCategoryId(1);
            category.setTransactionCategoryCode("TC001");
            category.setTransactionCategoryName("Revenue");
            category.setTransactionCategoryDescription("Revenue Category");
            category.setEditableFlag(true);
            category.setSelectableFlag(true);
            category.setDeleteFlag(false);
            category.setCreatedBy(1);
            category.setCreatedDate(LocalDateTime.now());

            assertThat(category.getTransactionCategoryId()).isEqualTo(1);
            assertThat(category.getTransactionCategoryCode()).isEqualTo("TC001");
            assertThat(category.getTransactionCategoryName()).isEqualTo("Revenue");
            assertThat(category.getTransactionCategoryDescription()).isEqualTo("Revenue Category");
            assertThat(category.getEditableFlag()).isTrue();
            assertThat(category.getSelectableFlag()).isTrue();
            assertThat(category.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("State Entity Tests")
    class StateEntityTests {
        @Test
        @DisplayName("Should create state with all fields")
        void testStateEntity() {
            State state = new State();
            state.setId(1);
            state.setStateName("Dubai");

            Country country = new Country();
            country.setCountryCode(1);
            country.setCountryName("UAE");
            state.setCountry(country);

            assertThat(state.getId()).isEqualTo(1);
            assertThat(state.getStateName()).isEqualTo("Dubai");
            assertThat(state.getCountry()).isNotNull();
        }
    }
}
