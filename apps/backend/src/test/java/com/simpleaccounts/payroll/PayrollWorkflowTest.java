package com.simpleaccounts.payroll;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests for Payroll Workflow including:
 * - Payroll run lifecycle
 * - Payslip calculations
 * - WPS file generation
 * - Approvals and locking
 */
@DisplayName("Payroll Workflow Tests")
class PayrollWorkflowTest {

    private PayrollService payrollService;
    private WpsFileGenerator wpsGenerator;

    @BeforeEach
    void setUp() {
        payrollService = new PayrollService();
        wpsGenerator = new WpsFileGenerator();
    }

    @Nested
    @DisplayName("Payroll Run Lifecycle Tests")
    class PayrollRunLifecycleTests {

        @Test
        @DisplayName("Should create payroll run for period")
        void shouldCreatePayrollRunForPeriod() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");

            assertThat(run.getId()).isNotNull();
            assertThat(run.getPeriod()).isEqualTo(period);
            assertThat(run.getStatus()).isEqualTo(PayrollStatus.DRAFT);
            assertThat(run.getCreatedBy()).isEqualTo("user-1");
        }

        @Test
        @DisplayName("Should prevent duplicate payroll run for same period")
        void shouldPreventDuplicatePayrollRun() {
            YearMonth period = YearMonth.of(2024, 12);
            payrollService.createPayrollRun(period, "user-1");

            assertThatThrownBy(() -> payrollService.createPayrollRun(period, "user-2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("Should calculate payslips for all employees")
        void shouldCalculatePayslipsForAllEmployees() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");

            payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
            payrollService.addEmployee(run.getId(), createEmployee("EMP-002", new BigDecimal("15000")));

            payrollService.calculatePayslips(run.getId());

            List<Payslip> payslips = payrollService.getPayslips(run.getId());
            assertThat(payslips).hasSize(2);
        }

        @Test
        @DisplayName("Should transition run through approval workflow")
        void shouldTransitionThroughApprovalWorkflow() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");
            payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
            payrollService.calculatePayslips(run.getId());

            // Submit for approval
            payrollService.submitForApproval(run.getId(), "user-1");
            assertThat(payrollService.getPayrollRun(run.getId()).getStatus())
                .isEqualTo(PayrollStatus.PENDING_APPROVAL);

            // Approve
            payrollService.approve(run.getId(), "manager-1");
            assertThat(payrollService.getPayrollRun(run.getId()).getStatus())
                .isEqualTo(PayrollStatus.APPROVED);

            // Post to ledger
            payrollService.postToLedger(run.getId(), "user-1");
            assertThat(payrollService.getPayrollRun(run.getId()).getStatus())
                .isEqualTo(PayrollStatus.POSTED);
        }

        @Test
        @DisplayName("Should lock period after posting")
        void shouldLockPeriodAfterPosting() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");
            payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
            payrollService.calculatePayslips(run.getId());
            payrollService.submitForApproval(run.getId(), "user-1");
            payrollService.approve(run.getId(), "manager-1");
            payrollService.postToLedger(run.getId(), "user-1");

            assertThat(payrollService.isPeriodLocked(period)).isTrue();

            // Cannot create new run for locked period
            assertThatThrownBy(() -> payrollService.createPayrollRun(period, "user-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
        }
    }

    @Nested
    @DisplayName("Payslip Calculation Tests")
    class PayslipCalculationTests {

        @Test
        @DisplayName("Should calculate basic salary correctly")
        void shouldCalculateBasicSalary() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            assertThat(payslip.getBasicSalary()).isEqualByComparingTo(new BigDecimal("10000"));
        }

        @Test
        @DisplayName("Should calculate housing allowance")
        void shouldCalculateHousingAllowance() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setHousingAllowancePercent(new BigDecimal("25"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            assertThat(payslip.getHousingAllowance()).isEqualByComparingTo(new BigDecimal("2500"));
        }

        @Test
        @DisplayName("Should calculate transport allowance")
        void shouldCalculateTransportAllowance() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setTransportAllowance(new BigDecimal("500"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            assertThat(payslip.getTransportAllowance()).isEqualByComparingTo(new BigDecimal("500"));
        }

        @Test
        @DisplayName("Should calculate overtime pay")
        void shouldCalculateOvertimePay() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setOvertimeHours(new BigDecimal("10"));
            emp.setOvertimeRate(new BigDecimal("1.5"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            // Hourly rate = 10000 / 22 days / 8 hours = 56.82
            // OT pay = 56.82 * 1.5 * 10 = 852.27
            assertThat(payslip.getOvertimePay()).isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should apply deductions correctly")
        void shouldApplyDeductionsCorrectly() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.addDeduction("LOAN", new BigDecimal("500"));
            emp.addDeduction("INSURANCE", new BigDecimal("200"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            assertThat(payslip.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("700"));
        }

        @Test
        @DisplayName("Should calculate net pay correctly")
        void shouldCalculateNetPayCorrectly() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setHousingAllowancePercent(new BigDecimal("25")); // 2500
            emp.setTransportAllowance(new BigDecimal("500"));
            emp.addDeduction("LOAN", new BigDecimal("1000"));
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            // Gross = 10000 + 2500 + 500 = 13000
            // Net = 13000 - 1000 = 12000
            assertThat(payslip.getGrossPay()).isEqualByComparingTo(new BigDecimal("13000"));
            assertThat(payslip.getNetPay()).isEqualByComparingTo(new BigDecimal("12000"));
        }

        @Test
        @DisplayName("Should handle partial month (pro-rata)")
        void shouldHandlePartialMonth() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setJoiningDate(LocalDate.of(2024, 12, 15)); // Mid-month join
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            // Should get roughly half salary
            assertThat(payslip.getBasicSalary()).isLessThan(new BigDecimal("10000"));
            assertThat(payslip.getWorkingDays()).isLessThan(22);
        }

        @Test
        @DisplayName("Should handle unpaid leave")
        void shouldHandleUnpaidLeave() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setUnpaidLeaveDays(5);
            Payslip payslip = payrollService.calculatePayslip(emp, YearMonth.of(2024, 12));

            // Deduction for 5 days = 10000/22 * 5 = 2272.73
            assertThat(payslip.getLeaveDeduction()).isGreaterThan(new BigDecimal("2000"));
            assertThat(payslip.getNetPay()).isLessThan(new BigDecimal("10000"));
        }
    }

    @Nested
    @DisplayName("UAE Gratuity Tests")
    class GratuityTests {

        @Test
        @DisplayName("Should calculate gratuity for less than 1 year (no gratuity)")
        void shouldCalculateGratuityLessThanOneYear() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setJoiningDate(LocalDate.now().minusMonths(6));

            BigDecimal gratuity = payrollService.calculateGratuity(emp, LocalDate.now());

            assertThat(gratuity).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should calculate gratuity for 1-5 years (21 days per year)")
        void shouldCalculateGratuityOneToFiveYears() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setJoiningDate(LocalDate.now().minusYears(3));

            BigDecimal gratuity = payrollService.calculateGratuity(emp, LocalDate.now());

            // 3 years * 21 days * (10000/30) = 21000
            assertThat(gratuity).isEqualByComparingTo(new BigDecimal("21000.00"));
        }

        @Test
        @DisplayName("Should calculate gratuity for more than 5 years (30 days after 5th year)")
        void shouldCalculateGratuityMoreThanFiveYears() {
            Employee emp = createEmployee("EMP-001", new BigDecimal("10000"));
            emp.setJoiningDate(LocalDate.now().minusYears(7));

            BigDecimal gratuity = payrollService.calculateGratuity(emp, LocalDate.now());

            // First 5 years: 5 * 21 * (10000/30) = 35000
            // Next 2 years: 2 * 30 * (10000/30) = 20000
            // Total = 55000
            assertThat(gratuity).isEqualByComparingTo(new BigDecimal("55000.00"));
        }
    }

    @Nested
    @DisplayName("WPS File Generation Tests")
    class WpsFileGenerationTests {

        @Test
        @DisplayName("Should generate valid WPS file format")
        void shouldGenerateValidWpsFileFormat() {
            PayrollRun run = createCompletedPayrollRun();

            WpsFile wpsFile = wpsGenerator.generate(run);

            assertThat(wpsFile).isNotNull();
            assertThat(wpsFile.getFileName()).matches("WPS_\\d{8}_\\d{6}\\.SIF");
            assertThat(wpsFile.getRecordCount()).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should include header record with employer details")
        void shouldIncludeHeaderRecord() {
            PayrollRun run = createCompletedPayrollRun();
            run.setEmployerMolId("MOL123456");
            run.setRoutingCode("ADCBAEAA");

            WpsFile wpsFile = wpsGenerator.generate(run);
            WpsRecord header = wpsFile.getHeaderRecord();

            assertThat(header.getRecordType()).isEqualTo("EDR");
            assertThat(header.getEmployerMolId()).isEqualTo("MOL123456");
            assertThat(header.getRoutingCode()).isEqualTo("ADCBAEAA");
        }

        @Test
        @DisplayName("Should include employee salary records")
        void shouldIncludeEmployeeSalaryRecords() {
            PayrollRun run = createCompletedPayrollRun();

            WpsFile wpsFile = wpsGenerator.generate(run);
            List<WpsRecord> salaryRecords = wpsFile.getSalaryRecords();

            assertThat(salaryRecords).isNotEmpty();
            for (WpsRecord wpsRecord : salaryRecords) {
                assertThat(wpsRecord.getRecordType()).isEqualTo("SDR");
                assertThat(wpsRecord.getEmployeeLabourId()).isNotNull();
                assertThat(wpsRecord.getSalaryAmount()).isGreaterThan(BigDecimal.ZERO);
            }
        }

        @Test
        @DisplayName("Should validate employee bank details")
        void shouldValidateEmployeeBankDetails() {
            PayrollRun run = createCompletedPayrollRun();
            Employee empNoBankDetails = createEmployee("EMP-999", new BigDecimal("5000"));
            empNoBankDetails.setBankIban(null);

            assertThatThrownBy(() -> {
                payrollService.addEmployee(run.getId(), empNoBankDetails);
                wpsGenerator.generate(run);
            }).isInstanceOf(IllegalStateException.class)
             .hasMessageContaining("bank");
        }

        @Test
        @DisplayName("Should generate control totals in footer")
        void shouldGenerateControlTotals() {
            PayrollRun run = createCompletedPayrollRun();

            WpsFile wpsFile = wpsGenerator.generate(run);
            WpsRecord footer = wpsFile.getFooterRecord();

            assertThat(footer.getRecordType()).isEqualTo("SCR");
            assertThat(footer.getTotalRecords()).isEqualTo(wpsFile.getSalaryRecords().size());
            assertThat(footer.getTotalAmount()).isGreaterThan(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("Rollback Tests")
    class RollbackTests {

        @Test
        @DisplayName("Should allow rollback of approved run before posting")
        void shouldAllowRollbackBeforePosting() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");
            payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
            payrollService.calculatePayslips(run.getId());
            payrollService.submitForApproval(run.getId(), "user-1");
            payrollService.approve(run.getId(), "manager-1");

            payrollService.rollback(run.getId(), "admin-1", "Correction needed");

            assertThat(payrollService.getPayrollRun(run.getId()).getStatus())
                .isEqualTo(PayrollStatus.DRAFT);
        }

        @Test
        @DisplayName("Should not allow rollback of posted run")
        void shouldNotAllowRollbackOfPostedRun() {
            YearMonth period = YearMonth.of(2024, 12);
            PayrollRun run = payrollService.createPayrollRun(period, "user-1");
            payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
            payrollService.calculatePayslips(run.getId());
            payrollService.submitForApproval(run.getId(), "user-1");
            payrollService.approve(run.getId(), "manager-1");
            payrollService.postToLedger(run.getId(), "user-1");

            assertThatThrownBy(() -> payrollService.rollback(run.getId(), "admin-1", "Too late"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("posted");
        }
    }

    // Helper methods
    private Employee createEmployee(String id, BigDecimal basicSalary) {
        Employee emp = new Employee();
        emp.setId(id);
        emp.setBasicSalary(basicSalary);
        emp.setJoiningDate(LocalDate.of(2020, 1, 1));
        emp.setBankIban("AE123456789012345678901");
        emp.setBankCode("ADCBAEAA");
        emp.setLabourCardId("LC" + id);
        return emp;
    }

    private PayrollRun createCompletedPayrollRun() {
        YearMonth period = YearMonth.of(2024, 12);
        PayrollRun run = payrollService.createPayrollRun(period, "user-1");
        run.setEmployerMolId("MOL123456");
        run.setRoutingCode("ADCBAEAA");
        payrollService.addEmployee(run.getId(), createEmployee("EMP-001", new BigDecimal("10000")));
        payrollService.addEmployee(run.getId(), createEmployee("EMP-002", new BigDecimal("15000")));
        payrollService.calculatePayslips(run.getId());
        payrollService.submitForApproval(run.getId(), "user-1");
        payrollService.approve(run.getId(), "manager-1");
        return run;
    }

    // Test implementation classes
    enum PayrollStatus {
        DRAFT, PENDING_APPROVAL, APPROVED, POSTED, CANCELLED
    }

    static class PayrollRun {
        private String id;
        private YearMonth period;
        private PayrollStatus status;
        private String createdBy;
        private String lastModifiedBy;
        private String rollbackReason;
        private String employerMolId;
        private String routingCode;
        private List<Employee> employees = new ArrayList<>();
        private List<Payslip> payslips = new ArrayList<>();

        String getId() { return id; }
        void setId(String id) { this.id = id; }
        YearMonth getPeriod() { return period; }
        void setPeriod(YearMonth period) { this.period = period; }
        PayrollStatus getStatus() { return status; }
        void setStatus(PayrollStatus status) { this.status = status; }
        String getCreatedBy() { return createdBy; }
        void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        String getLastModifiedBy() { return lastModifiedBy; }
        void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
        String getRollbackReason() { return rollbackReason; }
        void setRollbackReason(String rollbackReason) { this.rollbackReason = rollbackReason; }
        String getEmployerMolId() { return employerMolId; }
        void setEmployerMolId(String id) { this.employerMolId = id; }
        String getRoutingCode() { return routingCode; }
        void setRoutingCode(String code) { this.routingCode = code; }
        List<Employee> getEmployees() { return employees; }
        List<Payslip> getPayslips() { return payslips; }
    }

    static class Employee {
        private String id;
        private BigDecimal basicSalary = BigDecimal.ZERO;
        private BigDecimal housingAllowancePercent = BigDecimal.ZERO;
        private BigDecimal transportAllowance = BigDecimal.ZERO;
        private BigDecimal overtimeHours = BigDecimal.ZERO;
        private BigDecimal overtimeRate = new BigDecimal("1.5");
        private LocalDate joiningDate;
        private int unpaidLeaveDays = 0;
        private Map<String, BigDecimal> deductions = new HashMap<>();
        private String bankIban;
        private String bankCode;
        private String labourCardId;

        String getId() { return id; }
        void setId(String id) { this.id = id; }
        BigDecimal getBasicSalary() { return basicSalary; }
        void setBasicSalary(BigDecimal salary) { this.basicSalary = salary; }
        BigDecimal getHousingAllowancePercent() { return housingAllowancePercent; }
        void setHousingAllowancePercent(BigDecimal pct) { this.housingAllowancePercent = pct; }
        BigDecimal getTransportAllowance() { return transportAllowance; }
        void setTransportAllowance(BigDecimal amt) { this.transportAllowance = amt; }
        BigDecimal getOvertimeHours() { return overtimeHours; }
        void setOvertimeHours(BigDecimal hours) { this.overtimeHours = hours; }
        BigDecimal getOvertimeRate() { return overtimeRate; }
        void setOvertimeRate(BigDecimal rate) { this.overtimeRate = rate; }
        LocalDate getJoiningDate() { return joiningDate; }
        void setJoiningDate(LocalDate date) { this.joiningDate = date; }
        int getUnpaidLeaveDays() { return unpaidLeaveDays; }
        void setUnpaidLeaveDays(int days) { this.unpaidLeaveDays = days; }
        void addDeduction(String type, BigDecimal amount) { deductions.put(type, amount); }
        Map<String, BigDecimal> getDeductions() { return deductions; }
        String getBankIban() { return bankIban; }
        void setBankIban(String iban) { this.bankIban = iban; }
        String getBankCode() { return bankCode; }
        void setBankCode(String code) { this.bankCode = code; }
        String getLabourCardId() { return labourCardId; }
        void setLabourCardId(String id) { this.labourCardId = id; }
    }

    static class Payslip {
        private String employeeId;
        private BigDecimal basicSalary = BigDecimal.ZERO;
        private BigDecimal housingAllowance = BigDecimal.ZERO;
        private BigDecimal transportAllowance = BigDecimal.ZERO;
        private BigDecimal overtimePay = BigDecimal.ZERO;
        private BigDecimal totalDeductions = BigDecimal.ZERO;
        private BigDecimal leaveDeduction = BigDecimal.ZERO;
        private BigDecimal grossPay = BigDecimal.ZERO;
        private BigDecimal netPay = BigDecimal.ZERO;
        private int workingDays = 22;

        String getId() { return employeeId; }
        void setId(String id) { this.employeeId = id; }
        BigDecimal getBasicSalary() { return basicSalary; }
        void setBasicSalary(BigDecimal amt) { this.basicSalary = amt; }
        BigDecimal getHousingAllowance() { return housingAllowance; }
        void setHousingAllowance(BigDecimal amt) { this.housingAllowance = amt; }
        BigDecimal getTransportAllowance() { return transportAllowance; }
        void setTransportAllowance(BigDecimal amt) { this.transportAllowance = amt; }
        BigDecimal getOvertimePay() { return overtimePay; }
        void setOvertimePay(BigDecimal amt) { this.overtimePay = amt; }
        BigDecimal getTotalDeductions() { return totalDeductions; }
        void setTotalDeductions(BigDecimal amt) { this.totalDeductions = amt; }
        BigDecimal getLeaveDeduction() { return leaveDeduction; }
        void setLeaveDeduction(BigDecimal amt) { this.leaveDeduction = amt; }
        BigDecimal getGrossPay() { return grossPay; }
        void setGrossPay(BigDecimal amt) { this.grossPay = amt; }
        BigDecimal getNetPay() { return netPay; }
        void setNetPay(BigDecimal amt) { this.netPay = amt; }
        int getWorkingDays() { return workingDays; }
        void setWorkingDays(int days) { this.workingDays = days; }
    }

    static class PayrollService {
        private Map<String, PayrollRun> runs = new HashMap<>();
        private Map<YearMonth, Boolean> lockedPeriods = new HashMap<>();
        private int runCounter = 0;

        PayrollRun createPayrollRun(YearMonth period, String userId) {
            if (lockedPeriods.getOrDefault(period, false)) {
                throw new IllegalStateException("Period is locked");
            }
            if (runs.values().stream().anyMatch(r -> r.getPeriod().equals(period))) {
                throw new IllegalStateException("Payroll run already exists for this period");
            }
            PayrollRun run = new PayrollRun();
            run.setId("PR-" + (++runCounter));
            run.setPeriod(period);
            run.setStatus(PayrollStatus.DRAFT);
            run.setCreatedBy(userId);
            runs.put(run.getId(), run);
            return run;
        }

        PayrollRun getPayrollRun(String id) { return runs.get(id); }

        void addEmployee(String runId, Employee emp) {
            runs.get(runId).getEmployees().add(emp);
        }

        void calculatePayslips(String runId) {
            PayrollRun run = runs.get(runId);
            for (Employee emp : run.getEmployees()) {
                run.getPayslips().add(calculatePayslip(emp, run.getPeriod()));
            }
        }

        List<Payslip> getPayslips(String runId) {
            return runs.get(runId).getPayslips();
        }

        Payslip calculatePayslip(Employee emp, YearMonth period) {
            Payslip payslip = new Payslip();
            payslip.setId(emp.getId());

            int standardDays = 22;
            int workingDays = standardDays;
            boolean isFullMonth = true;

            // Handle partial month
            if (emp.getJoiningDate() != null && emp.getJoiningDate().getYear() == period.getYear()
                && emp.getJoiningDate().getMonthValue() == period.getMonthValue()) {
                int dayOfMonth = emp.getJoiningDate().getDayOfMonth();
                workingDays = Math.max(0, standardDays - (dayOfMonth - 1) * standardDays / 30);
                isFullMonth = false;
            }

            // Handle unpaid leave
            if (emp.getUnpaidLeaveDays() > 0) {
                workingDays = Math.max(0, workingDays - emp.getUnpaidLeaveDays());
                isFullMonth = false;
            }
            payslip.setWorkingDays(workingDays);

            BigDecimal basicSalary;
            BigDecimal dailyRate = emp.getBasicSalary().divide(new BigDecimal(standardDays), 2, RoundingMode.HALF_UP);
            if (isFullMonth) {
                // Use exact salary for full month to avoid rounding issues
                basicSalary = emp.getBasicSalary();
            } else {
                basicSalary = dailyRate.multiply(new BigDecimal(workingDays));
            }
            payslip.setBasicSalary(basicSalary);

            // Leave deduction
            BigDecimal leaveDeduction = dailyRate.multiply(new BigDecimal(emp.getUnpaidLeaveDays()));
            payslip.setLeaveDeduction(leaveDeduction);

            // Housing allowance
            BigDecimal housing = basicSalary.multiply(emp.getHousingAllowancePercent())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            payslip.setHousingAllowance(housing);

            // Transport
            payslip.setTransportAllowance(emp.getTransportAllowance());

            // Overtime
            if (emp.getOvertimeHours().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal hourlyRate = dailyRate.divide(new BigDecimal("8"), 2, RoundingMode.HALF_UP);
                BigDecimal otPay = hourlyRate.multiply(emp.getOvertimeRate()).multiply(emp.getOvertimeHours());
                payslip.setOvertimePay(otPay.setScale(2, RoundingMode.HALF_UP));
            }

            // Gross
            BigDecimal gross = basicSalary.add(housing).add(emp.getTransportAllowance()).add(payslip.getOvertimePay());
            payslip.setGrossPay(gross);

            // Deductions
            BigDecimal totalDeductions = emp.getDeductions().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            payslip.setTotalDeductions(totalDeductions);

            // Net
            payslip.setNetPay(gross.subtract(totalDeductions));

            return payslip;
        }

        BigDecimal calculateGratuity(Employee emp, LocalDate endDate) {
            long yearsOfService = java.time.temporal.ChronoUnit.YEARS.between(emp.getJoiningDate(), endDate);

            if (yearsOfService < 1) {
                return BigDecimal.ZERO;
            }

            // Use high precision for intermediate calculations, round at the end
            BigDecimal dailyWage = emp.getBasicSalary().divide(new BigDecimal("30"), 10, RoundingMode.HALF_UP);

            BigDecimal result;
            if (yearsOfService <= 5) {
                // 21 days per year for first 5 years
                result = dailyWage.multiply(new BigDecimal("21")).multiply(new BigDecimal(yearsOfService));
            } else {
                // 21 days for first 5 years + 30 days for remaining years
                BigDecimal first5Years = dailyWage.multiply(new BigDecimal("21")).multiply(new BigDecimal("5"));
                BigDecimal remainingYears = dailyWage.multiply(new BigDecimal("30"))
                    .multiply(new BigDecimal(yearsOfService - 5));
                result = first5Years.add(remainingYears);
            }
            return result.setScale(2, RoundingMode.HALF_UP);
        }

        void submitForApproval(String runId, String userId) {
            PayrollRun run = runs.get(runId);
            run.setStatus(PayrollStatus.PENDING_APPROVAL);
            run.setLastModifiedBy(userId);
        }

        void approve(String runId, String userId) {
            PayrollRun run = runs.get(runId);
            run.setStatus(PayrollStatus.APPROVED);
            run.setLastModifiedBy(userId);
        }

        void postToLedger(String runId, String userId) {
            PayrollRun run = runs.get(runId);
            run.setStatus(PayrollStatus.POSTED);
            run.setLastModifiedBy(userId);
            lockedPeriods.put(run.getPeriod(), true);
        }

        boolean isPeriodLocked(YearMonth period) {
            return lockedPeriods.getOrDefault(period, false);
        }

        void rollback(String runId, String userId, String reason) {
            PayrollRun run = runs.get(runId);
            if (run.getStatus() == PayrollStatus.POSTED) {
                throw new IllegalStateException("Cannot rollback posted payroll run");
            }
            run.setStatus(PayrollStatus.DRAFT);
            run.setLastModifiedBy(userId);
            run.setRollbackReason(reason);
            run.getPayslips().clear();
        }
    }

    static class WpsFile {
        private String fileName;
        private WpsRecord headerRecord;
        private List<WpsRecord> salaryRecords = new ArrayList<>();
        private WpsRecord footerRecord;

        String getFileName() { return fileName; }
        void setFileName(String name) { this.fileName = name; }
        WpsRecord getHeaderRecord() { return headerRecord; }
        void setHeaderRecord(WpsRecord wpsRecord) { this.headerRecord = wpsRecord; }
        List<WpsRecord> getSalaryRecords() { return salaryRecords; }
        WpsRecord getFooterRecord() { return footerRecord; }
        void setFooterRecord(WpsRecord wpsRecord) { this.footerRecord = wpsRecord; }
        int getRecordCount() { return salaryRecords.size(); }
    }

    static class WpsRecord {
        private String recordType;
        private String employerMolId;
        private String routingCode;
        private String employeeLabourId;
        private BigDecimal salaryAmount;
        private int totalRecords;
        private BigDecimal totalAmount;

        String getRecordType() { return recordType; }
        void setRecordType(String type) { this.recordType = type; }
        String getEmployerMolId() { return employerMolId; }
        void setEmployerMolId(String id) { this.employerMolId = id; }
        String getRoutingCode() { return routingCode; }
        void setRoutingCode(String code) { this.routingCode = code; }
        String getEmployeeLabourId() { return employeeLabourId; }
        void setEmployeeLabourId(String id) { this.employeeLabourId = id; }
        BigDecimal getSalaryAmount() { return salaryAmount; }
        void setSalaryAmount(BigDecimal amt) { this.salaryAmount = amt; }
        int getTotalRecords() { return totalRecords; }
        void setTotalRecords(int count) { this.totalRecords = count; }
        BigDecimal getTotalAmount() { return totalAmount; }
        void setTotalAmount(BigDecimal amt) { this.totalAmount = amt; }
    }

    static class WpsFileGenerator {
        WpsFile generate(PayrollRun run) {
            // Validate bank details
            for (Employee emp : run.getEmployees()) {
                if (emp.getBankIban() == null || emp.getBankIban().isEmpty()) {
                    throw new IllegalStateException("Employee " + emp.getId() + " missing bank details");
                }
            }

            WpsFile file = new WpsFile();
            file.setFileName("WPS_" + java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
                .format(java.time.LocalDateTime.now()) + ".SIF");

            // Header
            WpsRecord header = new WpsRecord();
            header.setRecordType("EDR");
            header.setEmployerMolId(run.getEmployerMolId());
            header.setRoutingCode(run.getRoutingCode());
            file.setHeaderRecord(header);

            // Salary records
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Payslip payslip : run.getPayslips()) {
                WpsRecord salary = new WpsRecord();
                salary.setRecordType("SDR");
                Employee emp = run.getEmployees().stream()
                    .filter(e -> e.getId().equals(payslip.getId()))
                    .findFirst().orElseThrow(() -> new java.util.NoSuchElementException("Employee not found: " + payslip.getId()));
                salary.setEmployeeLabourId(emp.getLabourCardId());
                salary.setSalaryAmount(payslip.getNetPay());
                file.getSalaryRecords().add(salary);
                totalAmount = totalAmount.add(payslip.getNetPay());
            }

            // Footer
            WpsRecord footer = new WpsRecord();
            footer.setRecordType("SCR");
            footer.setTotalRecords(file.getSalaryRecords().size());
            footer.setTotalAmount(totalAmount);
            file.setFooterRecord(footer);

            return file;
        }
    }
}
