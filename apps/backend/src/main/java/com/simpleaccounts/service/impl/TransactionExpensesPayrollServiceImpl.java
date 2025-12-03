package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.service.TransactionExpensesPayrollService;
import com.simpleaccounts.service.TransactionExpensesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

        import java.util.ArrayList;
        import java.util.List;

        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.stereotype.Service;

        import com.simpleaccounts.dao.Dao;
        import com.simpleaccounts.dao.TransactionExpensesDao;
        import com.simpleaccounts.entity.Expense;
        import com.simpleaccounts.entity.TransactionExpenses;
        import com.simpleaccounts.service.TransactionExpensesService;

@Service
public class TransactionExpensesPayrollServiceImpl extends TransactionExpensesPayrollService {

    @Autowired
    private TransactionExpensesPayrollDao transactionExpensesdao;

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
