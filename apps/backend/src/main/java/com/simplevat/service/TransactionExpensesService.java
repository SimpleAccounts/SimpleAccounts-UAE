package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.Expense;
import com.simplevat.entity.TransactionExpenses;

public abstract class TransactionExpensesService extends SimpleVatService<Integer, TransactionExpenses> {

	public abstract List<Expense> getMappedExpenses();

	public abstract List<TransactionExpenses> findAllForTransactionExpenses(Integer transactionId);

}
