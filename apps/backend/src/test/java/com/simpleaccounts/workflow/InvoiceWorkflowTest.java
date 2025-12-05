package com.simpleaccounts.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Invoice approval workflow state transitions.
 * Workflow: Draft → Approved → Sent → Paid → Archived
 */
class InvoiceWorkflowTest {

    private InvoiceWorkflowState invoiceState;

    @BeforeEach
    void setUp() {
        invoiceState = new InvoiceWorkflowState();
    }

    @Nested
    @DisplayName("Draft State Tests")
    class DraftStateTests {

        @Test
        @DisplayName("New invoice should start in Draft status")
        void newInvoiceShouldStartInDraft() {
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
            assertThat(invoiceState.isEditable()).isTrue();
        }

        @Test
        @DisplayName("Draft invoice can be edited")
        void draftInvoiceCanBeEdited() {
            invoiceState.setAmount(new BigDecimal("1000.00"));
            invoiceState.setAmount(new BigDecimal("1500.00"));

            assertThat(invoiceState.getAmount()).isEqualByComparingTo(new BigDecimal("1500.00"));
        }

        @Test
        @DisplayName("Draft invoice can transition to Approved")
        void draftCanTransitionToApproved() {
            invoiceState.setAmount(new BigDecimal("500.00"));
            invoiceState.setDueDate(LocalDate.now().plusDays(30));

            boolean result = invoiceState.approve("admin");

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.APPROVED);
            assertThat(invoiceState.getApprovedBy()).isEqualTo("admin");
        }

        @Test
        @DisplayName("Draft invoice without amount cannot be approved")
        void draftWithoutAmountCannotBeApproved() {
            assertThatThrownBy(() -> invoiceState.approve("admin"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("amount");
        }

        @Test
        @DisplayName("Draft invoice can be deleted")
        void draftInvoiceCanBeDeleted() {
            boolean result = invoiceState.delete();

            assertThat(result).isTrue();
            assertThat(invoiceState.isDeleted()).isTrue();
        }
    }

    @Nested
    @DisplayName("Approved State Tests")
    class ApprovedStateTests {

        @BeforeEach
        void setupApprovedInvoice() {
            invoiceState.setAmount(new BigDecimal("1000.00"));
            invoiceState.setDueDate(LocalDate.now().plusDays(30));
            invoiceState.approve("admin");
        }

        @Test
        @DisplayName("Approved invoice cannot be edited")
        void approvedInvoiceCannotBeEdited() {
            assertThat(invoiceState.isEditable()).isFalse();

            assertThatThrownBy(() -> invoiceState.setAmount(new BigDecimal("2000.00")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not editable");
        }

        @Test
        @DisplayName("Approved invoice can transition to Sent")
        void approvedCanTransitionToSent() {
            boolean result = invoiceState.send("customer@example.com");

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.SENT);
            assertThat(invoiceState.getSentTo()).isEqualTo("customer@example.com");
        }

        @Test
        @DisplayName("Approved invoice can be rejected back to Draft")
        void approvedCanBeRejectedToDraft() {
            boolean result = invoiceState.reject("Incorrect line items", "manager");

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
            assertThat(invoiceState.getRejectionReason()).isEqualTo("Incorrect line items");
            assertThat(invoiceState.isEditable()).isTrue();
        }

        @Test
        @DisplayName("Approved invoice cannot be deleted")
        void approvedInvoiceCannotBeDeleted() {
            assertThatThrownBy(() -> invoiceState.delete())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete");
        }
    }

    @Nested
    @DisplayName("Sent State Tests")
    class SentStateTests {

        @BeforeEach
        void setupSentInvoice() {
            invoiceState.setAmount(new BigDecimal("1000.00"));
            invoiceState.setDueDate(LocalDate.now().plusDays(30));
            invoiceState.approve("admin");
            invoiceState.send("customer@example.com");
        }

        @Test
        @DisplayName("Sent invoice can transition to Paid")
        void sentCanTransitionToPaid() {
            boolean result = invoiceState.recordPayment(new BigDecimal("1000.00"), LocalDate.now());

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.PAID);
            assertThat(invoiceState.getPaidAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
        }

        @Test
        @DisplayName("Sent invoice can receive partial payment")
        void sentCanReceivePartialPayment() {
            boolean result = invoiceState.recordPayment(new BigDecimal("500.00"), LocalDate.now());

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.PARTIALLY_PAID);
            assertThat(invoiceState.getPaidAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(invoiceState.getBalanceDue()).isEqualByComparingTo(new BigDecimal("500.00"));
        }

        @Test
        @DisplayName("Sent invoice can be resent")
        void sentInvoiceCanBeResent() {
            boolean result = invoiceState.resend("newcustomer@example.com");

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.SENT);
            assertThat(invoiceState.getSentTo()).isEqualTo("newcustomer@example.com");
        }

        @Test
        @DisplayName("Sent invoice can be voided")
        void sentInvoiceCanBeVoided() {
            boolean result = invoiceState.void_("Duplicate invoice", "admin");

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.VOIDED);
        }
    }

    @Nested
    @DisplayName("Paid State Tests")
    class PaidStateTests {

        @BeforeEach
        void setupPaidInvoice() {
            invoiceState.setAmount(new BigDecimal("1000.00"));
            invoiceState.setDueDate(LocalDate.now().plusDays(30));
            invoiceState.approve("admin");
            invoiceState.send("customer@example.com");
            invoiceState.recordPayment(new BigDecimal("1000.00"), LocalDate.now());
        }

        @Test
        @DisplayName("Paid invoice can be archived")
        void paidCanBeArchived() {
            boolean result = invoiceState.archive();

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.ARCHIVED);
        }

        @Test
        @DisplayName("Paid invoice is immutable")
        void paidInvoiceIsImmutable() {
            assertThat(invoiceState.isEditable()).isFalse();
        }

        @Test
        @DisplayName("Paid invoice cannot be voided")
        void paidInvoiceCannotBeVoided() {
            assertThatThrownBy(() -> invoiceState.void_("Test", "admin"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot void paid");
        }
    }

    @Nested
    @DisplayName("Archived State Tests")
    class ArchivedStateTests {

        @BeforeEach
        void setupArchivedInvoice() {
            invoiceState.setAmount(new BigDecimal("1000.00"));
            invoiceState.setDueDate(LocalDate.now().plusDays(30));
            invoiceState.approve("admin");
            invoiceState.send("customer@example.com");
            invoiceState.recordPayment(new BigDecimal("1000.00"), LocalDate.now());
            invoiceState.archive();
        }

        @Test
        @DisplayName("Archived invoice is in final state")
        void archivedIsFinalState() {
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.ARCHIVED);
            assertThat(invoiceState.isEditable()).isFalse();
        }

        @Test
        @DisplayName("Archived invoice can be unarchived")
        void archivedCanBeUnarchived() {
            boolean result = invoiceState.unarchive();

            assertThat(result).isTrue();
            assertThat(invoiceState.getStatus()).isEqualTo(InvoiceStatus.PAID);
        }
    }

    @Nested
    @DisplayName("Invalid Transition Tests")
    class InvalidTransitionTests {

        @Test
        @DisplayName("Cannot skip from Draft directly to Sent")
        void cannotSkipFromDraftToSent() {
            invoiceState.setAmount(new BigDecimal("1000.00"));

            assertThatThrownBy(() -> invoiceState.send("customer@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be approved");
        }

        @Test
        @DisplayName("Cannot skip from Draft directly to Paid")
        void cannotSkipFromDraftToPaid() {
            invoiceState.setAmount(new BigDecimal("1000.00"));

            assertThatThrownBy(() -> invoiceState.recordPayment(new BigDecimal("1000.00"), LocalDate.now()))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    // Enums and helper classes for the test
    enum InvoiceStatus {
        DRAFT, APPROVED, SENT, PARTIALLY_PAID, PAID, VOIDED, ARCHIVED
    }

    static class InvoiceWorkflowState {
        private InvoiceStatus status = InvoiceStatus.DRAFT;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String approvedBy;
        private String sentTo;
        private String rejectionReason;
        private BigDecimal paidAmount = BigDecimal.ZERO;
        private boolean deleted = false;

        InvoiceStatus getStatus() { return status; }
        BigDecimal getAmount() { return amount; }
        String getApprovedBy() { return approvedBy; }
        String getSentTo() { return sentTo; }
        String getRejectionReason() { return rejectionReason; }
        BigDecimal getPaidAmount() { return paidAmount; }
        boolean isDeleted() { return deleted; }

        BigDecimal getBalanceDue() {
            if (amount == null) return BigDecimal.ZERO;
            return amount.subtract(paidAmount);
        }

        boolean isEditable() {
            return status == InvoiceStatus.DRAFT;
        }

        void setAmount(BigDecimal amount) {
            if (!isEditable()) {
                throw new IllegalStateException("Invoice is not editable in " + status + " status");
            }
            this.amount = amount;
        }

        void setDueDate(LocalDate dueDate) {
            if (!isEditable()) {
                throw new IllegalStateException("Invoice is not editable");
            }
            this.dueDate = dueDate;
        }

        boolean approve(String approver) {
            if (status != InvoiceStatus.DRAFT) {
                throw new IllegalStateException("Can only approve from Draft");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Invoice must have valid amount");
            }
            this.status = InvoiceStatus.APPROVED;
            this.approvedBy = approver;
            return true;
        }

        boolean reject(String reason, String rejector) {
            if (status != InvoiceStatus.APPROVED) {
                throw new IllegalStateException("Can only reject from Approved");
            }
            this.status = InvoiceStatus.DRAFT;
            this.rejectionReason = reason;
            this.approvedBy = null;
            return true;
        }

        boolean send(String email) {
            if (status != InvoiceStatus.APPROVED) {
                throw new IllegalStateException("Invoice must be approved before sending");
            }
            this.status = InvoiceStatus.SENT;
            this.sentTo = email;
            return true;
        }

        boolean resend(String email) {
            if (status != InvoiceStatus.SENT && status != InvoiceStatus.PARTIALLY_PAID) {
                throw new IllegalStateException("Can only resend sent invoices");
            }
            this.sentTo = email;
            return true;
        }

        boolean recordPayment(BigDecimal paymentAmount, LocalDate paymentDate) {
            if (status != InvoiceStatus.SENT && status != InvoiceStatus.PARTIALLY_PAID) {
                throw new IllegalStateException("Cannot record payment in " + status);
            }
            this.paidAmount = this.paidAmount.add(paymentAmount);
            if (this.paidAmount.compareTo(this.amount) >= 0) {
                this.status = InvoiceStatus.PAID;
            } else {
                this.status = InvoiceStatus.PARTIALLY_PAID;
            }
            return true;
        }

        boolean void_(String reason, String user) {
            if (status == InvoiceStatus.PAID || status == InvoiceStatus.ARCHIVED) {
                throw new IllegalStateException("Cannot void paid or archived invoice");
            }
            this.status = InvoiceStatus.VOIDED;
            return true;
        }

        boolean archive() {
            if (status != InvoiceStatus.PAID) {
                throw new IllegalStateException("Can only archive paid invoices");
            }
            this.status = InvoiceStatus.ARCHIVED;
            return true;
        }

        boolean unarchive() {
            if (status != InvoiceStatus.ARCHIVED) {
                throw new IllegalStateException("Can only unarchive archived invoices");
            }
            this.status = InvoiceStatus.PAID;
            return true;
        }

        boolean delete() {
            if (status != InvoiceStatus.DRAFT) {
                throw new IllegalStateException("Cannot delete invoice in " + status);
            }
            this.deleted = true;
            return true;
        }
    }
}
