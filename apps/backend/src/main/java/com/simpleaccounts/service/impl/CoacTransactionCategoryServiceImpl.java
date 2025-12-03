package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CoacTransactionCategoryDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@Transactional
public class CoacTransactionCategoryServiceImpl extends CoacTransactionCategoryService {

    @Autowired
    private CoacTransactionCategoryDao dao;

    @Override
    protected Dao<Integer, CoacTransactionCategory> getDao() {
        return dao;
    }
    public  void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory){
        dao.addCoacTransactionCategory(chartOfAccountCategory,transactionCategory);
    }

}
