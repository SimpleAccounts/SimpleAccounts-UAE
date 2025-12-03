package com.simpleaccounts.service;

import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

public abstract class CoacTransactionCategoryService extends SimpleAccountsService<Integer , CoacTransactionCategory> {

    public abstract void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategoryId, TransactionCategory transactionCategoryId);
}
