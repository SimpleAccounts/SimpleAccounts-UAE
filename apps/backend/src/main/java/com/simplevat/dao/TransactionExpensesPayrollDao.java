package com.simplevat.dao;

import com.simplevat.entity.TransactionExpenses;

import java.util.List;
        import java.util.List;
        import com.simplevat.entity.Expense;
import com.simplevat.entity.TransactionExpensesPayroll;

public interface TransactionExpensesPayrollDao extends Dao<Integer, TransactionExpensesPayroll> {
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId);
}
