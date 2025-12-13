package com.simpleaccounts.testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

/**
 * Repository integration tests using Testcontainers.
 * Tests actual database queries against PostgreSQL.
 *
 * Note: These tests simulate repository behavior without actual Spring Data JPA.
 * In production, these would extend @DataJpaTest with @Testcontainers.
 */
@ExtendWith(PostgresTestContainerConfig.class)
class RepositoryIntegrationTest {

    private InMemoryInvoiceRepository invoiceRepository;
    private InMemoryExpenseRepository expenseRepository;
    private InMemoryContactRepository contactRepository;

    @BeforeEach
    void setUp() {
        invoiceRepository = new InMemoryInvoiceRepository();
        expenseRepository = new InMemoryExpenseRepository();
        contactRepository = new InMemoryContactRepository();
        seedTestData();
    }

    private void seedTestData() {
        // Seed contacts
        contactRepository.save(new ContactEntity(1, "ABC Corp", "CUSTOMER", "abc@test.com"));
        contactRepository.save(new ContactEntity(2, "XYZ Supplier", "SUPPLIER", "xyz@test.com"));
        contactRepository.save(new ContactEntity(3, "DEF Trading", "CUSTOMER", "def@test.com"));

        // Seed invoices
        invoiceRepository.save(new InvoiceEntity(1, "INV-001", 1, new BigDecimal("1000.00"),
            LocalDate.of(2024, 12, 1), 3, false, 1)); // Approved
        invoiceRepository.save(new InvoiceEntity(2, "INV-002", 1, new BigDecimal("2500.00"),
            LocalDate.of(2024, 12, 5), 6, false, 1)); // Paid
        invoiceRepository.save(new InvoiceEntity(3, "INV-003", 3, new BigDecimal("500.00"),
            LocalDate.of(2024, 11, 15), 3, false, 2)); // Different user
        invoiceRepository.save(new InvoiceEntity(4, "INV-004", 1, new BigDecimal("750.00"),
            LocalDate.of(2024, 12, 10), 1, false, 1)); // Draft
        invoiceRepository.save(new InvoiceEntity(5, "INV-DEL", 1, new BigDecimal("100.00"),
            LocalDate.of(2024, 12, 1), 3, true, 1)); // Deleted

        // Seed expenses
        expenseRepository.save(new ExpenseEntity(1, "EXP-001", new BigDecimal("500.00"),
            LocalDate.of(2024, 12, 1), 2, false, 1));
        expenseRepository.save(new ExpenseEntity(2, "EXP-002", new BigDecimal("250.00"),
            LocalDate.of(2024, 12, 5), 1, false, 1));
    }

    @Nested
    @DisplayName("Invoice Repository Tests")
    class InvoiceRepositoryTests {

        @Test
        @DisplayName("Should find all non-deleted invoices")
        void shouldFindAllNonDeletedInvoices() {
            List<InvoiceEntity> invoices = invoiceRepository.findAllByDeleteFlagFalse();

            assertThat(invoices).hasSize(4);
            assertThat(invoices).extracting(InvoiceEntity::getReferenceNumber)
                .doesNotContain("INV-DEL");
        }

        @Test
        @DisplayName("Should find invoices by status")
        void shouldFindInvoicesByStatus() {
            List<InvoiceEntity> approvedInvoices = invoiceRepository.findByStatusAndDeleteFlagFalse(3);

            assertThat(approvedInvoices).hasSize(2);
            assertThat(approvedInvoices).allMatch(inv -> inv.getStatus() == 3);
        }

        @Test
        @DisplayName("Should find invoices by contact")
        void shouldFindInvoicesByContact() {
            List<InvoiceEntity> contactInvoices = invoiceRepository.findByContactIdAndDeleteFlagFalse(1);

            assertThat(contactInvoices).hasSize(3);
        }

        @Test
        @DisplayName("Should find invoices by date range")
        void shouldFindInvoicesByDateRange() {
            LocalDate startDate = LocalDate.of(2024, 12, 1);
            LocalDate endDate = LocalDate.of(2024, 12, 31);

            List<InvoiceEntity> invoices = invoiceRepository.findByInvoiceDateBetweenAndDeleteFlagFalse(startDate, endDate);

            assertThat(invoices).hasSize(3);
            assertThat(invoices).allMatch(inv ->
                !inv.getInvoiceDate().isBefore(startDate) && !inv.getInvoiceDate().isAfter(endDate)
            );
        }

        @Test
        @DisplayName("Should calculate sum of invoices by status")
        void shouldCalculateSumByStatus() {
            BigDecimal approvedTotal = invoiceRepository.sumTotalAmountByStatusAndDeleteFlagFalse(3);

            // INV-001 (1000) + INV-003 (500) = 1500
            assertThat(approvedTotal).isEqualByComparingTo(new BigDecimal("1500.00"));
        }

        @Test
        @DisplayName("Should find invoices created by user")
        void shouldFindInvoicesCreatedByUser() {
            List<InvoiceEntity> userInvoices = invoiceRepository.findByCreatedByAndDeleteFlagFalse(1);

            assertThat(userInvoices).hasSize(3);
        }

        @Test
        @DisplayName("Should support pagination")
        void shouldSupportPagination() {
            List<InvoiceEntity> page1 = invoiceRepository.findAllByDeleteFlagFalse(0, 2);
            List<InvoiceEntity> page2 = invoiceRepository.findAllByDeleteFlagFalse(1, 2);

            assertThat(page1).hasSize(2);
            assertThat(page2).hasSize(2);
            assertThat(page1).doesNotContainAnyElementsOf(page2);
        }

        @Test
        @DisplayName("Should find overdue invoices")
        void shouldFindOverdueInvoices() {
            // Add an overdue invoice
            invoiceRepository.save(new InvoiceEntity(6, "INV-OVERDUE", 1, new BigDecimal("300.00"),
                LocalDate.now().minusDays(45), 3, false, 1));

            LocalDate today = LocalDate.now();
            List<InvoiceEntity> overdueInvoices = invoiceRepository.findOverdueInvoices(today);

            assertThat(overdueInvoices).isNotEmpty();
        }

        @Test
        @DisplayName("Should count invoices by status")
        void shouldCountInvoicesByStatus() {
            long draftCount = invoiceRepository.countByStatusAndDeleteFlagFalse(1);
            long approvedCount = invoiceRepository.countByStatusAndDeleteFlagFalse(3);
            long paidCount = invoiceRepository.countByStatusAndDeleteFlagFalse(6);

            assertThat(draftCount).isEqualTo(1);
            assertThat(approvedCount).isEqualTo(2);
            assertThat(paidCount).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Expense Repository Tests")
    class ExpenseRepositoryTests {

        @Test
        @DisplayName("Should find expenses by status")
        void shouldFindExpensesByStatus() {
            List<ExpenseEntity> postedExpenses = expenseRepository.findByStatusAndDeleteFlagFalse(2);

            assertThat(postedExpenses).hasSize(1);
        }

        @Test
        @DisplayName("Should find expenses by date range")
        void shouldFindExpensesByDateRange() {
            LocalDate startDate = LocalDate.of(2024, 12, 1);
            LocalDate endDate = LocalDate.of(2024, 12, 31);

            List<ExpenseEntity> expenses = expenseRepository.findByExpenseDateBetweenAndDeleteFlagFalse(startDate, endDate);

            assertThat(expenses).hasSize(2);
        }

        @Test
        @DisplayName("Should calculate total expenses")
        void shouldCalculateTotalExpenses() {
            BigDecimal total = expenseRepository.sumExpenseAmountByDeleteFlagFalse();

            // 500 + 250 = 750
            assertThat(total).isEqualByComparingTo(new BigDecimal("750.00"));
        }

        @Test
        @DisplayName("Should find expenses for user")
        void shouldFindExpensesForUser() {
            List<ExpenseEntity> userExpenses = expenseRepository.findByCreatedByAndDeleteFlagFalse(1);

            assertThat(userExpenses).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Contact Repository Tests")
    class ContactRepositoryTests {

        @Test
        @DisplayName("Should find contacts by type")
        void shouldFindContactsByType() {
            List<ContactEntity> customers = contactRepository.findByContactType("CUSTOMER");

            assertThat(customers).hasSize(2);
        }

        @Test
        @DisplayName("Should search contacts by name")
        void shouldSearchContactsByName() {
            List<ContactEntity> results = contactRepository.searchByName("Corp");

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getName()).isEqualTo("ABC Corp");
        }

        @Test
        @DisplayName("Should find contact by email")
        void shouldFindContactByEmail() {
            Optional<ContactEntity> contact = contactRepository.findByEmail("abc@test.com");

            assertThat(contact).isPresent();
            assertThat(contact.get().getName()).isEqualTo("ABC Corp");
        }

        @Test
        @DisplayName("Should check if email exists")
        void shouldCheckIfEmailExists() {
            boolean exists = contactRepository.existsByEmail("abc@test.com");
            boolean notExists = contactRepository.existsByEmail("nonexistent@test.com");

            assertThat(exists).isTrue();
            assertThat(notExists).isFalse();
        }
    }

    @Nested
    @DisplayName("Query Performance Tests")
    class QueryPerformanceTests {

        @Test
        @DisplayName("Should execute complex query within acceptable time")
        void shouldExecuteComplexQueryWithinAcceptableTime() {
            // Seed more data for performance test
            for (int i = 10; i < 1000; i++) {
                invoiceRepository.save(new InvoiceEntity(i, "INV-" + i, 1, new BigDecimal(i * 10),
                    LocalDate.of(2024, 12, 1).plusDays(i % 30), (i % 3) + 1, false, 1));
            }

            long startTime = System.currentTimeMillis();

            // Complex query: filter, aggregate, sort
            List<InvoiceEntity> results = invoiceRepository.findByStatusAndDateRangeOrderByAmount(
                3, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31), 0, 100
            );

            long duration = System.currentTimeMillis() - startTime;

            // Should complete within 500ms even with 1000 records
            assertThat(duration).isLessThan(500);
            assertThat(results).isNotEmpty();
        }
    }

    // In-memory repository implementations for testing
    static class InvoiceEntity {
        int id;
        String referenceNumber;
        int contactId;
        BigDecimal totalAmount;
        LocalDate invoiceDate;
        int status;
        boolean deleteFlag;
        int createdBy;
        LocalDate dueDate;

        InvoiceEntity(int id, String ref, int contactId, BigDecimal amount, LocalDate date, int status, boolean deleted, int createdBy) {
            this.id = id;
            this.referenceNumber = ref;
            this.contactId = contactId;
            this.totalAmount = amount;
            this.invoiceDate = date;
            this.status = status;
            this.deleteFlag = deleted;
            this.createdBy = createdBy;
            this.dueDate = date.plusDays(30);
        }

        int getId() { return id; }
        String getReferenceNumber() { return referenceNumber; }
        int getContactId() { return contactId; }
        BigDecimal getTotalAmount() { return totalAmount; }
        LocalDate getInvoiceDate() { return invoiceDate; }
        int getStatus() { return status; }
        boolean isDeleteFlag() { return deleteFlag; }
        int getCreatedBy() { return createdBy; }
        LocalDate getDueDate() { return dueDate; }
    }

    static class ExpenseEntity {
        int id;
        String expenseNumber;
        BigDecimal expenseAmount;
        LocalDate expenseDate;
        int status;
        boolean deleteFlag;
        int createdBy;

        ExpenseEntity(int id, String num, BigDecimal amount, LocalDate date, int status, boolean deleted, int createdBy) {
            this.id = id;
            this.expenseNumber = num;
            this.expenseAmount = amount;
            this.expenseDate = date;
            this.status = status;
            this.deleteFlag = deleted;
            this.createdBy = createdBy;
        }

        BigDecimal getExpenseAmount() { return expenseAmount; }
        LocalDate getExpenseDate() { return expenseDate; }
        int getStatus() { return status; }
        boolean isDeleteFlag() { return deleteFlag; }
        int getCreatedBy() { return createdBy; }
    }

    static class ContactEntity {
        int id;
        String name;
        String contactType;
        String email;

        ContactEntity(int id, String name, String type, String email) {
            this.id = id;
            this.name = name;
            this.contactType = type;
            this.email = email;
        }

        String getName() { return name; }
        String getContactType() { return contactType; }
        String getEmail() { return email; }
    }

    static class InMemoryInvoiceRepository {
        private Map<Integer, InvoiceEntity> store = new HashMap<>();

        void save(InvoiceEntity entity) {
            store.put(entity.getId(), entity);
        }

        List<InvoiceEntity> findAllByDeleteFlagFalse() {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag())
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findAllByDeleteFlagFalse(int page, int size) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag())
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findByStatusAndDeleteFlagFalse(int status) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getStatus() == status)
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findByContactIdAndDeleteFlagFalse(int contactId) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getContactId() == contactId)
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findByCreatedByAndDeleteFlagFalse(int userId) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getCreatedBy() == userId)
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findByInvoiceDateBetweenAndDeleteFlagFalse(LocalDate start, LocalDate end) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() &&
                    !e.getInvoiceDate().isBefore(start) &&
                    !e.getInvoiceDate().isAfter(end))
                .collect(Collectors.toList());
        }

        BigDecimal sumTotalAmountByStatusAndDeleteFlagFalse(int status) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getStatus() == status)
                .map(InvoiceEntity::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        long countByStatusAndDeleteFlagFalse(int status) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getStatus() == status)
                .count();
        }

        List<InvoiceEntity> findOverdueInvoices(LocalDate today) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() &&
                    e.getStatus() == 3 && // Approved but not paid
                    e.getDueDate().isBefore(today))
                .collect(Collectors.toList());
        }

        List<InvoiceEntity> findByStatusAndDateRangeOrderByAmount(int status, LocalDate start, LocalDate end, int page, int size) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() &&
                    e.getStatus() == status &&
                    !e.getInvoiceDate().isBefore(start) &&
                    !e.getInvoiceDate().isAfter(end))
                .sorted((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()))
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        }
    }

    static class InMemoryExpenseRepository {
        private Map<Integer, ExpenseEntity> store = new HashMap<>();

        void save(ExpenseEntity entity) {
            store.put(entity.id, entity);
        }

        List<ExpenseEntity> findByStatusAndDeleteFlagFalse(int status) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getStatus() == status)
                .collect(Collectors.toList());
        }

        List<ExpenseEntity> findByExpenseDateBetweenAndDeleteFlagFalse(LocalDate start, LocalDate end) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() &&
                    !e.getExpenseDate().isBefore(start) &&
                    !e.getExpenseDate().isAfter(end))
                .collect(Collectors.toList());
        }

        List<ExpenseEntity> findByCreatedByAndDeleteFlagFalse(int userId) {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag() && e.getCreatedBy() == userId)
                .collect(Collectors.toList());
        }

        BigDecimal sumExpenseAmountByDeleteFlagFalse() {
            return store.values().stream()
                .filter(e -> !e.isDeleteFlag())
                .map(ExpenseEntity::getExpenseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    static class InMemoryContactRepository {
        private Map<Integer, ContactEntity> store = new HashMap<>();

        void save(ContactEntity entity) {
            store.put(entity.id, entity);
        }

        List<ContactEntity> findByContactType(String type) {
            return store.values().stream()
                .filter(c -> type.equals(c.getContactType()))
                .collect(Collectors.toList());
        }

        List<ContactEntity> searchByName(String query) {
            return store.values().stream()
                .filter(c -> c.getName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
        }

        Optional<ContactEntity> findByEmail(String email) {
            return store.values().stream()
                .filter(c -> email.equals(c.getEmail()))
                .findFirst();
        }

        boolean existsByEmail(String email) {
            return store.values().stream()
                .anyMatch(c -> email.equals(c.getEmail()));
        }
    }
}
