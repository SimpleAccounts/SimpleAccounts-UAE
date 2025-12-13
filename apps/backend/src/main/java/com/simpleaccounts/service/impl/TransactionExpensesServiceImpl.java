package com.simpleaccounts.service.impl;

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionExpensesDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;
import com.simpleaccounts.service.TransactionExpensesService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionExpensesServiceImpl extends TransactionExpensesService {

	private final TransactionExpensesDao transactionExpensesdao;

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
