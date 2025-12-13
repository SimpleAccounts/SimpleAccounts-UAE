package com.simpleaccounts.masterdata;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Master Data management functionality.
 * Covers Chart of Accounts, Contacts, Products, VAT Categories, and validation rules.
 */
class MasterDataTest {

    private MasterDataService masterDataService;

    @BeforeEach
    void setUp() {
        masterDataService = new MasterDataService();
    }

    @Nested
    @DisplayName("Chart of Accounts Tests")
    class ChartOfAccountsTests {

        @Test
        @DisplayName("Should create account with valid code")
        void shouldCreateAccountWithValidCode() {
            Account account = Account.builder()
                .code("1100")
                .name("Cash")
                .type(AccountType.ASSET)
                .build();

            String id = masterDataService.createAccount(account);

            assertThat(id).isNotNull();
            assertThat(masterDataService.getAccount("1100")).isPresent();
        }

        @Test
        @DisplayName("Should reject duplicate account codes")
        void shouldRejectDuplicateAccountCodes() {
            Account account1 = Account.builder().code("1100").name("Cash").type(AccountType.ASSET).build();
            masterDataService.createAccount(account1);

            Account account2 = Account.builder().code("1100").name("Cash Duplicate").type(AccountType.ASSET).build();

            assertThatThrownBy(() -> masterDataService.createAccount(account2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("Should enforce account code format")
        void shouldEnforceAccountCodeFormat() {
            Account account = Account.builder()
                .code("ABC") // Invalid format
                .name("Invalid Account")
                .type(AccountType.ASSET)
                .build();

            assertThatThrownBy(() -> masterDataService.createAccount(account))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("format");
        }

        @Test
        @DisplayName("Should support account hierarchy")
        void shouldSupportAccountHierarchy() {
            Account parent = Account.builder()
                .code("1000")
                .name("Assets")
                .type(AccountType.ASSET)
                .build();
            masterDataService.createAccount(parent);

            Account child = Account.builder()
                .code("1100")
                .name("Cash")
                .type(AccountType.ASSET)
                .parentCode("1000")
                .build();
            masterDataService.createAccount(child);

            List<Account> children = masterDataService.getChildAccounts("1000");
            assertThat(children).hasSize(1);
            assertThat(children.get(0).getCode()).isEqualTo("1100");
        }

        @Test
        @DisplayName("Should prevent circular hierarchy")
        void shouldPreventCircularHierarchy() {
            masterDataService.createAccount(Account.builder().code("1000").name("Parent").type(AccountType.ASSET).build());
            masterDataService.createAccount(Account.builder().code("1100").name("Child").type(AccountType.ASSET).parentCode("1000").build());

            Account updatedAccount = Account.builder().code("1000").name("Parent").type(AccountType.ASSET).parentCode("1100").build();
            assertThatThrownBy(() ->
                masterDataService.updateAccount("1000", updatedAccount)
            ).isInstanceOf(IllegalArgumentException.class)
             .hasMessageContaining("Circular");
        }

        @Test
        @DisplayName("Should prevent deletion of account with transactions")
        void shouldPreventDeletionOfAccountWithTransactions() {
            masterDataService.createAccount(Account.builder().code("1100").name("Cash").type(AccountType.ASSET).build());
            masterDataService.addTransactionToAccount("1100");

            assertThatThrownBy(() -> masterDataService.deleteAccount("1100"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("transactions");
        }

        @Test
        @DisplayName("Should soft delete accounts")
        void shouldSoftDeleteAccounts() {
            masterDataService.createAccount(Account.builder().code("1100").name("Cash").type(AccountType.ASSET).build());

            masterDataService.softDeleteAccount("1100");

            assertThat(masterDataService.getAccount("1100")).isEmpty();
            assertThat(masterDataService.getAccount("1100", true)).isPresent(); // Include deleted
        }
    }

    @Nested
    @DisplayName("Contact Management Tests")
    class ContactManagementTests {

        @Test
        @DisplayName("Should create customer contact")
        void shouldCreateCustomerContact() {
            Contact contact = Contact.builder()
                .name("ABC Corporation")
                .type(ContactType.CUSTOMER)
                .email("info@abc.com")
                .phone("+971501234567")
                .build();

            String id = masterDataService.createContact(contact);

            assertThat(id).isNotNull();
            assertThat(masterDataService.getContact(id)).isPresent();
        }

        @Test
        @DisplayName("Should create supplier contact")
        void shouldCreateSupplierContact() {
            Contact contact = Contact.builder()
                .name("XYZ Supplies")
                .type(ContactType.SUPPLIER)
                .email("sales@xyz.com")
                .build();

            String id = masterDataService.createContact(contact);
            Contact retrieved = masterDataService.getContact(id).get();

            assertThat(retrieved.getType()).isEqualTo(ContactType.SUPPLIER);
        }

        @Test
        @DisplayName("Should validate email format")
        void shouldValidateEmailFormat() {
            Contact contact = Contact.builder()
                .name("Test Contact")
                .type(ContactType.CUSTOMER)
                .email("invalid-email")
                .build();

            assertThatThrownBy(() -> masterDataService.createContact(contact))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
        }

        @Test
        @DisplayName("Should validate UAE phone format")
        void shouldValidateUaePhoneFormat() {
            Contact validContact = Contact.builder()
                .name("Valid Phone")
                .type(ContactType.CUSTOMER)
                .phone("+971501234567")
                .build();

            String id = masterDataService.createContact(validContact);
            assertThat(id).isNotNull();

            Contact invalidContact = Contact.builder()
                .name("Invalid Phone")
                .type(ContactType.CUSTOMER)
                .phone("12345")
                .build();

            assertThatThrownBy(() -> masterDataService.createContact(invalidContact))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("phone");
        }

        @Test
        @DisplayName("Should validate TRN format")
        void shouldValidateTrnFormat() {
            // Valid UAE TRN format: 100XXXXXXXXXX (15 digits starting with 100)
            Contact validTrn = Contact.builder()
                .name("Valid TRN")
                .type(ContactType.SUPPLIER)
                .taxNumber("100123456789012")
                .build();

            String id = masterDataService.createContact(validTrn);
            assertThat(id).isNotNull();

            Contact invalidTrn = Contact.builder()
                .name("Invalid TRN")
                .type(ContactType.SUPPLIER)
                .taxNumber("12345")
                .build();

            assertThatThrownBy(() -> masterDataService.createContact(invalidTrn))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("TRN");
        }

        @Test
        @DisplayName("Should detect duplicate contacts")
        void shouldDetectDuplicateContacts() {
            Contact contact1 = Contact.builder()
                .name("ABC Corp")
                .type(ContactType.CUSTOMER)
                .email("info@abc.com")
                .build();
            masterDataService.createContact(contact1);

            Contact contact2 = Contact.builder()
                .name("ABC Corporation") // Similar name
                .type(ContactType.CUSTOMER)
                .email("info@abc.com") // Same email
                .build();

            List<Contact> duplicates = masterDataService.findDuplicates(contact2);
            assertThat(duplicates).isNotEmpty();
        }

        @Test
        @DisplayName("Should search contacts by name")
        void shouldSearchContactsByName() {
            masterDataService.createContact(Contact.builder().name("Alpha Company").type(ContactType.CUSTOMER).build());
            masterDataService.createContact(Contact.builder().name("Beta Corp").type(ContactType.CUSTOMER).build());
            masterDataService.createContact(Contact.builder().name("Alpha Trading").type(ContactType.SUPPLIER).build());

            List<Contact> results = masterDataService.searchContacts("Alpha");

            assertThat(results).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Product Management Tests")
    class ProductManagementTests {

        @Test
        @DisplayName("Should create product with SKU")
        void shouldCreateProductWithSku() {
            Product product = Product.builder()
                .sku("PROD-001")
                .name("Office Chair")
                .unitPrice(new BigDecimal("500.00"))
                .build();

            String id = masterDataService.createProduct(product);

            assertThat(id).isNotNull();
            assertThat(masterDataService.getProductBySku("PROD-001")).isPresent();
        }

        @Test
        @DisplayName("Should reject duplicate SKU")
        void shouldRejectDuplicateSku() {
            masterDataService.createProduct(Product.builder().sku("PROD-001").name("Product 1").unitPrice(BigDecimal.TEN).build());

            Product product2 = Product.builder().sku("PROD-001").name("Product 2").unitPrice(BigDecimal.TEN).build();
            assertThatThrownBy(() ->
                masterDataService.createProduct(product2)
            ).isInstanceOf(IllegalArgumentException.class)
             .hasMessageContaining("SKU");
        }

        @Test
        @DisplayName("Should validate unit price is positive")
        void shouldValidateUnitPriceIsPositive() {
            Product product = Product.builder()
                .sku("PROD-002")
                .name("Invalid Product")
                .unitPrice(new BigDecimal("-100.00"))
                .build();

            assertThatThrownBy(() -> masterDataService.createProduct(product))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("price");
        }

        @Test
        @DisplayName("Should support product categories")
        void shouldSupportProductCategories() {
            masterDataService.createCategory("FURNITURE", "Furniture");

            Product product = Product.builder()
                .sku("PROD-003")
                .name("Desk")
                .categoryCode("FURNITURE")
                .unitPrice(new BigDecimal("1000.00"))
                .build();

            masterDataService.createProduct(product);

            List<Product> furnitureProducts = masterDataService.getProductsByCategory("FURNITURE");
            assertThat(furnitureProducts).hasSize(1);
        }

        @Test
        @DisplayName("Should track inventory levels")
        void shouldTrackInventoryLevels() {
            masterDataService.createProduct(Product.builder().sku("INV-001").name("Inventory Item").unitPrice(BigDecimal.TEN).build());

            masterDataService.updateInventory("INV-001", 100);
            assertThat(masterDataService.getInventoryLevel("INV-001")).isEqualTo(100);

            masterDataService.updateInventory("INV-001", -30);
            assertThat(masterDataService.getInventoryLevel("INV-001")).isEqualTo(70);
        }

        @Test
        @DisplayName("Should warn on low inventory")
        void shouldWarnOnLowInventory() {
            Product product = Product.builder()
                .sku("LOW-001")
                .name("Low Stock Item")
                .unitPrice(BigDecimal.TEN)
                .reorderLevel(10)
                .build();
            masterDataService.createProduct(product);
            masterDataService.updateInventory("LOW-001", 5);

            List<Product> lowStockProducts = masterDataService.getLowStockProducts();
            assertThat(lowStockProducts).hasSize(1);
            assertThat(lowStockProducts.get(0).getSku()).isEqualTo("LOW-001");
        }
    }

    @Nested
    @DisplayName("VAT Category Tests")
    class VatCategoryTests {

        @Test
        @DisplayName("Should create standard VAT category")
        void shouldCreateStandardVatCategory() {
            VatCategory vat = VatCategory.builder()
                .code("STANDARD")
                .name("Standard Rate")
                .rate(new BigDecimal("5.00"))
                .build();

            String id = masterDataService.createVatCategory(vat);

            assertThat(id).isNotNull();
            VatCategory retrieved = masterDataService.getVatCategory("STANDARD").get();
            assertThat(retrieved.getRate()).isEqualByComparingTo(new BigDecimal("5.00"));
        }

        @Test
        @DisplayName("Should create zero-rated category")
        void shouldCreateZeroRatedCategory() {
            VatCategory vat = VatCategory.builder()
                .code("ZERO")
                .name("Zero Rated")
                .rate(BigDecimal.ZERO)
                .build();

            masterDataService.createVatCategory(vat);
            VatCategory retrieved = masterDataService.getVatCategory("ZERO").get();

            assertThat(retrieved.getRate()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should create exempt category")
        void shouldCreateExemptCategory() {
            VatCategory vat = VatCategory.builder()
                .code("EXEMPT")
                .name("Exempt")
                .rate(BigDecimal.ZERO)
                .isExempt(true)
                .build();

            masterDataService.createVatCategory(vat);
            VatCategory retrieved = masterDataService.getVatCategory("EXEMPT").get();

            assertThat(retrieved.isExempt()).isTrue();
        }

        @Test
        @DisplayName("Should validate VAT rate range")
        void shouldValidateVatRateRange() {
            VatCategory vat = VatCategory.builder()
                .code("INVALID")
                .name("Invalid Rate")
                .rate(new BigDecimal("150.00")) // Over 100%
                .build();

            assertThatThrownBy(() -> masterDataService.createVatCategory(vat))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("rate");
        }

        @Test
        @DisplayName("Should calculate VAT amount")
        void shouldCalculateVatAmount() {
            masterDataService.createVatCategory(VatCategory.builder().code("STANDARD").name("Standard").rate(new BigDecimal("5.00")).build());

            BigDecimal baseAmount = new BigDecimal("1000.00");
            BigDecimal vatAmount = masterDataService.calculateVat("STANDARD", baseAmount);

            assertThat(vatAmount).isEqualByComparingTo(new BigDecimal("50.00"));
        }
    }

    @Nested
    @DisplayName("Bulk Operations Tests")
    class BulkOperationsTests {

        @Test
        @DisplayName("Should import contacts from CSV")
        void shouldImportContactsFromCsv() {
            String csv = "Name,Type,Email\n" +
                        "Contact 1,CUSTOMER,c1@test.com\n" +
                        "Contact 2,SUPPLIER,c2@test.com\n";

            ImportResult result = masterDataService.importContactsFromCsv(csv);

            assertThat(result.getSuccessCount()).isEqualTo(2);
            assertThat(result.getErrorCount()).isZero();
        }

        @Test
        @DisplayName("Should report import errors")
        void shouldReportImportErrors() {
            String csv = "Name,Type,Email\n" +
                        "Valid Contact,CUSTOMER,valid@test.com\n" +
                        "Invalid Contact,CUSTOMER,invalid-email\n"; // Invalid email

            ImportResult result = masterDataService.importContactsFromCsv(csv);

            assertThat(result.getSuccessCount()).isEqualTo(1);
            assertThat(result.getErrorCount()).isEqualTo(1);
            assertThat(result.getErrors().get(0)).contains("email");
        }

        @Test
        @DisplayName("Should export contacts to CSV")
        void shouldExportContactsToCsv() {
            masterDataService.createContact(Contact.builder().name("Export Test").type(ContactType.CUSTOMER).email("export@test.com").build());

            String csv = masterDataService.exportContactsToCsv();

            assertThat(csv).contains("Export Test");
            assertThat(csv).contains("export@test.com");
        }

        @Test
        @DisplayName("Should support bulk status update")
        void shouldSupportBulkStatusUpdate() {
            String id1 = masterDataService.createContact(Contact.builder().name("Contact 1").type(ContactType.CUSTOMER).build());
            String id2 = masterDataService.createContact(Contact.builder().name("Contact 2").type(ContactType.CUSTOMER).build());

            int updated = masterDataService.bulkUpdateContactStatus(Arrays.asList(id1, id2), false);

            assertThat(updated).isEqualTo(2);
        }
    }

    // Test implementation classes
    enum AccountType { ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE }
    enum ContactType { CUSTOMER, SUPPLIER }

    static class Account {
        private String code;
        private String name;
        private AccountType type;
        private String parentCode;
        private boolean deleted;

        static Builder builder() { return new Builder(); }
        String getCode() { return code; }
        String getName() { return name; }
        AccountType getType() { return type; }
        String getParentCode() { return parentCode; }
        boolean isDeleted() { return deleted; }
        void setDeleted(boolean deleted) { this.deleted = deleted; }

        static class Builder {
            private Account account = new Account();
            Builder code(String code) { account.code = code; return this; }
            Builder name(String name) { account.name = name; return this; }
            Builder type(AccountType type) { account.type = type; return this; }
            Builder parentCode(String code) { account.parentCode = code; return this; }
            Account build() { return account; }
        }
    }

    static class Contact {
        private String id;
        private String name;
        private ContactType type;
        private String email;
        private String phone;
        private String taxNumber;
        private boolean active = true;

        static Builder builder() { return new Builder(); }
        String getId() { return id; }
        void setId(String id) { this.id = id; }
        String getName() { return name; }
        ContactType getType() { return type; }
        String getEmail() { return email; }
        String getPhone() { return phone; }
        String getTaxNumber() { return taxNumber; }
        boolean isActive() { return active; }
        void setActive(boolean active) { this.active = active; }

        static class Builder {
            private Contact contact = new Contact();
            Builder name(String name) { contact.name = name; return this; }
            Builder type(ContactType type) { contact.type = type; return this; }
            Builder email(String email) { contact.email = email; return this; }
            Builder phone(String phone) { contact.phone = phone; return this; }
            Builder taxNumber(String trn) { contact.taxNumber = trn; return this; }
            Contact build() { return contact; }
        }
    }

    static class Product {
        private String sku;
        private String name;
        private BigDecimal unitPrice;
        private String categoryCode;
        private int reorderLevel;

        static Builder builder() { return new Builder(); }
        String getSku() { return sku; }
        String getName() { return name; }
        BigDecimal getUnitPrice() { return unitPrice; }
        String getCategoryCode() { return categoryCode; }
        int getReorderLevel() { return reorderLevel; }

        static class Builder {
            private Product product = new Product();
            Builder sku(String sku) { product.sku = sku; return this; }
            Builder name(String name) { product.name = name; return this; }
            Builder unitPrice(BigDecimal price) { product.unitPrice = price; return this; }
            Builder categoryCode(String code) { product.categoryCode = code; return this; }
            Builder reorderLevel(int level) { product.reorderLevel = level; return this; }
            Product build() { return product; }
        }
    }

    static class VatCategory {
        private String code;
        private String name;
        private BigDecimal rate;
        private boolean exempt;

        static Builder builder() { return new Builder(); }
        String getCode() { return code; }
        String getName() { return name; }
        BigDecimal getRate() { return rate; }
        boolean isExempt() { return exempt; }

        static class Builder {
            private VatCategory vat = new VatCategory();
            Builder code(String code) { vat.code = code; return this; }
            Builder name(String name) { vat.name = name; return this; }
            Builder rate(BigDecimal rate) { vat.rate = rate; return this; }
            Builder isExempt(boolean exempt) { vat.exempt = exempt; return this; }
            VatCategory build() { return vat; }
        }
    }

    static class ImportResult {
        private int successCount;
        private int errorCount;
        private List<String> errors = new ArrayList<>();

        int getSuccessCount() { return successCount; }
        void setSuccessCount(int count) { this.successCount = count; }
        int getErrorCount() { return errorCount; }
        void setErrorCount(int count) { this.errorCount = count; }
        List<String> getErrors() { return errors; }
        void addError(String error) { errors.add(error); errorCount++; }
    }

    static class MasterDataService {
        private Map<String, Account> accounts = new HashMap<>();
        private Map<String, Contact> contacts = new HashMap<>();
        private Map<String, Product> products = new HashMap<>();
        private Map<String, VatCategory> vatCategories = new HashMap<>();
        private Map<String, String> categories = new HashMap<>();
        private Map<String, Integer> inventory = new HashMap<>();
        private java.util.Set<String> accountsWithTransactions = new java.util.HashSet<>();
        private int contactIdCounter = 0;

        // Account methods
        String createAccount(Account account) {
            if (!account.getCode().matches("\\d{4}")) {
                throw new IllegalArgumentException("Invalid account code format");
            }
            if (accounts.containsKey(account.getCode())) {
                throw new IllegalArgumentException("Account code already exists");
            }
            accounts.put(account.getCode(), account);
            return account.getCode();
        }

        void updateAccount(String code, Account account) {
            if (account.getParentCode() != null) {
                // Check for circular hierarchy
                String parent = account.getParentCode();
                while (parent != null) {
                    if (parent.equals(code)) {
                        throw new IllegalArgumentException("Circular hierarchy detected");
                    }
                    Account parentAccount = accounts.get(parent);
                    parent = parentAccount != null ? parentAccount.getParentCode() : null;
                }
            }
            accounts.put(code, account);
        }

        Optional<Account> getAccount(String code) {
            return getAccount(code, false);
        }

        Optional<Account> getAccount(String code, boolean includeDeleted) {
            Account account = accounts.get(code);
            if (account == null) return Optional.empty();
            if (!includeDeleted && account.isDeleted()) return Optional.empty();
            return Optional.of(account);
        }

        List<Account> getChildAccounts(String parentCode) {
            List<Account> children = new ArrayList<>();
            for (Account acc : accounts.values()) {
                if (parentCode.equals(acc.getParentCode()) && !acc.isDeleted()) {
                    children.add(acc);
                }
            }
            return children;
        }

        void addTransactionToAccount(String code) {
            accountsWithTransactions.add(code);
        }

        void deleteAccount(String code) {
            if (accountsWithTransactions.contains(code)) {
                throw new IllegalStateException("Cannot delete account with transactions");
            }
            accounts.remove(code);
        }

        void softDeleteAccount(String code) {
            Account account = accounts.get(code);
            if (account != null) {
                account.setDeleted(true);
            }
        }

        // Contact methods
        String createContact(Contact contact) {
            if (contact.getEmail() != null && !contact.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
                throw new IllegalArgumentException("Invalid email format");
            }
            if (contact.getPhone() != null && !contact.getPhone().matches("^\\+971\\d{9}$")) {
                throw new IllegalArgumentException("Invalid UAE phone format");
            }
            if (contact.getTaxNumber() != null && !contact.getTaxNumber().matches("^100\\d{12}$")) {
                throw new IllegalArgumentException("Invalid TRN format");
            }
            String id = "CONTACT-" + (++contactIdCounter);
            contact.setId(id);
            contacts.put(id, contact);
            return id;
        }

        Optional<Contact> getContact(String id) {
            return Optional.ofNullable(contacts.get(id));
        }

        List<Contact> findDuplicates(Contact contact) {
            List<Contact> duplicates = new ArrayList<>();
            for (Contact existing : contacts.values()) {
                if (contact.getEmail() != null && contact.getEmail().equals(existing.getEmail())) {
                    duplicates.add(existing);
                }
            }
            return duplicates;
        }

        List<Contact> searchContacts(String query) {
            List<Contact> results = new ArrayList<>();
            for (Contact c : contacts.values()) {
                if (c.getName().toLowerCase().contains(query.toLowerCase())) {
                    results.add(c);
                }
            }
            return results;
        }

        ImportResult importContactsFromCsv(String csv) {
            ImportResult result = new ImportResult();
            String[] lines = csv.split("\n");
            for (int i = 1; i < lines.length; i++) {
                String[] fields = lines[i].split(",");
                try {
                    Contact contact = Contact.builder()
                        .name(fields[0])
                        .type(ContactType.valueOf(fields[1]))
                        .email(fields.length > 2 ? fields[2] : null)
                        .build();
                    createContact(contact);
                    result.setSuccessCount(result.getSuccessCount() + 1);
                } catch (Exception e) {
                    result.addError("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
            return result;
        }

        String exportContactsToCsv() {
            StringBuilder sb = new StringBuilder("Name,Type,Email\n");
            for (Contact c : contacts.values()) {
                sb.append(c.getName()).append(",").append(c.getType()).append(",").append(c.getEmail()).append("\n");
            }
            return sb.toString();
        }

        int bulkUpdateContactStatus(List<String> ids, boolean active) {
            int count = 0;
            for (String id : ids) {
                Contact c = contacts.get(id);
                if (c != null) {
                    c.setActive(active);
                    count++;
                }
            }
            return count;
        }

        // Product methods
        String createProduct(Product product) {
            if (product.getUnitPrice() != null && product.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Unit price must be positive");
            }
            if (products.containsKey(product.getSku())) {
                throw new IllegalArgumentException("SKU already exists");
            }
            products.put(product.getSku(), product);
            inventory.put(product.getSku(), 0);
            return product.getSku();
        }

        Optional<Product> getProductBySku(String sku) {
            return Optional.ofNullable(products.get(sku));
        }

        void createCategory(String code, String name) {
            categories.put(code, name);
        }

        List<Product> getProductsByCategory(String categoryCode) {
            List<Product> result = new ArrayList<>();
            for (Product p : products.values()) {
                if (categoryCode.equals(p.getCategoryCode())) {
                    result.add(p);
                }
            }
            return result;
        }

        void updateInventory(String sku, int quantity) {
            inventory.merge(sku, quantity, Integer::sum);
        }

        int getInventoryLevel(String sku) {
            return inventory.getOrDefault(sku, 0);
        }

        List<Product> getLowStockProducts() {
            List<Product> lowStock = new ArrayList<>();
            for (Product p : products.values()) {
                if (p.getReorderLevel() > 0 && getInventoryLevel(p.getSku()) < p.getReorderLevel()) {
                    lowStock.add(p);
                }
            }
            return lowStock;
        }

        // VAT methods
        String createVatCategory(VatCategory vat) {
            if (vat.getRate().compareTo(BigDecimal.ZERO) < 0 || vat.getRate().compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("VAT rate must be between 0 and 100");
            }
            vatCategories.put(vat.getCode(), vat);
            return vat.getCode();
        }

        Optional<VatCategory> getVatCategory(String code) {
            return Optional.ofNullable(vatCategories.get(code));
        }

        BigDecimal calculateVat(String categoryCode, BigDecimal amount) {
            VatCategory vat = vatCategories.get(categoryCode);
            if (vat == null || vat.isExempt()) return BigDecimal.ZERO;
            return amount.multiply(vat.getRate()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        }
    }
}
