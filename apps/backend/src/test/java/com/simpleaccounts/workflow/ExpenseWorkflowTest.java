package com.simpleaccounts.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Expense reimbursement workflow state transitions.
 * Workflow: Submit → Review → Audit → Approve → Post to GL → Reimburse
 */
class ExpenseWorkflowTest {

    private ExpenseWorkflowState expenseState;

    @BeforeEach
    void setUp() {
        expenseState = new ExpenseWorkflowState();
    }

    @Nested
    @DisplayName("Draft/Submit State Tests")
    class DraftStateTests {

        @Test
        @DisplayName("New expense should start in Draft status")
        void newExpenseShouldStartInDraft() {
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.DRAFT);
            assertThat(expenseState.isEditable()).isTrue();
        }

        @Test
        @DisplayName("Draft expense can be edited")
        void draftExpenseCanBeEdited() {
            expenseState.setAmount(new BigDecimal("100.00"));
            expenseState.setCategory("Travel");
            expenseState.setDescription("Flight to Dubai");

            assertThat(expenseState.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(expenseState.getCategory()).isEqualTo("Travel");
        }

        @Test
        @DisplayName("Draft expense can be submitted with receipt")
        void draftCanBeSubmittedWithReceipt() {
            expenseState.setAmount(new BigDecimal("250.00"));
            expenseState.setCategory("Meals");
            expenseState.addReceipt("receipt-001.pdf");

            boolean result = expenseState.submit("employee1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.SUBMITTED);
            assertThat(expenseState.getSubmittedBy()).isEqualTo("employee1");
        }

        @Test
        @DisplayName("Draft expense cannot be submitted without receipt")
        void draftCannotBeSubmittedWithoutReceipt() {
            expenseState.setAmount(new BigDecimal("100.00"));
            expenseState.setCategory("Travel");

            assertThatThrownBy(() -> expenseState.submit("employee1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Receipt");
        }

        @Test
        @DisplayName("Draft expense cannot be submitted without amount")
        void draftCannotBeSubmittedWithoutAmount() {
            expenseState.addReceipt("receipt.pdf");

            assertThatThrownBy(() -> expenseState.submit("employee1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("amount");
        }
    }

    @Nested
    @DisplayName("Submitted/Review State Tests")
    class SubmittedStateTests {

        @BeforeEach
        void setupSubmittedExpense() {
            expenseState.setAmount(new BigDecimal("500.00"));
            expenseState.setCategory("Travel");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
        }

        @Test
        @DisplayName("Submitted expense can be sent to review")
        void submittedCanBeSentToReview() {
            boolean result = expenseState.sendToReview("manager1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.UNDER_REVIEW);
            assertThat(expenseState.getReviewedBy()).isEqualTo("manager1");
        }

        @Test
        @DisplayName("Submitted expense can be rejected back to draft")
        void submittedCanBeRejectedToDraft() {
            boolean result = expenseState.reject("Missing details", "manager1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.DRAFT);
            assertThat(expenseState.getRejectionReason()).isEqualTo("Missing details");
            assertThat(expenseState.isEditable()).isTrue();
        }

        @Test
        @DisplayName("Submitted expense cannot be edited")
        void submittedExpenseCannotBeEdited() {
            assertThat(expenseState.isEditable()).isFalse();

            assertThatThrownBy(() -> expenseState.setAmount(new BigDecimal("600.00")))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Under Review State Tests")
    class UnderReviewStateTests {

        @BeforeEach
        void setupUnderReviewExpense() {
            expenseState.setAmount(new BigDecimal("500.00"));
            expenseState.setCategory("Travel");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
        }

        @Test
        @DisplayName("Reviewed expense can be sent to audit")
        void reviewedCanBeSentToAudit() {
            boolean result = expenseState.sendToAudit("auditor1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.AUDIT);
        }

        @Test
        @DisplayName("Reviewed expense can be approved directly for small amounts")
        void reviewedCanBeApprovedDirectlyForSmallAmounts() {
            expenseState = new ExpenseWorkflowState();
            expenseState.setAmount(new BigDecimal("50.00")); // Below audit threshold
            expenseState.setCategory("Office Supplies");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");

            boolean result = expenseState.approve("manager1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.APPROVED);
        }

        @Test
        @DisplayName("Reviewed expense can be rejected")
        void reviewedCanBeRejected() {
            boolean result = expenseState.reject("Non-compliant expense", "manager1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.DRAFT);
        }
    }

    @Nested
    @DisplayName("Audit State Tests")
    class AuditStateTests {

        @BeforeEach
        void setupAuditExpense() {
            expenseState.setAmount(new BigDecimal("2000.00")); // Above audit threshold
            expenseState.setCategory("Equipment");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
            expenseState.sendToAudit("auditor1");
        }

        @Test
        @DisplayName("Audited expense can be approved")
        void auditedCanBeApproved() {
            boolean result = expenseState.approve("finance1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.APPROVED);
            assertThat(expenseState.getApprovedBy()).isEqualTo("finance1");
        }

        @Test
        @DisplayName("Audited expense can be flagged for policy violation")
        void auditedCanBeFlaggedForPolicyViolation() {
            boolean result = expenseState.flagPolicyViolation("Exceeds daily limit", "auditor1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.POLICY_VIOLATION);
            assertThat(expenseState.getPolicyViolationReason()).isEqualTo("Exceeds daily limit");
        }

        @Test
        @DisplayName("Audited expense can be rejected")
        void auditedCanBeRejected() {
            boolean result = expenseState.reject("Invalid receipt", "auditor1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.DRAFT);
        }
    }

    @Nested
    @DisplayName("Approved State Tests")
    class ApprovedStateTests {

        @BeforeEach
        void setupApprovedExpense() {
            expenseState.setAmount(new BigDecimal("500.00"));
            expenseState.setCategory("Travel");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
            expenseState.approve("manager1");
        }

        @Test
        @DisplayName("Approved expense can be posted to GL")
        void approvedCanBePostedToGL() {
            boolean result = expenseState.postToGL("JE-2024-001", "accountant1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.POSTED);
            assertThat(expenseState.getJournalEntryId()).isEqualTo("JE-2024-001");
        }

        @Test
        @DisplayName("Approved expense is immutable")
        void approvedExpenseIsImmutable() {
            assertThat(expenseState.isEditable()).isFalse();
        }
    }

    @Nested
    @DisplayName("Posted State Tests")
    class PostedStateTests {

        @BeforeEach
        void setupPostedExpense() {
            expenseState.setAmount(new BigDecimal("500.00"));
            expenseState.setCategory("Travel");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
            expenseState.approve("manager1");
            expenseState.postToGL("JE-2024-001", "accountant1");
        }

        @Test
        @DisplayName("Posted expense can be reimbursed")
        void postedCanBeReimbursed() {
            boolean result = expenseState.reimburse("PAY-2024-001", LocalDate.now(), "payroll1");

            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.REIMBURSED);
            assertThat(expenseState.getPaymentReference()).isEqualTo("PAY-2024-001");
        }

        @Test
        @DisplayName("Posted expense cannot be edited")
        void postedExpenseCannotBeEdited() {
            assertThat(expenseState.isEditable()).isFalse();
        }
    }

    @Nested
    @DisplayName("Reimbursed State Tests")
    class ReimbursedStateTests {

        @BeforeEach
        void setupReimbursedExpense() {
            expenseState.setAmount(new BigDecimal("500.00"));
            expenseState.setCategory("Travel");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
            expenseState.approve("manager1");
            expenseState.postToGL("JE-2024-001", "accountant1");
            expenseState.reimburse("PAY-2024-001", LocalDate.now(), "payroll1");
        }

        @Test
        @DisplayName("Reimbursed expense is in final state")
        void reimbursedIsFinalState() {
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.REIMBURSED);
            assertThat(expenseState.isEditable()).isFalse();
        }

        @Test
        @DisplayName("Reimbursed expense cannot transition to other states")
        void reimbursedCannotTransition() {
            assertThatThrownBy(() -> expenseState.approve("someone"))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Multi-Level Approval Tests")
    class MultiLevelApprovalTests {

        @Test
        @DisplayName("High value expense requires multiple approvals")
        void highValueExpenseRequiresMultipleApprovals() {
            expenseState.setAmount(new BigDecimal("10000.00")); // High value
            expenseState.setCategory("Equipment");
            expenseState.addReceipt("receipt.pdf");
            expenseState.submit("employee1");
            expenseState.sendToReview("manager1");
            expenseState.sendToAudit("auditor1");

            // First level approval
            expenseState.addApproval("manager1", 1);
            assertThat(expenseState.getApprovalCount()).isEqualTo(1);
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.AUDIT);

            // Second level approval
            expenseState.addApproval("director1", 2);
            assertThat(expenseState.getApprovalCount()).isEqualTo(2);

            // Final approval
            boolean result = expenseState.approve("cfo1");
            assertThat(result).isTrue();
            assertThat(expenseState.getStatus()).isEqualTo(ExpenseStatus.APPROVED);
        }
    }

    // Enums and helper classes
    enum ExpenseStatus {
        DRAFT, SUBMITTED, UNDER_REVIEW, AUDIT, POLICY_VIOLATION, APPROVED, POSTED, REIMBURSED
    }

    static class ExpenseWorkflowState {
        private ExpenseStatus status = ExpenseStatus.DRAFT;
        private BigDecimal amount;
        private String category;
        private String description;
        private List<String> receipts = new ArrayList<>();
        private String submittedBy;
        private String reviewedBy;
        private String approvedBy;
        private String rejectionReason;
        private String policyViolationReason;
        private String journalEntryId;
        private String paymentReference;
        private LocalDate paymentDate;
        private List<Approval> approvals = new ArrayList<>();

        ExpenseStatus getStatus() { return status; }
        BigDecimal getAmount() { return amount; }
        String getCategory() { return category; }
        String getSubmittedBy() { return submittedBy; }
        String getReviewedBy() { return reviewedBy; }
        String getApprovedBy() { return approvedBy; }
        String getRejectionReason() { return rejectionReason; }
        String getPolicyViolationReason() { return policyViolationReason; }
        String getJournalEntryId() { return journalEntryId; }
        String getPaymentReference() { return paymentReference; }
        int getApprovalCount() { return approvals.size(); }

        boolean isEditable() {
            return status == ExpenseStatus.DRAFT;
        }

        void setAmount(BigDecimal amount) {
            if (!isEditable()) {
                throw new IllegalStateException("Expense is not editable");
            }
            this.amount = amount;
        }

        void setCategory(String category) {
            if (!isEditable()) {
                throw new IllegalStateException("Expense is not editable");
            }
            this.category = category;
        }

        void setDescription(String description) {
            if (!isEditable()) {
                throw new IllegalStateException("Expense is not editable");
            }
            this.description = description;
        }

        void addReceipt(String receiptPath) {
            this.receipts.add(receiptPath);
        }

        boolean submit(String submitter) {
            if (status != ExpenseStatus.DRAFT) {
                throw new IllegalStateException("Can only submit from Draft");
            }
            if (receipts.isEmpty()) {
                throw new IllegalStateException("Receipt is required");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Valid amount is required");
            }
            this.status = ExpenseStatus.SUBMITTED;
            this.submittedBy = submitter;
            return true;
        }

        boolean sendToReview(String reviewer) {
            if (status != ExpenseStatus.SUBMITTED) {
                throw new IllegalStateException("Can only review submitted expenses");
            }
            this.status = ExpenseStatus.UNDER_REVIEW;
            this.reviewedBy = reviewer;
            return true;
        }

        boolean sendToAudit(String auditor) {
            if (status != ExpenseStatus.UNDER_REVIEW) {
                throw new IllegalStateException("Can only audit reviewed expenses");
            }
            this.status = ExpenseStatus.AUDIT;
            return true;
        }

        boolean approve(String approver) {
            if (status != ExpenseStatus.UNDER_REVIEW && status != ExpenseStatus.AUDIT) {
                throw new IllegalStateException("Cannot approve in " + status);
            }
            this.status = ExpenseStatus.APPROVED;
            this.approvedBy = approver;
            return true;
        }

        void addApproval(String approver, int level) {
            approvals.add(new Approval(approver, level));
        }

        boolean reject(String reason, String rejector) {
            if (status == ExpenseStatus.DRAFT || status == ExpenseStatus.REIMBURSED) {
                throw new IllegalStateException("Cannot reject in " + status);
            }
            this.status = ExpenseStatus.DRAFT;
            this.rejectionReason = reason;
            return true;
        }

        boolean flagPolicyViolation(String reason, String auditor) {
            if (status != ExpenseStatus.AUDIT) {
                throw new IllegalStateException("Can only flag during audit");
            }
            this.status = ExpenseStatus.POLICY_VIOLATION;
            this.policyViolationReason = reason;
            return true;
        }

        boolean postToGL(String journalEntryId, String accountant) {
            if (status != ExpenseStatus.APPROVED) {
                throw new IllegalStateException("Can only post approved expenses");
            }
            this.status = ExpenseStatus.POSTED;
            this.journalEntryId = journalEntryId;
            return true;
        }

        boolean reimburse(String paymentRef, LocalDate paymentDate, String processor) {
            if (status != ExpenseStatus.POSTED) {
                throw new IllegalStateException("Can only reimburse posted expenses");
            }
            this.status = ExpenseStatus.REIMBURSED;
            this.paymentReference = paymentRef;
            this.paymentDate = paymentDate;
            return true;
        }

        static class Approval {
            String approver;
            int level;
            Approval(String approver, int level) {
                this.approver = approver;
                this.level = level;
            }
        }
    }
}
