package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CoacTransactionCategoryDao;
import com.simpleaccounts.entity.CoaCoaCategory;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class CoacTransactionCategoryDaoImpl extends AbstractDao<Integer, CoacTransactionCategory>  implements CoacTransactionCategoryDao  {

    @Autowired
    ChartOfAccountCategoryService chartOfAccountCategoryService;

    @Autowired
    TransactionCategoryService transactionCategoryService;

    public void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory){

        String query =  "SELECT MAX(id) FROM CoacTransactionCategory";

        TypedQuery<Integer> typedQuery = getEntityManager().createQuery(query, Integer.class);

        Integer id = typedQuery.getSingleResult();

        String coaquery =  "SELECT c.chartOfAccountCategory.chartOfAccountCategoryId  FROM CoaCoaCategory c  WHERE c.chartOfAccount = :chartOfAccount";

        TypedQuery<Integer> typedCoaQuery = getEntityManager().createQuery(coaquery, Integer.class);

        typedCoaQuery.setParameter("chartOfAccount",transactionCategory.getChartOfAccount());

        List<Integer> coaCategoryList = typedCoaQuery.getResultList();

        if (coaCategoryList!=null && !coaCategoryList.isEmpty()){

            for ( Integer coaCategoryId : coaCategoryList ){
                id = id+1;
                CoacTransactionCategory coacTransactionCategory = new CoacTransactionCategory();
                coacTransactionCategory.setChartOfAccountCategory(chartOfAccountCategoryService.findByPK(coaCategoryId));
                coacTransactionCategory.setTransactionCategory(transactionCategory);
                persist(coacTransactionCategory);

            }
        }
    }
}
