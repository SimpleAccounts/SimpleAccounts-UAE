package com.simplevat.service.impl;

import com.simplevat.dao.*;
import com.simplevat.entity.*;
import com.simplevat.service.TransactionExpensesPayrollService;
import com.simplevat.service.TransactionExpensesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

        import java.util.ArrayList;
        import java.util.List;

        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.stereotype.Service;

        import com.simplevat.dao.Dao;
        import com.simplevat.dao.TransactionExpensesDao;
        import com.simplevat.entity.Expense;
        import com.simplevat.entity.TransactionExpenses;
        import com.simplevat.service.TransactionExpensesService;

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
