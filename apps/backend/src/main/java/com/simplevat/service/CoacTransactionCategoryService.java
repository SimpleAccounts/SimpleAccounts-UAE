package com.simplevat.service;

import com.simplevat.entity.CoacTransactionCategory;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;

public abstract class CoacTransactionCategoryService extends SimpleVatService<Integer , CoacTransactionCategory> {

    public abstract void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategoryId, TransactionCategory transactionCategoryId);
}
