package com.simpleaccounts.dao;

import com.simpleaccounts.entity.TransactionExpenses;
import java.util.List;

public interface TransactionExpensesDao extends Dao<Integer, TransactionExpenses> {
	public List<TransactionExpenses> getMappedExpenses(Integer transactionId);
}
