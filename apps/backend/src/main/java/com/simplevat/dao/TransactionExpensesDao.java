package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.Expense;
import com.simplevat.entity.TransactionExpenses;

public interface TransactionExpensesDao extends Dao<Integer, TransactionExpenses> {
	public List<TransactionExpenses> getMappedExpenses(Integer transactionId);
}
