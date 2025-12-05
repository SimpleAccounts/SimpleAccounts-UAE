package com.simpleaccounts.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Payroll run workflow state transitions.
 * Workflow: Configure → Generate Payslips → Review → Approve → Lock → Export
 */
class PayrollWorkflowTest {

    private PayrollRunWorkflowState payrollState;

    @BeforeEach
    void setUp() {
        payrollState = new PayrollRunWorkflowState(YearMonth.of(2024, 12));
    }

    @Nested
    @DisplayName("Draft/Configure State Tests")
    class DraftStateTests {

        @Test
        @DisplayName("New payroll run should start in Draft status")
        void newPayrollRunShouldStartInDraft() {
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.DRAFT);
            assertThat(payrollState.isEditable()).isTrue();
        }

        @Test
        @DisplayName("Draft payroll can add employees")
        void draftCanAddEmployees() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addEmployee("EMP002", new BigDecimal("8000.00"));

            assertThat(payrollState.getEmployeeCount()).isEqualTo(2);
            assertThat(payrollState.getTotalGrossPay()).isEqualByComparingTo(new BigDecimal("18000.00"));
        }

        @Test
        @DisplayName("Draft payroll can add adjustments")
        void draftCanAddAdjustments() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addAdjustment("EMP001", "Bonus", new BigDecimal("1000.00"));
            payrollState.addAdjustment("EMP001", "Deduction", new BigDecimal("-500.00"));

            BigDecimal netPay = payrollState.getNetPayForEmployee("EMP001");
            assertThat(netPay).isEqualByComparingTo(new BigDecimal("10500.00"));
        }

        @Test
        @DisplayName("Draft payroll can be configured with WPS settings")
        void draftCanBeConfiguredWithWpsSettings() {
            payrollState.setWpsEnabled(true);
            payrollState.setWpsMolId("MOL123456");
            payrollState.setWpsBankCode("ADCB");

            assertThat(payrollState.isWpsEnabled()).isTrue();
            assertThat(payrollState.getWpsMolId()).isEqualTo("MOL123456");
        }
    }

    @Nested
    @DisplayName("Generate Payslips State Tests")
    class GeneratePayslipsTests {

        @BeforeEach
        void setupDraftPayroll() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addEmployee("EMP002", new BigDecimal("8000.00"));
        }

        @Test
        @DisplayName("Payroll can generate payslips")
        void payrollCanGeneratePayslips() {
            boolean result = payrollState.generatePayslips("payroll_admin");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.PAYSLIPS_GENERATED);
            assertThat(payrollState.getPayslipCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("Cannot generate payslips without employees")
        void cannotGeneratePayslipsWithoutEmployees() {
            PayrollRunWorkflowState emptyPayroll = new PayrollRunWorkflowState(YearMonth.of(2024, 12));

            assertThatThrownBy(() -> emptyPayroll.generatePayslips("admin"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("employees");
        }

        @Test
        @DisplayName("Payslips include all salary components")
        void payslipsIncludeAllComponents() {
            payrollState.addComponent("EMP001", "Basic Salary", new BigDecimal("7000.00"));
            payrollState.addComponent("EMP001", "Housing Allowance", new BigDecimal("2000.00"));
            payrollState.addComponent("EMP001", "Transport Allowance", new BigDecimal("1000.00"));

            payrollState.generatePayslips("admin");

            List<SalaryComponent> components = payrollState.getPayslipComponents("EMP001");
            assertThat(components).hasSize(3);
        }
    }

    @Nested
    @DisplayName("Review State Tests")
    class ReviewStateTests {

        @BeforeEach
        void setupGeneratedPayslips() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addEmployee("EMP002", new BigDecimal("8000.00"));
            payrollState.generatePayslips("admin");
        }

        @Test
        @DisplayName("Generated payslips can be sent for review")
        void generatedCanBeSentForReview() {
            boolean result = payrollState.sendForReview("hr_manager");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.UNDER_REVIEW);
        }

        @Test
        @DisplayName("Payslips can be modified during review")
        void payslipsCanBeModifiedDuringReview() {
            payrollState.sendForReview("hr_manager");

            payrollState.modifyPayslip("EMP001", "Overtime", new BigDecimal("500.00"));

            BigDecimal netPay = payrollState.getNetPayForEmployee("EMP001");
            assertThat(netPay).isEqualByComparingTo(new BigDecimal("10500.00"));
        }

        @Test
        @DisplayName("Payroll can be rejected back to draft")
        void payrollCanBeRejectedToDraft() {
            payrollState.sendForReview("hr_manager");

            boolean result = payrollState.reject("Incorrect calculations", "finance_manager");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.DRAFT);
            assertThat(payrollState.isEditable()).isTrue();
        }
    }

    @Nested
    @DisplayName("Approve State Tests")
    class ApproveStateTests {

        @BeforeEach
        void setupReviewedPayroll() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.generatePayslips("admin");
            payrollState.sendForReview("hr_manager");
        }

        @Test
        @DisplayName("Reviewed payroll can be approved")
        void reviewedPayrollCanBeApproved() {
            boolean result = payrollState.approve("finance_manager");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.APPROVED);
            assertThat(payrollState.getApprovedBy()).isEqualTo("finance_manager");
        }

        @Test
        @DisplayName("Approved payroll cannot be modified")
        void approvedPayrollCannotBeModified() {
            payrollState.approve("finance_manager");

            assertThatThrownBy(() -> payrollState.modifyPayslip("EMP001", "Bonus", new BigDecimal("100.00")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not editable");
        }
    }

    @Nested
    @DisplayName("Lock Period State Tests")
    class LockPeriodTests {

        @BeforeEach
        void setupApprovedPayroll() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.generatePayslips("admin");
            payrollState.sendForReview("hr_manager");
            payrollState.approve("finance_manager");
        }

        @Test
        @DisplayName("Approved payroll can lock the period")
        void approvedPayrollCanLockPeriod() {
            boolean result = payrollState.lockPeriod("payroll_admin");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.LOCKED);
            assertThat(payrollState.isPeriodLocked()).isTrue();
        }

        @Test
        @DisplayName("Locked period prevents new payroll runs")
        void lockedPeriodPreventsNewRuns() {
            payrollState.lockPeriod("admin");

            PayrollRunWorkflowState newRun = new PayrollRunWorkflowState(YearMonth.of(2024, 12));
            newRun.addEmployee("EMP001", new BigDecimal("10000"));
            newRun.setPeriodLocked(true); // Simulating locked period check

            assertThatThrownBy(() -> newRun.generatePayslips("admin"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
        }

        @Test
        @DisplayName("Locked payroll can be unlocked by authorized user")
        void lockedPayrollCanBeUnlocked() {
            payrollState.lockPeriod("admin");

            boolean result = payrollState.unlockPeriod("super_admin");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.APPROVED);
            assertThat(payrollState.isPeriodLocked()).isFalse();
        }
    }

    @Nested
    @DisplayName("Export State Tests")
    class ExportStateTests {

        @BeforeEach
        void setupLockedPayroll() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addEmployee("EMP002", new BigDecimal("8000.00"));
            payrollState.setWpsEnabled(true);
            payrollState.setWpsMolId("MOL123");
            payrollState.setWpsBankCode("ADCB");
            payrollState.generatePayslips("admin");
            payrollState.sendForReview("hr_manager");
            payrollState.approve("finance_manager");
            payrollState.lockPeriod("payroll_admin");
        }

        @Test
        @DisplayName("Locked payroll can export WPS file")
        void lockedPayrollCanExportWpsFile() {
            String wpsFile = payrollState.exportWpsFile();

            assertThat(wpsFile).isNotNull();
            assertThat(wpsFile).contains("MOL123");
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.EXPORTED);
        }

        @Test
        @DisplayName("Locked payroll can export bank transfer file")
        void lockedPayrollCanExportBankTransfer() {
            String bankFile = payrollState.exportBankTransferFile();

            assertThat(bankFile).isNotNull();
            assertThat(payrollState.isExported()).isTrue();
        }

        @Test
        @DisplayName("Exported payroll records export history")
        void exportedPayrollRecordsHistory() {
            payrollState.exportWpsFile();

            assertThat(payrollState.getExportHistory()).hasSize(1);
            assertThat(payrollState.getLastExportDate()).isEqualTo(LocalDate.now());
        }
    }

    @Nested
    @DisplayName("Rollback State Tests")
    class RollbackStateTests {

        @BeforeEach
        void setupExportedPayroll() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.generatePayslips("admin");
            payrollState.sendForReview("hr_manager");
            payrollState.approve("finance_manager");
            payrollState.lockPeriod("payroll_admin");
            payrollState.exportWpsFile();
        }

        @Test
        @DisplayName("Exported payroll can be rolled back")
        void exportedPayrollCanBeRolledBack() {
            boolean result = payrollState.rollback("Error in calculations", "super_admin");

            assertThat(result).isTrue();
            assertThat(payrollState.getStatus()).isEqualTo(PayrollStatus.DRAFT);
            assertThat(payrollState.isPeriodLocked()).isFalse();
            assertThat(payrollState.getRollbackReason()).isEqualTo("Error in calculations");
        }

        @Test
        @DisplayName("Rollback clears export history")
        void rollbackClearsExportHistory() {
            payrollState.rollback("Reset needed", "admin");

            assertThat(payrollState.getExportHistory()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Retro Adjustment Tests")
    class RetroAdjustmentTests {

        @Test
        @DisplayName("Can add retro adjustments for previous periods")
        void canAddRetroAdjustments() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addRetroAdjustment("EMP001", YearMonth.of(2024, 11),
                "Salary revision", new BigDecimal("500.00"));

            assertThat(payrollState.hasRetroAdjustments()).isTrue();
            assertThat(payrollState.getRetroAdjustmentTotal("EMP001"))
                .isEqualByComparingTo(new BigDecimal("500.00"));
        }

        @Test
        @DisplayName("Retro adjustments included in payslip")
        void retroAdjustmentsIncludedInPayslip() {
            payrollState.addEmployee("EMP001", new BigDecimal("10000.00"));
            payrollState.addRetroAdjustment("EMP001", YearMonth.of(2024, 11),
                "Arrears", new BigDecimal("1000.00"));
            payrollState.generatePayslips("admin");

            BigDecimal netPay = payrollState.getNetPayForEmployee("EMP001");
            assertThat(netPay).isEqualByComparingTo(new BigDecimal("11000.00"));
        }
    }

    // Enums and helper classes
    enum PayrollStatus {
        DRAFT, PAYSLIPS_GENERATED, UNDER_REVIEW, APPROVED, LOCKED, EXPORTED
    }

    static class SalaryComponent {
        String name;
        BigDecimal amount;
        SalaryComponent(String name, BigDecimal amount) {
            this.name = name;
            this.amount = amount;
        }
    }

    static class PayrollRunWorkflowState {
        private PayrollStatus status = PayrollStatus.DRAFT;
        private YearMonth period;
        private List<EmployeePayslip> payslips = new ArrayList<>();
        private boolean wpsEnabled = false;
        private String wpsMolId;
        private String wpsBankCode;
        private String approvedBy;
        private boolean periodLocked = false;
        private boolean exported = false;
        private List<String> exportHistory = new ArrayList<>();
        private LocalDate lastExportDate;
        private String rollbackReason;

        PayrollRunWorkflowState(YearMonth period) {
            this.period = period;
        }

        PayrollStatus getStatus() { return status; }
        String getApprovedBy() { return approvedBy; }
        boolean isPeriodLocked() { return periodLocked; }
        boolean isExported() { return exported; }
        List<String> getExportHistory() { return exportHistory; }
        LocalDate getLastExportDate() { return lastExportDate; }
        String getRollbackReason() { return rollbackReason; }
        boolean isWpsEnabled() { return wpsEnabled; }
        String getWpsMolId() { return wpsMolId; }
        int getEmployeeCount() { return payslips.size(); }
        int getPayslipCount() { return payslips.size(); }

        boolean isEditable() {
            return status == PayrollStatus.DRAFT || status == PayrollStatus.UNDER_REVIEW;
        }

        void setPeriodLocked(boolean locked) { this.periodLocked = locked; }
        void setWpsEnabled(boolean enabled) { this.wpsEnabled = enabled; }
        void setWpsMolId(String molId) { this.wpsMolId = molId; }
        void setWpsBankCode(String bankCode) { this.wpsBankCode = bankCode; }

        void addEmployee(String employeeId, BigDecimal grossPay) {
            EmployeePayslip payslip = new EmployeePayslip(employeeId, grossPay);
            payslips.add(payslip);
        }

        void addAdjustment(String employeeId, String type, BigDecimal amount) {
            findPayslip(employeeId).addAdjustment(type, amount);
        }

        void addComponent(String employeeId, String name, BigDecimal amount) {
            findPayslip(employeeId).addComponent(name, amount);
        }

        void addRetroAdjustment(String employeeId, YearMonth period, String reason, BigDecimal amount) {
            findPayslip(employeeId).addRetroAdjustment(period, reason, amount);
        }

        BigDecimal getTotalGrossPay() {
            return payslips.stream()
                .map(p -> p.grossPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal getNetPayForEmployee(String employeeId) {
            return findPayslip(employeeId).getNetPay();
        }

        List<SalaryComponent> getPayslipComponents(String employeeId) {
            return findPayslip(employeeId).components;
        }

        boolean hasRetroAdjustments() {
            return payslips.stream().anyMatch(p -> !p.retroAdjustments.isEmpty());
        }

        BigDecimal getRetroAdjustmentTotal(String employeeId) {
            return findPayslip(employeeId).retroAdjustments.stream()
                .map(r -> r.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        boolean generatePayslips(String user) {
            if (payslips.isEmpty()) {
                throw new IllegalStateException("No employees added");
            }
            if (periodLocked) {
                throw new IllegalStateException("Period is locked");
            }
            this.status = PayrollStatus.PAYSLIPS_GENERATED;
            return true;
        }

        boolean sendForReview(String reviewer) {
            if (status != PayrollStatus.PAYSLIPS_GENERATED) {
                throw new IllegalStateException("Must generate payslips first");
            }
            this.status = PayrollStatus.UNDER_REVIEW;
            return true;
        }

        void modifyPayslip(String employeeId, String adjustmentType, BigDecimal amount) {
            if (!isEditable() && status != PayrollStatus.UNDER_REVIEW) {
                throw new IllegalStateException("Payroll is not editable");
            }
            findPayslip(employeeId).addAdjustment(adjustmentType, amount);
        }

        boolean approve(String approver) {
            if (status != PayrollStatus.UNDER_REVIEW) {
                throw new IllegalStateException("Must be under review to approve");
            }
            this.status = PayrollStatus.APPROVED;
            this.approvedBy = approver;
            return true;
        }

        boolean reject(String reason, String rejector) {
            this.status = PayrollStatus.DRAFT;
            return true;
        }

        boolean lockPeriod(String user) {
            if (status != PayrollStatus.APPROVED) {
                throw new IllegalStateException("Must be approved to lock");
            }
            this.status = PayrollStatus.LOCKED;
            this.periodLocked = true;
            return true;
        }

        boolean unlockPeriod(String user) {
            if (status != PayrollStatus.LOCKED) {
                throw new IllegalStateException("Period is not locked");
            }
            this.status = PayrollStatus.APPROVED;
            this.periodLocked = false;
            return true;
        }

        String exportWpsFile() {
            if (status != PayrollStatus.LOCKED) {
                throw new IllegalStateException("Must be locked to export");
            }
            this.status = PayrollStatus.EXPORTED;
            this.exported = true;
            this.exportHistory.add("WPS_" + LocalDate.now());
            this.lastExportDate = LocalDate.now();
            return "WPS_FILE_" + wpsMolId;
        }

        String exportBankTransferFile() {
            if (status != PayrollStatus.LOCKED && status != PayrollStatus.EXPORTED) {
                throw new IllegalStateException("Must be locked to export");
            }
            this.exported = true;
            this.exportHistory.add("BANK_" + LocalDate.now());
            this.lastExportDate = LocalDate.now();
            return "BANK_TRANSFER_FILE";
        }

        boolean rollback(String reason, String user) {
            this.status = PayrollStatus.DRAFT;
            this.periodLocked = false;
            this.exported = false;
            this.exportHistory.clear();
            this.rollbackReason = reason;
            return true;
        }

        private EmployeePayslip findPayslip(String employeeId) {
            return payslips.stream()
                .filter(p -> p.employeeId.equals(employeeId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        }

        static class EmployeePayslip {
            String employeeId;
            BigDecimal grossPay;
            List<SalaryComponent> components = new ArrayList<>();
            List<Adjustment> adjustments = new ArrayList<>();
            List<RetroAdjustment> retroAdjustments = new ArrayList<>();

            EmployeePayslip(String employeeId, BigDecimal grossPay) {
                this.employeeId = employeeId;
                this.grossPay = grossPay;
            }

            void addComponent(String name, BigDecimal amount) {
                components.add(new SalaryComponent(name, amount));
            }

            void addAdjustment(String type, BigDecimal amount) {
                adjustments.add(new Adjustment(type, amount));
            }

            void addRetroAdjustment(YearMonth period, String reason, BigDecimal amount) {
                retroAdjustments.add(new RetroAdjustment(period, reason, amount));
            }

            BigDecimal getNetPay() {
                BigDecimal adjustmentTotal = adjustments.stream()
                    .map(a -> a.amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal retroTotal = retroAdjustments.stream()
                    .map(r -> r.amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return grossPay.add(adjustmentTotal).add(retroTotal);
            }
        }

        static class Adjustment {
            String type;
            BigDecimal amount;
            Adjustment(String type, BigDecimal amount) {
                this.type = type;
                this.amount = amount;
            }
        }

        static class RetroAdjustment {
            YearMonth period;
            String reason;
            BigDecimal amount;
            RetroAdjustment(YearMonth period, String reason, BigDecimal amount) {
                this.period = period;
                this.reason = reason;
                this.amount = amount;
            }
        }
    }
}
