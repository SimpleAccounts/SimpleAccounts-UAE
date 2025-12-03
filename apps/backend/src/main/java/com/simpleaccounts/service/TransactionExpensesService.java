package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;

public abstract class TransactionExpensesService extends SimpleAccountsService<Integer, TransactionExpenses> {

	public abstract List<Expense> getMappedExpenses();

	public abstract List<TransactionExpenses> findAllForTransactionExpenses(Integer transactionId);

}
