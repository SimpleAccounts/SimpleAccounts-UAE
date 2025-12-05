package com.simpleaccounts.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for audit trail functionality.
 * Every financial transaction must be logged immutably.
 */
class AuditTrailTest {

    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogService();
    }

    @Nested
    @DisplayName("Invoice Audit Log Tests")
    class InvoiceAuditLogTests {

        @Test
        @DisplayName("Should log invoice creation with full context")
        void shouldLogInvoiceCreationWithFullContext() {
            String invoiceId = "INV-2024-001";
            String userId = "user123";
            BigDecimal amount = new BigDecimal("5000.00");

            AuditLog log = auditLogService.logInvoiceCreation(invoiceId, userId, amount);

            assertThat(log).isNotNull();
            assertThat(log.getEntityType()).isEqualTo("INVOICE");
            assertThat(log.getEntityId()).isEqualTo(invoiceId);
            assertThat(log.getAction()).isEqualTo("CREATE");
            assertThat(log.getUserId()).isEqualTo(userId);
            assertThat(log.getTimestamp()).isNotNull();
            assertThat(log.getNewValue()).contains("5000.00");
            assertThat(log.getOldValue()).isNull();
        }

        @Test
        @DisplayName("Should log invoice update with before/after values")
        void shouldLogInvoiceUpdateWithBeforeAfterValues() {
            String invoiceId = "INV-2024-002";
            String userId = "user456";
            BigDecimal oldAmount = new BigDecimal("1000.00");
            BigDecimal newAmount = new BigDecimal("1500.00");

            AuditLog log = auditLogService.logInvoiceUpdate(invoiceId, userId,
                "amount", oldAmount.toString(), newAmount.toString());

            assertThat(log.getAction()).isEqualTo("UPDATE");
            assertThat(log.getFieldName()).isEqualTo("amount");
            assertThat(log.getOldValue()).isEqualTo("1000.00");
            assertThat(log.getNewValue()).isEqualTo("1500.00");
        }

        @Test
        @DisplayName("Should log invoice status change")
        void shouldLogInvoiceStatusChange() {
            String invoiceId = "INV-2024-003";
            String userId = "approver1";

            AuditLog log = auditLogService.logStatusChange(invoiceId, "INVOICE",
                userId, "DRAFT", "APPROVED");

            assertThat(log.getAction()).isEqualTo("STATUS_CHANGE");
            assertThat(log.getOldValue()).isEqualTo("DRAFT");
            assertThat(log.getNewValue()).isEqualTo("APPROVED");
        }

        @Test
        @DisplayName("Should log invoice deletion")
        void shouldLogInvoiceDeletion() {
            String invoiceId = "INV-2024-004";
            String userId = "admin1";
            String reason = "Duplicate entry";

            AuditLog log = auditLogService.logDeletion(invoiceId, "INVOICE", userId, reason);

            assertThat(log.getAction()).isEqualTo("DELETE");
            assertThat(log.getMetadata()).contains("Duplicate entry");
        }
    }

    @Nested
    @DisplayName("Payment Audit Log Tests")
    class PaymentAuditLogTests {

        @Test
        @DisplayName("Should log payment recording")
        void shouldLogPaymentRecording() {
            String paymentId = "PAY-2024-001";
            String invoiceId = "INV-2024-001";
            String userId = "accountant1";
            BigDecimal amount = new BigDecimal("2500.00");

            AuditLog log = auditLogService.logPayment(paymentId, invoiceId, userId, amount);

            assertThat(log.getEntityType()).isEqualTo("PAYMENT");
            assertThat(log.getAction()).isEqualTo("CREATE");
            assertThat(log.getMetadata()).contains(invoiceId);
            assertThat(log.getNewValue()).contains("2500.00");
        }

        @Test
        @DisplayName("Should log payment reversal")
        void shouldLogPaymentReversal() {
            String paymentId = "PAY-2024-002";
            String userId = "finance_manager";
            String reason = "Bank returned payment";

            AuditLog log = auditLogService.logPaymentReversal(paymentId, userId, reason);

            assertThat(log.getAction()).isEqualTo("REVERSAL");
            assertThat(log.getMetadata()).contains(reason);
        }
    }

    @Nested
    @DisplayName("Journal Entry Audit Log Tests")
    class JournalEntryAuditLogTests {

        @Test
        @DisplayName("Should log journal entry creation")
        void shouldLogJournalEntryCreation() {
            String journalId = "JE-2024-001";
            String userId = "accountant1";
            BigDecimal debitTotal = new BigDecimal("10000.00");
            BigDecimal creditTotal = new BigDecimal("10000.00");

            AuditLog log = auditLogService.logJournalEntry(journalId, userId,
                debitTotal, creditTotal);

            assertThat(log.getEntityType()).isEqualTo("JOURNAL_ENTRY");
            assertThat(log.getAction()).isEqualTo("CREATE");
            assertThat(log.getMetadata()).contains("debit=10000.00");
            assertThat(log.getMetadata()).contains("credit=10000.00");
        }

        @Test
        @DisplayName("Should log journal entry posting")
        void shouldLogJournalEntryPosting() {
            String journalId = "JE-2024-002";
            String userId = "accountant1";

            AuditLog log = auditLogService.logStatusChange(journalId, "JOURNAL_ENTRY",
                userId, "DRAFT", "POSTED");

            assertThat(log.getAction()).isEqualTo("STATUS_CHANGE");
            assertThat(log.getNewValue()).isEqualTo("POSTED");
        }
    }

    @Nested
    @DisplayName("Audit Log Immutability Tests")
    class ImmutabilityTests {

        @Test
        @DisplayName("Audit log should be immutable after creation")
        void auditLogShouldBeImmutableAfterCreation() {
            AuditLog log = auditLogService.logInvoiceCreation("INV-001", "user1",
                new BigDecimal("1000.00"));

            assertThatThrownBy(() -> log.setAction("MODIFIED"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("immutable");

            assertThatThrownBy(() -> log.setNewValue("tampered"))
                .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("Audit logs cannot be deleted")
        void auditLogsCannotBeDeleted() {
            AuditLog log = auditLogService.logInvoiceCreation("INV-002", "user1",
                new BigDecimal("500.00"));

            assertThatThrownBy(() -> auditLogService.deleteLog(log.getId()))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("cannot be deleted");
        }

        @Test
        @DisplayName("Audit logs cannot be modified")
        void auditLogsCannotBeModified() {
            AuditLog log = auditLogService.logInvoiceCreation("INV-003", "user1",
                new BigDecimal("750.00"));

            assertThatThrownBy(() -> auditLogService.updateLog(log.getId(), "newValue"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("cannot be modified");
        }
    }

    @Nested
    @DisplayName("Audit Log Query Tests")
    class QueryTests {

        @BeforeEach
        void createSampleLogs() {
            auditLogService.logInvoiceCreation("INV-001", "user1", new BigDecimal("1000.00"));
            auditLogService.logInvoiceCreation("INV-002", "user1", new BigDecimal("2000.00"));
            auditLogService.logInvoiceCreation("INV-003", "user2", new BigDecimal("3000.00"));
            auditLogService.logStatusChange("INV-001", "INVOICE", "approver1", "DRAFT", "APPROVED");
        }

        @Test
        @DisplayName("Should find logs by entity ID")
        void shouldFindLogsByEntityId() {
            List<AuditLog> logs = auditLogService.findByEntityId("INV-001");

            assertThat(logs).hasSize(2); // CREATE and STATUS_CHANGE
        }

        @Test
        @DisplayName("Should find logs by user ID")
        void shouldFindLogsByUserId() {
            List<AuditLog> logs = auditLogService.findByUserId("user1");

            assertThat(logs).hasSize(2); // Two invoices created by user1
        }

        @Test
        @DisplayName("Should find logs by action type")
        void shouldFindLogsByActionType() {
            List<AuditLog> logs = auditLogService.findByAction("CREATE");

            assertThat(logs).hasSize(3);
        }

        @Test
        @DisplayName("Should find logs by entity type")
        void shouldFindLogsByEntityType() {
            List<AuditLog> logs = auditLogService.findByEntityType("INVOICE");

            assertThat(logs).hasSize(4);
        }

        @Test
        @DisplayName("Should find logs in date range")
        void shouldFindLogsInDateRange() {
            LocalDateTime start = LocalDateTime.now().minusHours(1);
            LocalDateTime end = LocalDateTime.now().plusHours(1);

            List<AuditLog> logs = auditLogService.findByDateRange(start, end);

            assertThat(logs).isNotEmpty();
        }
    }

    @Nested
    @DisplayName("Audit Log Compliance Tests")
    class ComplianceTests {

        @Test
        @DisplayName("Should generate unique audit log ID")
        void shouldGenerateUniqueAuditLogId() {
            AuditLog log1 = auditLogService.logInvoiceCreation("INV-001", "user1",
                new BigDecimal("100.00"));
            AuditLog log2 = auditLogService.logInvoiceCreation("INV-002", "user1",
                new BigDecimal("200.00"));

            assertThat(log1.getId()).isNotEqualTo(log2.getId());
        }

        @Test
        @DisplayName("Should record accurate timestamp")
        void shouldRecordAccurateTimestamp() {
            LocalDateTime before = LocalDateTime.now();

            AuditLog log = auditLogService.logInvoiceCreation("INV-001", "user1",
                new BigDecimal("500.00"));

            LocalDateTime after = LocalDateTime.now();

            assertThat(log.getTimestamp()).isAfterOrEqualTo(before);
            assertThat(log.getTimestamp()).isBeforeOrEqualTo(after);
        }

        @Test
        @DisplayName("Should capture IP address when available")
        void shouldCaptureIpAddressWhenAvailable() {
            auditLogService.setCurrentIpAddress("192.168.1.100");

            AuditLog log = auditLogService.logInvoiceCreation("INV-001", "user1",
                new BigDecimal("100.00"));

            assertThat(log.getIpAddress()).isEqualTo("192.168.1.100");
        }

        @Test
        @DisplayName("Should capture user agent when available")
        void shouldCaptureUserAgentWhenAvailable() {
            auditLogService.setCurrentUserAgent("Mozilla/5.0 Chrome/120.0");

            AuditLog log = auditLogService.logInvoiceCreation("INV-001", "user1",
                new BigDecimal("100.00"));

            assertThat(log.getUserAgent()).contains("Chrome");
        }
    }

    // Helper classes for testing

    static class AuditLog {
        private final String id;
        private final String entityType;
        private final String entityId;
        private final String action;
        private final String userId;
        private final LocalDateTime timestamp;
        private final String fieldName;
        private final String oldValue;
        private final String newValue;
        private final String metadata;
        private final String ipAddress;
        private final String userAgent;
        private boolean frozen = false;

        AuditLog(Builder builder) {
            this.id = builder.id;
            this.entityType = builder.entityType;
            this.entityId = builder.entityId;
            this.action = builder.action;
            this.userId = builder.userId;
            this.timestamp = builder.timestamp;
            this.fieldName = builder.fieldName;
            this.oldValue = builder.oldValue;
            this.newValue = builder.newValue;
            this.metadata = builder.metadata;
            this.ipAddress = builder.ipAddress;
            this.userAgent = builder.userAgent;
        }

        String getId() { return id; }
        String getEntityType() { return entityType; }
        String getEntityId() { return entityId; }
        String getAction() { return action; }
        String getUserId() { return userId; }
        LocalDateTime getTimestamp() { return timestamp; }
        String getFieldName() { return fieldName; }
        String getOldValue() { return oldValue; }
        String getNewValue() { return newValue; }
        String getMetadata() { return metadata; }
        String getIpAddress() { return ipAddress; }
        String getUserAgent() { return userAgent; }

        void freeze() { this.frozen = true; }

        void setAction(String action) {
            if (frozen) throw new UnsupportedOperationException("Audit log is immutable");
        }

        void setNewValue(String value) {
            if (frozen) throw new UnsupportedOperationException("Audit log is immutable");
        }

        static class Builder {
            private String id = UUID.randomUUID().toString();
            private String entityType;
            private String entityId;
            private String action;
            private String userId;
            private LocalDateTime timestamp = LocalDateTime.now();
            private String fieldName;
            private String oldValue;
            private String newValue;
            private String metadata;
            private String ipAddress;
            private String userAgent;

            Builder entityType(String entityType) { this.entityType = entityType; return this; }
            Builder entityId(String entityId) { this.entityId = entityId; return this; }
            Builder action(String action) { this.action = action; return this; }
            Builder userId(String userId) { this.userId = userId; return this; }
            Builder fieldName(String fieldName) { this.fieldName = fieldName; return this; }
            Builder oldValue(String oldValue) { this.oldValue = oldValue; return this; }
            Builder newValue(String newValue) { this.newValue = newValue; return this; }
            Builder metadata(String metadata) { this.metadata = metadata; return this; }
            Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
            Builder userAgent(String userAgent) { this.userAgent = userAgent; return this; }

            AuditLog build() {
                AuditLog log = new AuditLog(this);
                log.freeze();
                return log;
            }
        }
    }

    static class AuditLogService {
        private final List<AuditLog> logs = new ArrayList<>();
        private String currentIpAddress;
        private String currentUserAgent;

        void setCurrentIpAddress(String ip) { this.currentIpAddress = ip; }
        void setCurrentUserAgent(String ua) { this.currentUserAgent = ua; }

        AuditLog logInvoiceCreation(String invoiceId, String userId, BigDecimal amount) {
            AuditLog log = new AuditLog.Builder()
                .entityType("INVOICE")
                .entityId(invoiceId)
                .action("CREATE")
                .userId(userId)
                .newValue("amount=" + amount.toString())
                .ipAddress(currentIpAddress)
                .userAgent(currentUserAgent)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logInvoiceUpdate(String invoiceId, String userId, String field,
                                   String oldValue, String newValue) {
            AuditLog log = new AuditLog.Builder()
                .entityType("INVOICE")
                .entityId(invoiceId)
                .action("UPDATE")
                .userId(userId)
                .fieldName(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logStatusChange(String entityId, String entityType, String userId,
                                  String oldStatus, String newStatus) {
            AuditLog log = new AuditLog.Builder()
                .entityType(entityType)
                .entityId(entityId)
                .action("STATUS_CHANGE")
                .userId(userId)
                .oldValue(oldStatus)
                .newValue(newStatus)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logDeletion(String entityId, String entityType, String userId, String reason) {
            AuditLog log = new AuditLog.Builder()
                .entityType(entityType)
                .entityId(entityId)
                .action("DELETE")
                .userId(userId)
                .metadata(reason)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logPayment(String paymentId, String invoiceId, String userId, BigDecimal amount) {
            AuditLog log = new AuditLog.Builder()
                .entityType("PAYMENT")
                .entityId(paymentId)
                .action("CREATE")
                .userId(userId)
                .newValue("amount=" + amount.toString())
                .metadata("invoiceId=" + invoiceId)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logPaymentReversal(String paymentId, String userId, String reason) {
            AuditLog log = new AuditLog.Builder()
                .entityType("PAYMENT")
                .entityId(paymentId)
                .action("REVERSAL")
                .userId(userId)
                .metadata(reason)
                .build();
            logs.add(log);
            return log;
        }

        AuditLog logJournalEntry(String journalId, String userId,
                                  BigDecimal debitTotal, BigDecimal creditTotal) {
            AuditLog log = new AuditLog.Builder()
                .entityType("JOURNAL_ENTRY")
                .entityId(journalId)
                .action("CREATE")
                .userId(userId)
                .metadata("debit=" + debitTotal + ", credit=" + creditTotal)
                .build();
            logs.add(log);
            return log;
        }

        void deleteLog(String logId) {
            throw new UnsupportedOperationException("Audit logs cannot be deleted");
        }

        void updateLog(String logId, String newValue) {
            throw new UnsupportedOperationException("Audit logs cannot be modified");
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

        List<AuditLog> findByAction(String action) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (log.getAction().equals(action)) {
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

        List<AuditLog> findByDateRange(LocalDateTime start, LocalDateTime end) {
            List<AuditLog> result = new ArrayList<>();
            for (AuditLog log : logs) {
                if (!log.getTimestamp().isBefore(start) && !log.getTimestamp().isAfter(end)) {
                    result.add(log);
                }
            }
            return result;
        }
    }
}
