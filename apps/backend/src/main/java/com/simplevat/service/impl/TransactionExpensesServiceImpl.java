package com.simplevat.service.impl;

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
public class TransactionExpensesServiceImpl extends TransactionExpensesService {

	@Autowired
	private TransactionExpensesDao transactionExpensesdao;

	@Override
	protected Dao<Integer, TransactionExpenses> getDao() {
		return transactionExpensesdao;
	}

	@Override
	public List<Expense> getMappedExpenses() {
		List<TransactionExpenses> list = transactionExpensesdao.dumpData();
		if (list != null && !list.isEmpty()) {
			List<Expense> expenseList = new ArrayList<>();
			for (TransactionExpenses trExpense : list) {
				expenseList.add(trExpense.getExpense());
			}
			return expenseList;
		}
		return null;
	}

	@Override
	public List<TransactionExpenses> findAllForTransactionExpenses(Integer transactionId) {
		return transactionExpensesdao.getMappedExpenses(transactionId);
	}

}
