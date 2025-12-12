package com.simpleaccounts.service;

import com.simpleaccounts.entity.*;

import java.util.List;

        import java.util.List;

        import com.simpleaccounts.entity.Expense;
        import com.simpleaccounts.entity.TransactionExpenses;

public abstract class TransactionExpensesPayrollService extends SimpleAccountsService<Integer, TransactionExpensesPayroll> {

    public abstract List<Expense> getMappedExpenses();

    public abstract List<TransactionExpensesPayroll> findAllForTransactionExpenses(Integer transactionId);

}
