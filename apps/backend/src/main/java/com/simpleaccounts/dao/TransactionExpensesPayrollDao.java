package com.simpleaccounts.dao;

import java.util.List;
        import java.util.List;
        import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import java.util.List;

public interface TransactionExpensesPayrollDao extends Dao<Integer, TransactionExpensesPayroll> {
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId);
}
