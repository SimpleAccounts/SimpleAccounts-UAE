package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;

public interface TransactionExpensesDao extends Dao<Integer, TransactionExpenses> {
	public List<TransactionExpenses> getMappedExpenses(Integer transactionId);
}
