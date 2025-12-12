package com.simpleaccounts.dao;

import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

public interface CoacTransactionCategoryDao extends Dao<Integer, CoacTransactionCategory> {

    public void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory);

}

