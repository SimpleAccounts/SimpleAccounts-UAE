package com.simpleaccounts.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test fixture builder for Payroll entities.
 * Provides fluent API for creating test payroll runs with sensible defaults.
 */
public class PayrollFixture {

    private Integer payrollId;
    private String payrollPeriod = "2024-12";
    private LocalDate startDate = LocalDate.of(2024, 12, 1);
    private LocalDate endDate = LocalDate.of(2024, 12, 31);
    private LocalDate paymentDate = LocalDate.of(2024, 12, 28);
    private Integer status = 1; // Draft
    private Integer createdBy = 1;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Boolean deleteFlag = false;
    private BigDecimal totalGrossSalary = BigDecimal.ZERO;
    private BigDecimal totalDeductions = BigDecimal.ZERO;
    private BigDecimal totalNetSalary = BigDecimal.ZERO;
    private List<EmployeePayrollData> employees = new ArrayList<>();

    public static PayrollFixture aPayrollRun() {
        return new PayrollFixture();
    }

    public static PayrollFixture aMonthlyPayroll(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return new PayrollFixture()
            .withPeriod(year + "-" + String.format("%02d", month))
            .withDateRange(start, end)
            .withPaymentDate(end.minusDays(3));
    }

    public PayrollFixture withId(Integer id) {
        this.payrollId = id;
        return this;
    }

    public PayrollFixture withPeriod(String period) {
        this.payrollPeriod = period;
        return this;
    }

    public PayrollFixture withDateRange(LocalDate start, LocalDate end) {
        this.startDate = start;
        this.endDate = end;
        return this;
    }

    public PayrollFixture withPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
        return this;
    }

    public PayrollFixture withStatus(Integer status) {
        this.status = status;
        return this;
    }

    public PayrollFixture asDraft() {
        this.status = 1;
        return this;
    }

    public PayrollFixture asProcessed() {
        this.status = 2;
        return this;
    }

    public PayrollFixture asApproved() {
        this.status = 3;
        return this;
    }

    public PayrollFixture asPaid() {
        this.status = 4;
        return this;
    }

    public PayrollFixture withCreatedBy(Integer userId) {
        this.createdBy = userId;
        return this;
    }

    public PayrollFixture deleted() {
        this.deleteFlag = true;
        return this;
    }

    public PayrollFixture withEmployee(String employeeId, String name, BigDecimal basicSalary) {
        return withEmployee(employeeId, name, basicSalary, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public PayrollFixture withEmployee(String employeeId, String name, BigDecimal basicSalary,
                                       BigDecimal allowances, BigDecimal deductions) {
        EmployeePayrollData empData = new EmployeePayrollData(
            employeeId, name, basicSalary, allowances, deductions
        );
        employees.add(empData);
        recalculateTotals();
        return this;
    }

    public PayrollFixture withEmployee(String employeeId, String name, String basicSalary,
                                       String allowances, String deductions) {
        return withEmployee(employeeId, name, new BigDecimal(basicSalary),
                           new BigDecimal(allowances), new BigDecimal(deductions));
    }

    private void recalculateTotals() {
        totalGrossSalary = BigDecimal.ZERO;
        totalDeductions = BigDecimal.ZERO;
        totalNetSalary = BigDecimal.ZERO;

        for (EmployeePayrollData emp : employees) {
            totalGrossSalary = totalGrossSalary.add(emp.getGrossSalary());
            totalDeductions = totalDeductions.add(emp.deductions);
            totalNetSalary = totalNetSalary.add(emp.getNetSalary());
        }
    }

    public PayrollData build() {
        return new PayrollData(
            payrollId, payrollPeriod, startDate, endDate, paymentDate,
            status, createdBy, createdDate, deleteFlag,
            totalGrossSalary, totalDeductions, totalNetSalary, employees
        );
    }

    public static class PayrollData {
        public final Integer payrollId;
        public final String payrollPeriod;
        public final LocalDate startDate;
        public final LocalDate endDate;
        public final LocalDate paymentDate;
        public final Integer status;
        public final Integer createdBy;
        public final LocalDateTime createdDate;
        public final Boolean deleteFlag;
        public final BigDecimal totalGrossSalary;
        public final BigDecimal totalDeductions;
        public final BigDecimal totalNetSalary;
        public final List<EmployeePayrollData> employees;

        public PayrollData(Integer payrollId, String payrollPeriod, LocalDate startDate,
                          LocalDate endDate, LocalDate paymentDate, Integer status,
                          Integer createdBy, LocalDateTime createdDate, Boolean deleteFlag,
                          BigDecimal totalGrossSalary, BigDecimal totalDeductions,
                          BigDecimal totalNetSalary, List<EmployeePayrollData> employees) {
            this.payrollId = payrollId;
            this.payrollPeriod = payrollPeriod;
            this.startDate = startDate;
            this.endDate = endDate;
            this.paymentDate = paymentDate;
            this.status = status;
            this.createdBy = createdBy;
            this.createdDate = createdDate;
            this.deleteFlag = deleteFlag;
            this.totalGrossSalary = totalGrossSalary;
            this.totalDeductions = totalDeductions;
            this.totalNetSalary = totalNetSalary;
            this.employees = employees;
        }

        public int getEmployeeCount() {
            return employees.size();
        }
    }

    public static class EmployeePayrollData {
        public final String employeeId;
        public final String employeeName;
        public final BigDecimal basicSalary;
        public final BigDecimal allowances;
        public final BigDecimal deductions;

        public EmployeePayrollData(String employeeId, String employeeName, BigDecimal basicSalary,
                                   BigDecimal allowances, BigDecimal deductions) {
            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.basicSalary = basicSalary;
            this.allowances = allowances;
            this.deductions = deductions;
        }

        public BigDecimal getGrossSalary() {
            return basicSalary.add(allowances);
        }

        public BigDecimal getNetSalary() {
            return getGrossSalary().subtract(deductions);
        }
    }
}
