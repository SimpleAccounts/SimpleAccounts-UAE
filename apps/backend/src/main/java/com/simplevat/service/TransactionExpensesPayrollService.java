package com.simplevat.service;

import com.simplevat.entity.*;

import java.util.List;


        import java.util.List;

        import com.simplevat.entity.Expense;
        import com.simplevat.entity.TransactionExpenses;

public abstract class TransactionExpensesPayrollService extends SimpleVatService<Integer, TransactionExpensesPayroll> {

    public abstract List<Expense> getMappedExpenses();

    public abstract List<TransactionExpensesPayroll> findAllForTransactionExpenses(Integer transactionId);

}
