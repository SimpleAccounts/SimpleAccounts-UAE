package com.simpleaccounts.service;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;
import java.util.List;

public abstract class TransactionExpensesService extends SimpleAccountsService<Integer, TransactionExpenses> {

	public abstract List<Expense> getMappedExpenses();

	public abstract List<TransactionExpenses> findAllForTransactionExpenses(Integer transactionId);

}
