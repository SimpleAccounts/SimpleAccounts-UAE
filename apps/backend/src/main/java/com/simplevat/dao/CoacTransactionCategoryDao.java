package com.simplevat.dao;

import com.simplevat.entity.CoacTransactionCategory;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;

public interface CoacTransactionCategoryDao extends Dao<Integer, CoacTransactionCategory> {

    public void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory);

}


