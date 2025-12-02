package com.simplevat.service.impl;

import com.simplevat.dao.CoacTransactionCategoryDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.CoacTransactionCategory;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.CoacTransactionCategoryService;
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
