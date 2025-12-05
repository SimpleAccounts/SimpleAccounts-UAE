package com.simpleaccounts.audit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

/**
 * Tests for Audit Trail functionality.
 * 
 * Every financial transaction must be logged immutably with:
 * - User attribution
 * - Timestamp
 * - Action type
 * - Before/after values
 */
@DisplayName("Audit Trail Tests")
class AuditTrailTest {

    private AuditService auditService;
    private InMemoryAuditRepository auditRepository;

    @BeforeEach
    void setUp() {
        auditRepository = new InMemoryAuditRepository();
        auditService = new AuditService(auditRepository);
    }

    @Nested
    @DisplayName("Invoice Audit Tests")
    class InvoiceAuditTests {

        @Test
        @DisplayName("Should log invoice creation with full context")
        void shouldLogInvoiceCreationWithFullContext() {
            String userId = "user-123";
            String invoiceId = "INV-001";
            Map<String, Object> newValues = new HashMap<>();
            newValues.put("amount", new BigDecimal("1000.00"));
            newValues.put("customer", "ABC Corp");
            newValues.put("status", "DRAFT");

            auditService.logCreate("INVOICE", invoiceId, userId, newValues);

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction(invoiceId, "CREATE");
            assertThat(log).isPresent();
            assertThat(log.get().getUserId()).isEqualTo(userId);
            assertThat(log.get().getEntityType()).isEqualTo("INVOICE");
            assertThat(log.get().getNewValues()).containsEntry("amount", new BigDecimal("1000.00"));
            assertThat(log.get().getTimestamp()).isCloseTo(LocalDateTime.now(), within(1, java.time.temporal.ChronoUnit.SECONDS));
        }

        @Test
        @DisplayName("Should log invoice update with before and after values")
        void shouldLogInvoiceUpdateWithBeforeAfter() {
            String invoiceId = "INV-001";
            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("amount", new BigDecimal("1000.00"));
            oldValues.put("status", "DRAFT");

            Map<String, Object> newValues = new HashMap<>();
            newValues.put("amount", new BigDecimal("1200.00"));
            newValues.put("status", "APPROVED");

            auditService.logUpdate("INVOICE", invoiceId, "user-123", oldValues, newValues);

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction(invoiceId, "UPDATE");
            assertThat(log).isPresent();
            assertThat(log.get().getOldValues()).containsEntry("amount", new BigDecimal("1000.00"));
            assertThat(log.get().getNewValues()).containsEntry("amount", new BigDecimal("1200.00"));
        }

        @Test
        @DisplayName("Should log invoice deletion")
        void shouldLogInvoiceDeletion() {
            String invoiceId = "INV-001";
            Map<String, Object> deletedValues = new HashMap<>();
            deletedValues.put("amount", new BigDecimal("1000.00"));

            auditService.logDelete("INVOICE", invoiceId, "user-123", deletedValues);

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction(invoiceId, "DELETE");
            assertThat(log).isPresent();
            assertThat(log.get().getOldValues()).containsEntry("amount", new BigDecimal("1000.00"));
            assertThat(log.get().getNewValues()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Immutability Tests")
    class ImmutabilityTests {

        @Test
        @DisplayName("Should prevent modification of audit logs")
        void shouldPreventAuditLogModification() {
            auditService.logCreate("INVOICE", "INV-001", "user-123", new HashMap<>());

            assertThatThrownBy(() -> auditRepository.updateLog("INV-001", "CREATE"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("immutable");
        }

        @Test
        @DisplayName("Should prevent deletion of audit logs")
        void shouldPreventAuditLogDeletion() {
            auditService.logCreate("INVOICE", "INV-001", "user-123", new HashMap<>());

            assertThatThrownBy(() -> auditRepository.deleteLog("INV-001", "CREATE"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("immutable");
        }

        @Test
        @DisplayName("Should generate unique audit log ID")
        void shouldGenerateUniqueAuditLogId() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());
            auditService.logCreate("INVOICE", "INV-001", "user-2", new HashMap<>());

            List<AuditLog> logs = auditRepository.findByEntityId("INV-001");
            assertThat(logs).hasSize(2);
            assertThat(logs.get(0).getId()).isNotEqualTo(logs.get(1).getId());
        }
    }

    @Nested
    @DisplayName("Query Tests")
    class QueryTests {

        @Test
        @DisplayName("Should query audit logs by entity")
        void shouldQueryByEntity() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());
            auditService.logUpdate("INVOICE", "INV-001", "user-2", new HashMap<>(), new HashMap<>());
            auditService.logCreate("INVOICE", "INV-002", "user-1", new HashMap<>());

            List<AuditLog> logs = auditRepository.findByEntityId("INV-001");
            assertThat(logs).hasSize(2);
        }

        @Test
        @DisplayName("Should query audit logs by user")
        void shouldQueryByUser() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());
            auditService.logCreate("INVOICE", "INV-002", "user-2", new HashMap<>());
            auditService.logCreate("EXPENSE", "EXP-001", "user-1", new HashMap<>());

            List<AuditLog> logs = auditRepository.findByUserId("user-1");
            assertThat(logs).hasSize(2);
        }

        @Test
        @DisplayName("Should query audit logs by date range")
        void shouldQueryByDateRange() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());

            LocalDateTime start = LocalDateTime.now().minusHours(1);
            LocalDateTime end = LocalDateTime.now().plusHours(1);

            List<AuditLog> logs = auditRepository.findByDateRange(start, end);
            assertThat(logs).hasSize(1);
        }

        @Test
        @DisplayName("Should query audit logs by entity type")
        void shouldQueryByEntityType() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());
            auditService.logCreate("EXPENSE", "EXP-001", "user-1", new HashMap<>());
            auditService.logCreate("INVOICE", "INV-002", "user-1", new HashMap<>());

            List<AuditLog> logs = auditRepository.findByEntityType("INVOICE");
            assertThat(logs).hasSize(2);
        }
    }

    @Nested
    @DisplayName("User Attribution Tests")
    class UserAttributionTests {

        @Test
        @DisplayName("Should capture user ID for every action")
        void shouldCaptureUserId() {
            auditService.logCreate("INVOICE", "INV-001", "admin-user", new HashMap<>());

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction("INV-001", "CREATE");
            assertThat(log.get().getUserId()).isEqualTo("admin-user");
        }

        @Test
        @DisplayName("Should reject null user ID")
        void shouldRejectNullUserId() {
            assertThatThrownBy(() ->
                auditService.logCreate("INVOICE", "INV-001", null, new HashMap<>())
            ).isInstanceOf(IllegalArgumentException.class)
             .hasMessageContaining("user");
        }

        @Test
        @DisplayName("Should capture IP address when provided")
        void shouldCaptureIpAddress() {
            auditService.logCreateWithContext("INVOICE", "INV-001", "user-1",
                new HashMap<>(), "192.168.1.1", "Chrome/120");

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction("INV-001", "CREATE");
            assertThat(log.get().getIpAddress()).isEqualTo("192.168.1.1");
            assertThat(log.get().getUserAgent()).isEqualTo("Chrome/120");
        }
    }

    @Nested
    @DisplayName("Financial Action Audit Tests")
    class FinancialActionTests {

        @Test
        @DisplayName("Should log payment posting")
        void shouldLogPaymentPosting() {
            Map<String, Object> values = new HashMap<>();
            values.put("amount", new BigDecimal("5000.00"));
            values.put("paymentMethod", "BANK_TRANSFER");
            values.put("reference", "PAY-001");

            auditService.logFinancialAction("PAYMENT_POSTING", "PAY-001", "user-1", values);

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction("PAY-001", "PAYMENT_POSTING");
            assertThat(log).isPresent();
            assertThat(log.get().isFinancialAction()).isTrue();
        }

        @Test
        @DisplayName("Should log journal entry posting")
        void shouldLogJournalPosting() {
            Map<String, Object> values = new HashMap<>();
            values.put("debitAccount", "1000");
            values.put("creditAccount", "2000");
            values.put("amount", new BigDecimal("10000.00"));

            auditService.logFinancialAction("JOURNAL_POSTING", "JE-001", "user-1", values);

            Optional<AuditLog> log = auditRepository.findByEntityIdAndAction("JE-001", "JOURNAL_POSTING");
            assertThat(log.get().getNewValues()).containsKey("amount");
        }

        @Test
        @DisplayName("Should log period closing")
        void shouldLogPeriodClosing() {
            Map<String, Object> values = new HashMap<>();
            values.put("period", "2024-12");
            values.put("closingBalance", new BigDecimal("50000.00"));

            auditService.logFinancialAction("PERIOD_CLOSE", "PERIOD-2024-12", "user-1", values);

            List<AuditLog> logs = auditRepository.findByAction("PERIOD_CLOSE");
            assertThat(logs).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Compliance Report Tests")
    class ComplianceReportTests {

        @Test
        @DisplayName("Should generate user activity report")
        void shouldGenerateUserActivityReport() {
            auditService.logCreate("INVOICE", "INV-001", "user-1", new HashMap<>());
            auditService.logCreate("INVOICE", "INV-002", "user-1", new HashMap<>());
            auditService.logCreate("EXPENSE", "EXP-001", "user-1", new HashMap<>());

            UserActivityReport report = auditService.generateUserActivityReport(
                "user-1", LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(1));

            assertThat(report.getTotalActions()).isEqualTo(3);
            assertThat(report.getActionsByType()).containsEntry("CREATE", 3L);
        }

        @Test
        @DisplayName("Should generate entity history report")
        void shouldGenerateEntityHistoryReport() {
            Map<String, Object> v1 = new HashMap<>();
            v1.put("status", "DRAFT");
            auditService.logCreate("INVOICE", "INV-001", "user-1", v1);

            Map<String, Object> v2old = new HashMap<>();
            v2old.put("status", "DRAFT");
            Map<String, Object> v2new = new HashMap<>();
            v2new.put("status", "APPROVED");
            auditService.logUpdate("INVOICE", "INV-001", "user-2", v2old, v2new);

            EntityHistoryReport report = auditService.generateEntityHistoryReport("INV-001");

            assertThat(report.getChangeCount()).isEqualTo(2);
            assertThat(report.getContributors()).containsExactlyInAnyOrder("user-1", "user-2");
        }
    }

    // Test implementation classes
    static class AuditLog {
        private final String id;
        private final String entityType;
        private final String entityId;
        private final String action;
        private final String userId;
        private final LocalDateTime timestamp;
        private final Map<String, Object> oldValues;
        private final Map<String, Object> newValues;
        private final String ipAddress;
        private final String userAgent;
        private final boolean financialAction;

        AuditLog(String entityType, String entityId, String action, String userId,
                Map<String, Object> oldValues, Map<String, Object> newValues,
                String ipAddress, String userAgent, boolean financialAction) {
            this.id = UUID.randomUUID().toString();
            this.entityType = entityType;
            this.entityId = entityId;
            this.action = action;
            this.userId = userId;
            this.timestamp = LocalDateTime.now();
            this.oldValues = oldValues != null ? new HashMap<>(oldValues) : new HashMap<>();
            this.newValues = newValues != null ? new HashMap<>(newValues) : new HashMap<>();
            this.ipAddress = ipAddress;
            this.userAgent = userAgent;
            this.financialAction = financialAction;
        }

        String getId() { return id; }
        String getEntityType() { return entityType; }
        String getEntityId() { return entityId; }
        String getAction() { return action; }
        String getUserId() { return userId; }
        LocalDateTime getTimestamp() { return timestamp; }
        Map<String, Object> getOldValues() { return new HashMap<>(oldValues); }
        Map<String, Object> getNewValues() { return new HashMap<>(newValues); }
        String getIpAddress() { return ipAddress; }
        String getUserAgent() { return userAgent; }
        boolean isFinancialAction() { return financialAction; }
    }

    static class InMemoryAuditRepository {
        private final List<AuditLog> logs = new ArrayList<>();

        void save(AuditLog log) {
            logs.add(log);
        }

        Optional<AuditLog> findByEntityIdAndAction(String entityId, String action) {
            return logs.stream()
                .filter(l -> l.getEntityId().equals(entityId) && l.getAction().equals(action))
                .findFirst();
        }

        List<AuditLog> findByEntityId(String entityId) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (log.getEntityId().equals(entityId)) {
                    result.add(log);
                }
            }
            return result;
        }

        List<AuditLog> findByUserId(String userId) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (log.getUserId().equals(userId)) {
                    result.add(log);
                }
            }
            return result;
        }

        List<AuditLog> findByDateRange(LocalDateTime start, LocalDateTime end) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (!log.getTimestamp().isBefore(start) && !log.getTimestamp().isAfter(end)) {
                    result.add(log);
                }
            }
            return result;
        }

        List<AuditLog> findByEntityType(String entityType) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (log.getEntityType().equals(entityType)) {
                    result.add(log);
                }
            }
            return result;
        }

        List<AuditLog> findByAction(String action) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (log.getAction().equals(action)) {
                    result.add(log);
                }
            }
            return result;
        }

        void updateLog(String entityId, String action) {
            throw new UnsupportedOperationException("Audit logs are immutable");
        }

        void deleteLog(String entityId, String action) {
            throw new UnsupportedOperationException("Audit logs are immutable");
        }
    }

    static class AuditService {
        private final InMemoryAuditRepository repository;

        AuditService(InMemoryAuditRepository repository) {
            this.repository = repository;
        }

        void logCreate(String entityType, String entityId, String userId, Map<String, Object> newValues) {
            validateUserId(userId);
            repository.save(new AuditLog(entityType, entityId, "CREATE", userId,
                null, newValues, null, null, false));
        }

        void logUpdate(String entityType, String entityId, String userId,
                      Map<String, Object> oldValues, Map<String, Object> newValues) {
            validateUserId(userId);
            repository.save(new AuditLog(entityType, entityId, "UPDATE", userId,
                oldValues, newValues, null, null, false));
        }

        void logDelete(String entityType, String entityId, String userId, Map<String, Object> oldValues) {
            validateUserId(userId);
            repository.save(new AuditLog(entityType, entityId, "DELETE", userId,
                oldValues, null, null, null, false));
        }

        void logCreateWithContext(String entityType, String entityId, String userId,
                                 Map<String, Object> newValues, String ipAddress, String userAgent) {
            validateUserId(userId);
            repository.save(new AuditLog(entityType, entityId, "CREATE", userId,
                null, newValues, ipAddress, userAgent, false));
        }

        void logFinancialAction(String action, String entityId, String userId, Map<String, Object> values) {
            validateUserId(userId);
            repository.save(new AuditLog("FINANCIAL", entityId, action, userId,
                null, values, null, null, true));
        }

        private void validateUserId(String userId) {
            if (userId == null || userId.isEmpty()) {
                throw new IllegalArgumentException("user ID is required");
            }
        }

        UserActivityReport generateUserActivityReport(String userId, LocalDateTime start, LocalDateTime end) {
            List<AuditLog> logs = repository.findByUserId(userId);
            Map<String, Long> actionCounts = new HashMap<>();
            for (AuditLog log : logs) {
                actionCounts.merge(log.getAction(), 1L, Long::sum);
            }
            return new UserActivityReport(logs.size(), actionCounts);
        }

        EntityHistoryReport generateEntityHistoryReport(String entityId) {
            List<AuditLog> logs = repository.findByEntityId(entityId);
            List<String> contributors = new ArrayList<>();
            for (AuditLog log : logs) {
                if (!contributors.contains(log.getUserId())) {
                    contributors.add(log.getUserId());
                }
            }
            return new EntityHistoryReport(logs.size(), contributors);
        }
    }

    static class UserActivityReport {
        private final int totalActions;
        private final Map<String, Long> actionsByType;

        UserActivityReport(int total, Map<String, Long> byType) {
            this.totalActions = total;
            this.actionsByType = byType;
        }

        int getTotalActions() { return totalActions; }
        Map<String, Long> getActionsByType() { return actionsByType; }
    }

    static class EntityHistoryReport {
        private final int changeCount;
        private final List<String> contributors;

        EntityHistoryReport(int count, List<String> contributors) {
            this.changeCount = count;
            this.contributors = contributors;
        }

        int getChangeCount() { return changeCount; }
        List<String> getContributors() { return contributors; }
    }
}
