package com.simpleaccounts.entity;

public class ExpenseBuilder {
    private Expense expense;

    public ExpenseBuilder() {
        this.expense = new Expense();
    }

    public ExpenseBuilder expenseDate(java.time.LocalDate expenseDate) {
        expense.setExpenseDate(expenseDate);
        return this;
    }

    public ExpenseBuilder expenseAmount(java.math.BigDecimal expenseAmount) {
        expense.setExpenseAmount(expenseAmount);
        return this;
    }

    public ExpenseBuilder expenseNumber(String expenseNumber) {
        expense.setExpenseNumber(expenseNumber);
        return this;
    }

    public ExpenseBuilder expenseDescription(String expenseDescription) {
        expense.setExpenseDescription(expenseDescription);
        return this;
    }

    public ExpenseBuilder status(Integer status) {
        expense.setStatus(status);
        return this;
    }

    public Expense build() {
        return expense;
    }
    
    public static ExpenseBuilder builder() {
        return new ExpenseBuilder();
    }
}
