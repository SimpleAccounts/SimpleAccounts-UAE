package com.simpleaccounts.uae;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Immutable representation of a single Wage Protection System row.
 */
public final class WpsRecord {

    private final String employeeId;
    private final String employeeName;
    private final String bankCode;
    private final String iban;
    private final BigDecimal amount;

    private WpsRecord(Builder builder) {
        this.employeeId = builder.employeeId;
        this.employeeName = builder.employeeName;
        this.bankCode = builder.bankCode;
        this.iban = builder.iban;
        this.amount = builder.amount;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getIban() {
        return iban;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String employeeId;
        private String employeeName;
        private String bankCode;
        private String iban;
        private BigDecimal amount = BigDecimal.ZERO;

        public Builder employeeId(String employeeId) {
            this.employeeId = employeeId;
            return this;
        }

        public Builder employeeName(String employeeName) {
            this.employeeName = employeeName;
            return this;
        }

        public Builder bankCode(String bankCode) {
            this.bankCode = bankCode;
            return this;
        }

        public Builder iban(String iban) {
            this.iban = iban;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public WpsRecord build() {
            Objects.requireNonNull(employeeId, "Employee id is required");
            Objects.requireNonNull(employeeName, "Employee name is required");
            Objects.requireNonNull(bankCode, "Bank code is required");
            Objects.requireNonNull(iban, "IBAN is required");
            Objects.requireNonNull(amount, "Amount is required");
            return new WpsRecord(this);
        }
    }
}
