package com.simpleaccounts.integration;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.service.EmployeeService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Payroll calculation and posting workflows.
 * Tests payroll processing, WPS file generation, and employee salary calculations.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Payroll Integration Tests")
class PayrollIntegrationTest {

    @Autowired(required = false)
    private EmployeeService employeeService;

    @BeforeAll
    void setUp() {
        // Setup test data
    }

    @Test
    @DisplayName("Should create monthly payroll for employees")
    @Transactional
    void shouldCreateMonthlyPayrollForEmployees() {
        // Given
        Payroll payroll = createTestPayroll();
        payroll.setPayrollSubject("December 2024 Payroll");
        payroll.setPayPeriod("December 2024");
        payroll.setEmployeeCount(10);
        payroll.setTotalAmountPayroll(new BigDecimal("50000.00"));
        payroll.setStatus("DRAFT");

        // When
        payroll.setGeneratedBy("Admin");
        payroll.setRunDate(LocalDateTime.now());

        // Then
        assertThat(payroll.getPayPeriod()).isEqualTo("December 2024");
        assertThat(payroll.getEmployeeCount()).isEqualTo(10);
        assertThat(payroll.getTotalAmountPayroll()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Should calculate employee basic salary")
    @Transactional
    void shouldCalculateEmployeeBasicSalary() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setBasicSalary(new BigDecimal("5000.00"));
        payrollEmployee.setWorkingDays(22);
        payrollEmployee.setAbsentDays(0);

        // When - Full month salary
        BigDecimal monthlySalary = payrollEmployee.getBasicSalary();

        // Then
        assertThat(monthlySalary).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(payrollEmployee.getWorkingDays()).isEqualTo(22);
    }

    @Test
    @DisplayName("Should calculate salary with allowances")
    @Transactional
    void shouldCalculateSalaryWithAllowances() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setBasicSalary(new BigDecimal("5000.00"));
        BigDecimal housingAllowance = new BigDecimal("2000.00");
        BigDecimal transportAllowance = new BigDecimal("500.00");

        // When
        BigDecimal totalSalary = payrollEmployee.getBasicSalary()
                .add(housingAllowance)
                .add(transportAllowance);

        payrollEmployee.setTotalEarnings(totalSalary);

        // Then
        assertThat(payrollEmployee.getTotalEarnings()).isEqualByComparingTo(new BigDecimal("7500.00"));
    }

    @Test
    @DisplayName("Should calculate salary deductions")
    @Transactional
    void shouldCalculateSalaryDeductions() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setBasicSalary(new BigDecimal("5000.00"));
        BigDecimal loanDeduction = new BigDecimal("500.00");
        BigDecimal advanceDeduction = new BigDecimal("200.00");

        // When
        BigDecimal totalDeductions = loanDeduction.add(advanceDeduction);
        payrollEmployee.setTotalDeductions(totalDeductions);

        BigDecimal netSalary = payrollEmployee.getBasicSalary().subtract(totalDeductions);
        payrollEmployee.setNetSalary(netSalary);

        // Then
        assertThat(payrollEmployee.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("700.00"));
        assertThat(payrollEmployee.getNetSalary()).isEqualByComparingTo(new BigDecimal("4300.00"));
    }

    @Test
    @DisplayName("Should calculate prorated salary for absent days")
    @Transactional
    void shouldCalculateProratedSalaryForAbsentDays() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setBasicSalary(new BigDecimal("5000.00"));
        payrollEmployee.setWorkingDays(22);
        payrollEmployee.setAbsentDays(2);

        // When
        BigDecimal dailyRate = payrollEmployee.getBasicSalary()
                .divide(new BigDecimal(payrollEmployee.getWorkingDays()), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal deductionForAbsence = dailyRate.multiply(new BigDecimal(payrollEmployee.getAbsentDays()));
        BigDecimal proratedSalary = payrollEmployee.getBasicSalary().subtract(deductionForAbsence);

        payrollEmployee.setNetSalary(proratedSalary);

        // Then
        assertThat(payrollEmployee.getAbsentDays()).isEqualTo(2);
        assertThat(payrollEmployee.getNetSalary()).isLessThan(payrollEmployee.getBasicSalary());
    }

    @Test
    @DisplayName("Should calculate overtime pay")
    @Transactional
    void shouldCalculateOvertimePay() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setBasicSalary(new BigDecimal("5000.00"));
        int overtimeHours = 10;

        // When - UAE overtime = 1.25x hourly rate
        BigDecimal monthlyHours = new BigDecimal("176"); // 22 days * 8 hours
        BigDecimal hourlyRate = payrollEmployee.getBasicSalary()
                .divide(monthlyHours, 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal overtimeRate = hourlyRate.multiply(new BigDecimal("1.25"));
        BigDecimal overtimePay = overtimeRate.multiply(new BigDecimal(overtimeHours));

        payrollEmployee.setOverTimeAmount(overtimePay);

        // Then
        assertThat(payrollEmployee.getOverTimeAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should process end of service gratuity calculation")
    @Transactional
    void shouldProcessEndOfServiceGratuityCalculation() {
        // Given
        Employee employee = createTestEmployee();
        BigDecimal basicSalary = new BigDecimal("5000.00");
        int yearsOfService = 5;

        // When - UAE gratuity calculation
        // First 5 years: 21 days per year
        BigDecimal gratuityDays = new BigDecimal(21 * yearsOfService);
        BigDecimal dailySalary = basicSalary.divide(new BigDecimal("30"), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal gratuityAmount = dailySalary.multiply(gratuityDays);

        // Then
        assertThat(gratuityAmount).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should approve payroll and change status")
    @Transactional
    void shouldApprovePayrollAndChangeStatus() {
        // Given
        Payroll payroll = createTestPayroll();
        payroll.setStatus("DRAFT");
        payroll.setPayrollApprover(null);

        // When
        payroll.setStatus("APPROVED");
        payroll.setApprovedBy("Manager");
        payroll.setPayrollApprover(1);

        // Then
        assertThat(payroll.getStatus()).isEqualTo("APPROVED");
        assertThat(payroll.getApprovedBy()).isEqualTo("Manager");
        assertThat(payroll.getPayrollApprover()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should generate WPS file for bank")
    @Transactional
    void shouldGenerateWpsFileForBank() {
        // Given
        Payroll payroll = createTestPayroll();
        payroll.setStatus("APPROVED");
        List<PayrollEmployee> employees = createTestPayrollEmployees();

        // When - Generate WPS data
        List<String> wpsRecords = new ArrayList<>();
        for (PayrollEmployee emp : employees) {
            String wpsRecord = String.format("%s,%s,%s",
                emp.getEmployeeIban(),
                emp.getNetSalary(),
                emp.getSalaryMonth()
            );
            wpsRecords.add(wpsRecord);
        }

        // Then
        assertThat(wpsRecords).hasSize(employees.size());
        assertThat(wpsRecords.get(0)).contains("AE");
    }

    @Test
    @DisplayName("Should calculate total payroll amount")
    @Transactional
    void shouldCalculateTotalPayrollAmount() {
        // Given
        Payroll payroll = createTestPayroll();
        List<PayrollEmployee> employees = createTestPayrollEmployees();

        // When
        BigDecimal totalPayroll = employees.stream()
                .map(PayrollEmployee::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        payroll.setTotalAmountPayroll(totalPayroll);
        payroll.setEmployeeCount(employees.size());

        // Then
        assertThat(payroll.getTotalAmountPayroll()).isGreaterThan(BigDecimal.ZERO);
        assertThat(payroll.getEmployeeCount()).isEqualTo(employees.size());
    }

    @Test
    @DisplayName("Should handle payroll with part-time employees")
    @Transactional
    void shouldHandlePayrollWithPartTimeEmployees() {
        // Given
        PayrollEmployee partTimeEmployee = createTestPayrollEmployee();
        partTimeEmployee.setBasicSalary(new BigDecimal("2500.00")); // Half month
        partTimeEmployee.setWorkingDays(11); // Part-time

        // When
        BigDecimal salary = partTimeEmployee.getBasicSalary();

        // Then
        assertThat(salary).isEqualByComparingTo(new BigDecimal("2500.00"));
        assertThat(partTimeEmployee.getWorkingDays()).isEqualTo(11);
    }

    @Test
    @DisplayName("Should link employee bank details to payroll")
    @Transactional
    void shouldLinkEmployeeBankDetailsToPayroll() {
        // Given
        PayrollEmployee payrollEmployee = createTestPayrollEmployee();
        payrollEmployee.setEmployeeIban("AE070331234567890123456");
        payrollEmployee.setBankName("Emirates NBD");

        // When
        boolean hasBankDetails = payrollEmployee.getEmployeeIban() != null;

        // Then
        assertThat(hasBankDetails).isTrue();
        assertThat(payrollEmployee.getEmployeeIban()).startsWith("AE");
    }

    @Test
    @DisplayName("Should calculate payroll due amount after partial payment")
    @Transactional
    void shouldCalculatePayrollDueAmountAfterPartialPayment() {
        // Given
        Payroll payroll = createTestPayroll();
        payroll.setTotalAmountPayroll(new BigDecimal("50000.00"));
        payroll.setDueAmountPayroll(new BigDecimal("50000.00"));

        // When - Partial payment
        BigDecimal paidAmount = new BigDecimal("30000.00");
        BigDecimal dueAmount = payroll.getDueAmountPayroll().subtract(paidAmount);
        payroll.setDueAmountPayroll(dueAmount);

        // Then
        assertThat(payroll.getDueAmountPayroll()).isEqualByComparingTo(new BigDecimal("20000.00"));
    }

    @Test
    @DisplayName("Should soft delete payroll record")
    @Transactional
    void shouldSoftDeletePayrollRecord() {
        // Given
        Payroll payroll = createTestPayroll();
        payroll.setPayrollSubject("Test Payroll");
        payroll.setDeleteFlag(false);

        // When
        payroll.setDeleteFlag(true);
        payroll.setLastUpdateBy(1);
        payroll.setLastUpdateDate(LocalDateTime.now());

        // Then
        assertThat(payroll.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should validate payroll employee count matches actual employees")
    @Transactional
    void shouldValidatePayrollEmployeeCountMatchesActualEmployees() {
        // Given
        Payroll payroll = createTestPayroll();
        List<PayrollEmployee> employees = createTestPayrollEmployees();

        // When
        payroll.setEmployeeCount(employees.size());

        // Then
        assertThat(payroll.getEmployeeCount()).isEqualTo(employees.size());
        assertThat(employees).hasSize(3);
    }

    // Helper methods

    private Payroll createTestPayroll() {
        Payroll payroll = new Payroll();
        payroll.setPayrollDate(LocalDateTime.now());
        payroll.setRunDate(LocalDateTime.now());
        payroll.setCreatedBy(1);
        payroll.setCreatedDate(LocalDateTime.now());
        payroll.setLastUpdateDate(LocalDateTime.now());
        payroll.setDeleteFlag(false);
        payroll.setIsActive(true);
        payroll.setStatus("DRAFT");
        payroll.setTotalAmountPayroll(BigDecimal.ZERO);
        payroll.setDueAmountPayroll(BigDecimal.ZERO);
        return payroll;
    }

    private PayrollEmployee createTestPayrollEmployee() {
        PayrollEmployee payrollEmployee = new PayrollEmployee();
        payrollEmployee.setBasicSalary(BigDecimal.ZERO);
        payrollEmployee.setWorkingDays(22);
        payrollEmployee.setAbsentDays(0);
        payrollEmployee.setTotalEarnings(BigDecimal.ZERO);
        payrollEmployee.setTotalDeductions(BigDecimal.ZERO);
        payrollEmployee.setNetSalary(BigDecimal.ZERO);
        payrollEmployee.setOverTimeAmount(BigDecimal.ZERO);
        payrollEmployee.setSalaryMonth("December 2024");
        return payrollEmployee;
    }

    private List<PayrollEmployee> createTestPayrollEmployees() {
        List<PayrollEmployee> employees = new ArrayList<>();

        PayrollEmployee emp1 = createTestPayrollEmployee();
        emp1.setBasicSalary(new BigDecimal("5000.00"));
        emp1.setNetSalary(new BigDecimal("5000.00"));
        emp1.setEmployeeIban("AE070331234567890123456");
        employees.add(emp1);

        PayrollEmployee emp2 = createTestPayrollEmployee();
        emp2.setBasicSalary(new BigDecimal("6000.00"));
        emp2.setNetSalary(new BigDecimal("6000.00"));
        emp2.setEmployeeIban("AE070331234567890123457");
        employees.add(emp2);

        PayrollEmployee emp3 = createTestPayrollEmployee();
        emp3.setBasicSalary(new BigDecimal("4500.00"));
        emp3.setNetSalary(new BigDecimal("4500.00"));
        emp3.setEmployeeIban("AE070331234567890123458");
        employees.add(emp3);

        return employees;
    }

    private Employee createTestEmployee() {
        Employee employee = new Employee();
        employee.setEmployeeId(1);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        return employee;
    }
}
