package com.simpleaccounts.dao;

import com.simpleaccounts.entity.TransactionExpensesPayroll;
import java.util.List;

public interface TransactionExpensesPayrollDao extends Dao<Integer, TransactionExpensesPayroll> {
    public List<TransactionExpensesPayroll> getMappedExpenses(Integer transactionId);
}
