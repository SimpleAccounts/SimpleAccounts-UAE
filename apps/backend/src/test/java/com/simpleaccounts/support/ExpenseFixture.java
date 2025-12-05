package com.simpleaccounts.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Test fixture builder for Expense entities.
 * Provides fluent API for creating test expenses with sensible defaults.
 */
public class ExpenseFixture {

    private Integer expenseId;
    private String expenseNumber = "EXP-TEST-001";
    private BigDecimal expenseAmount = new BigDecimal("500.00");
    private BigDecimal expenseVatAmount = new BigDecimal("25.00");
    private LocalDate expenseDate = LocalDate.now();
    private String expenseDescription = "Test expense";
    private String currencyCode = "AED";
    private BigDecimal exchangeRate = BigDecimal.ONE;
    private Integer status = 1; // Draft
    private Integer createdBy = 1;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Boolean deleteFlag = false;
    private Boolean editFlag = true;
    private Boolean vatClaimable = true;
    private Boolean exclusiveVat = false;
    private Boolean isReverseChargeEnabled = false;
    private Boolean expenseType = false; // false = standard expense
    private String payee;
    private String receiptNumber;
    private Integer projectId;
    private Integer employeeId;
    private Integer categoryCode;
    private Integer vatCategoryId = 1; // Standard VAT

    public static ExpenseFixture anExpense() {
        return new ExpenseFixture();
    }

    public static ExpenseFixture aTravelExpense() {
        return new ExpenseFixture()
            .withDescription("Travel expense")
            .withCategory(101); // Travel category
    }

    public static ExpenseFixture aMealsExpense() {
        return new ExpenseFixture()
            .withDescription("Meals expense")
            .withCategory(102); // Meals category
    }

    public static ExpenseFixture anOfficeSuppliesExpense() {
        return new ExpenseFixture()
            .withDescription("Office supplies")
            .withCategory(103);
    }

    public ExpenseFixture withId(Integer id) {
        this.expenseId = id;
        return this;
    }

    public ExpenseFixture withExpenseNumber(String number) {
        this.expenseNumber = number;
        return this;
    }

    public ExpenseFixture withAmount(BigDecimal amount) {
        this.expenseAmount = amount;
        return this;
    }

    public ExpenseFixture withAmount(String amount) {
        this.expenseAmount = new BigDecimal(amount);
        return this;
    }

    public ExpenseFixture withVatAmount(BigDecimal vatAmount) {
        this.expenseVatAmount = vatAmount;
        return this;
    }

    public ExpenseFixture withVatAmount(String vatAmount) {
        this.expenseVatAmount = new BigDecimal(vatAmount);
        return this;
    }

    public ExpenseFixture withDate(LocalDate date) {
        this.expenseDate = date;
        return this;
    }

    public ExpenseFixture withDescription(String description) {
        this.expenseDescription = description;
        return this;
    }

    public ExpenseFixture withCurrency(String currencyCode, BigDecimal exchangeRate) {
        this.currencyCode = currencyCode;
        this.exchangeRate = exchangeRate;
        return this;
    }

    public ExpenseFixture withStatus(Integer status) {
        this.status = status;
        return this;
    }

    public ExpenseFixture asDraft() {
        this.status = 1;
        return this;
    }

    public ExpenseFixture asPosted() {
        this.status = 2;
        return this;
    }

    public ExpenseFixture asApproved() {
        this.status = 3;
        return this;
    }

    public ExpenseFixture withCreatedBy(Integer userId) {
        this.createdBy = userId;
        return this;
    }

    public ExpenseFixture deleted() {
        this.deleteFlag = true;
        return this;
    }

    public ExpenseFixture vatClaimable(boolean claimable) {
        this.vatClaimable = claimable;
        return this;
    }

    public ExpenseFixture exclusiveVat(boolean exclusive) {
        this.exclusiveVat = exclusive;
        return this;
    }

    public ExpenseFixture withReverseCharge() {
        this.isReverseChargeEnabled = true;
        return this;
    }

    public ExpenseFixture withPayee(String payee) {
        this.payee = payee;
        return this;
    }

    public ExpenseFixture withReceipt(String receiptNumber) {
        this.receiptNumber = receiptNumber;
        return this;
    }

    public ExpenseFixture withProject(Integer projectId) {
        this.projectId = projectId;
        return this;
    }

    public ExpenseFixture withEmployee(Integer employeeId) {
        this.employeeId = employeeId;
        return this;
    }

    public ExpenseFixture withCategory(Integer categoryCode) {
        this.categoryCode = categoryCode;
        return this;
    }

    public ExpenseFixture withVatCategory(Integer vatCategoryId) {
        this.vatCategoryId = vatCategoryId;
        return this;
    }

    public ExpenseFixture zeroRated() {
        this.vatCategoryId = 2;
        this.expenseVatAmount = BigDecimal.ZERO;
        return this;
    }

    public ExpenseFixture exempt() {
        this.vatCategoryId = 3;
        this.expenseVatAmount = BigDecimal.ZERO;
        return this;
    }

    public ExpenseData build() {
        return new ExpenseData(
            expenseId, expenseNumber, expenseAmount, expenseVatAmount,
            expenseDate, expenseDescription, currencyCode, exchangeRate,
            status, createdBy, createdDate, deleteFlag, editFlag,
            vatClaimable, exclusiveVat, isReverseChargeEnabled, expenseType,
            payee, receiptNumber, projectId, employeeId, categoryCode, vatCategoryId
        );
    }

    public static class ExpenseData {
        public final Integer expenseId;
        public final String expenseNumber;
        public final BigDecimal expenseAmount;
        public final BigDecimal expenseVatAmount;
        public final LocalDate expenseDate;
        public final String expenseDescription;
        public final String currencyCode;
        public final BigDecimal exchangeRate;
        public final Integer status;
        public final Integer createdBy;
        public final LocalDateTime createdDate;
        public final Boolean deleteFlag;
        public final Boolean editFlag;
        public final Boolean vatClaimable;
        public final Boolean exclusiveVat;
        public final Boolean isReverseChargeEnabled;
        public final Boolean expenseType;
        public final String payee;
        public final String receiptNumber;
        public final Integer projectId;
        public final Integer employeeId;
        public final Integer categoryCode;
        public final Integer vatCategoryId;

        public ExpenseData(Integer expenseId, String expenseNumber, BigDecimal expenseAmount,
                          BigDecimal expenseVatAmount, LocalDate expenseDate, String expenseDescription,
                          String currencyCode, BigDecimal exchangeRate, Integer status,
                          Integer createdBy, LocalDateTime createdDate, Boolean deleteFlag,
                          Boolean editFlag, Boolean vatClaimable, Boolean exclusiveVat,
                          Boolean isReverseChargeEnabled, Boolean expenseType, String payee,
                          String receiptNumber, Integer projectId, Integer employeeId,
                          Integer categoryCode, Integer vatCategoryId) {
            this.expenseId = expenseId;
            this.expenseNumber = expenseNumber;
            this.expenseAmount = expenseAmount;
            this.expenseVatAmount = expenseVatAmount;
            this.expenseDate = expenseDate;
            this.expenseDescription = expenseDescription;
            this.currencyCode = currencyCode;
            this.exchangeRate = exchangeRate;
            this.status = status;
            this.createdBy = createdBy;
            this.createdDate = createdDate;
            this.deleteFlag = deleteFlag;
            this.editFlag = editFlag;
            this.vatClaimable = vatClaimable;
            this.exclusiveVat = exclusiveVat;
            this.isReverseChargeEnabled = isReverseChargeEnabled;
            this.expenseType = expenseType;
            this.payee = payee;
            this.receiptNumber = receiptNumber;
            this.projectId = projectId;
            this.employeeId = employeeId;
            this.categoryCode = categoryCode;
            this.vatCategoryId = vatCategoryId;
        }

        public BigDecimal getTotalWithVat() {
            return expenseAmount.add(expenseVatAmount);
        }
    }
}
