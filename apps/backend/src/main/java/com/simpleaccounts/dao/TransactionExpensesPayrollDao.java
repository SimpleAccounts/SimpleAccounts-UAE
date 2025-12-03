package com.simpleaccounts.dao;

import com.simpleaccounts.entity.TransactionExpenses;

import java.util.List;
        import java.util.List;
        import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpensesPayroll;

public interface TransactionExpensesPayrollDao extends Dao<Integer, TransactionExpensesPayroll> {
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId);
}
