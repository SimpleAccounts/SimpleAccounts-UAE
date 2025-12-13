package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CoacTransactionCategoryDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class CoacTransactionCategoryServiceImpl extends CoacTransactionCategoryService {

    private final CoacTransactionCategoryDao dao;

    @Override
    protected Dao<Integer, CoacTransactionCategory> getDao() {
        return dao;
    }
    public  void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory){
        dao.addCoacTransactionCategory(chartOfAccountCategory,transactionCategory);
    }

}
