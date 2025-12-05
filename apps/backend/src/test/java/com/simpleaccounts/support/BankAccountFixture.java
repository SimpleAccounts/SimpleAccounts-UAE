package com.simpleaccounts.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test fixture builder for BankAccount and related entities.
 * Provides fluent API for creating test bank data with sensible defaults.
 */
public class BankAccountFixture {

    private Integer bankAccountId;
    private String accountName = "Test Bank Account";
    private String accountNumber = "1234567890";
    private String bankName = "Test Bank";
    private String currencyCode = "AED";
    private BigDecimal currentBalance = new BigDecimal("10000.00");
    private BigDecimal openingBalance = new BigDecimal("10000.00");
    private LocalDate openingDate = LocalDate.now().minusMonths(6);
    private Integer status = 1; // Active
    private Integer createdBy = 1;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Boolean deleteFlag = false;
    private String iban;
    private String swiftCode;
    private List<TransactionData> transactions = new ArrayList<>();

    public static BankAccountFixture aBankAccount() {
        return new BankAccountFixture();
    }

    public static BankAccountFixture aCheckingAccount() {
        return new BankAccountFixture()
            .withAccountName("Checking Account")
            .withType("CHECKING");
    }

    public static BankAccountFixture aSavingsAccount() {
        return new BankAccountFixture()
            .withAccountName("Savings Account")
            .withType("SAVINGS");
    }

    public BankAccountFixture withId(Integer id) {
        this.bankAccountId = id;
        return this;
    }

    public BankAccountFixture withAccountName(String name) {
        this.accountName = name;
        return this;
    }

    public BankAccountFixture withAccountNumber(String number) {
        this.accountNumber = number;
        return this;
    }

    public BankAccountFixture withBankName(String bankName) {
        this.bankName = bankName;
        return this;
    }

    public BankAccountFixture withCurrency(String currencyCode) {
        this.currencyCode = currencyCode;
        return this;
    }

    public BankAccountFixture withBalance(BigDecimal balance) {
        this.currentBalance = balance;
        return this;
    }

    public BankAccountFixture withBalance(String balance) {
        this.currentBalance = new BigDecimal(balance);
        return this;
    }

    public BankAccountFixture withOpeningBalance(BigDecimal balance, LocalDate date) {
        this.openingBalance = balance;
        this.openingDate = date;
        return this;
    }

    public BankAccountFixture withType(String type) {
        // Type is implied by account setup
        return this;
    }

    public BankAccountFixture withIban(String iban) {
        this.iban = iban;
        return this;
    }

    public BankAccountFixture withSwiftCode(String swiftCode) {
        this.swiftCode = swiftCode;
        return this;
    }

    public BankAccountFixture withCreatedBy(Integer userId) {
        this.createdBy = userId;
        return this;
    }

    public BankAccountFixture inactive() {
        this.status = 0;
        return this;
    }

    public BankAccountFixture deleted() {
        this.deleteFlag = true;
        return this;
    }

    public BankAccountFixture withTransaction(LocalDate date, String description,
                                              BigDecimal amount, boolean isCredit) {
        TransactionData txn = new TransactionData(date, description, amount, isCredit);
        transactions.add(txn);
        if (isCredit) {
            currentBalance = currentBalance.add(amount);
        } else {
            currentBalance = currentBalance.subtract(amount);
        }
        return this;
    }

    public BankAccountFixture withDeposit(LocalDate date, String description, BigDecimal amount) {
        return withTransaction(date, description, amount, true);
    }

    public BankAccountFixture withWithdrawal(LocalDate date, String description, BigDecimal amount) {
        return withTransaction(date, description, amount, false);
    }

    public BankAccountData build() {
        return new BankAccountData(
            bankAccountId, accountName, accountNumber, bankName,
            currencyCode, currentBalance, openingBalance, openingDate,
            status, createdBy, createdDate, deleteFlag, iban, swiftCode, transactions
        );
    }

    public static class BankAccountData {
        public final Integer bankAccountId;
        public final String accountName;
        public final String accountNumber;
        public final String bankName;
        public final String currencyCode;
        public final BigDecimal currentBalance;
        public final BigDecimal openingBalance;
        public final LocalDate openingDate;
        public final Integer status;
        public final Integer createdBy;
        public final LocalDateTime createdDate;
        public final Boolean deleteFlag;
        public final String iban;
        public final String swiftCode;
        public final List<TransactionData> transactions;

        public BankAccountData(Integer bankAccountId, String accountName, String accountNumber,
                              String bankName, String currencyCode, BigDecimal currentBalance,
                              BigDecimal openingBalance, LocalDate openingDate, Integer status,
                              Integer createdBy, LocalDateTime createdDate, Boolean deleteFlag,
                              String iban, String swiftCode, List<TransactionData> transactions) {
            this.bankAccountId = bankAccountId;
            this.accountName = accountName;
            this.accountNumber = accountNumber;
            this.bankName = bankName;
            this.currencyCode = currencyCode;
            this.currentBalance = currentBalance;
            this.openingBalance = openingBalance;
            this.openingDate = openingDate;
            this.status = status;
            this.createdBy = createdBy;
            this.createdDate = createdDate;
            this.deleteFlag = deleteFlag;
            this.iban = iban;
            this.swiftCode = swiftCode;
            this.transactions = transactions;
        }

        public int getTransactionCount() {
            return transactions.size();
        }
    }

    public static class TransactionData {
        public final LocalDate date;
        public final String description;
        public final BigDecimal amount;
        public final boolean isCredit;
        public ReconciliationStatus reconciliationStatus = ReconciliationStatus.UNRECONCILED;

        public TransactionData(LocalDate date, String description, BigDecimal amount, boolean isCredit) {
            this.date = date;
            this.description = description;
            this.amount = amount;
            this.isCredit = isCredit;
        }

        public TransactionData reconciled() {
            this.reconciliationStatus = ReconciliationStatus.RECONCILED;
            return this;
        }

        public TransactionData partiallyReconciled() {
            this.reconciliationStatus = ReconciliationStatus.PARTIAL;
            return this;
        }
    }

    public enum ReconciliationStatus {
        UNRECONCILED, PARTIAL, RECONCILED
    }
}
