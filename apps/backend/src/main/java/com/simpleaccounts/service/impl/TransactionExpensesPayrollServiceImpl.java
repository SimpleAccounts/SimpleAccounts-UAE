package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.*;
import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.service.TransactionExpensesPayrollService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionExpensesPayrollServiceImpl extends TransactionExpensesPayrollService {

    private final TransactionExpensesPayrollDao transactionExpensesdao;

    @Override
    protected Dao<Integer, TransactionExpensesPayroll> getDao() {
        return transactionExpensesdao;
    }

    @Override
    public List<Expense> getMappedExpenses() {
        List<TransactionExpensesPayroll> list = transactionExpensesdao.dumpData();
        if (list != null && !list.isEmpty()) {
            List<Expense> expenseList = new ArrayList<>();
            for (TransactionExpensesPayroll trExpense : list) {
                expenseList.add(trExpense.getExpense());
            }
            return expenseList;
        }
        return null;
    }

    @Override
    public List<TransactionExpensesPayroll> findAllForTransactionExpenses(Integer transactionId) {
        return transactionExpensesdao.getMappedExpenses(transactionId);
    }

}
