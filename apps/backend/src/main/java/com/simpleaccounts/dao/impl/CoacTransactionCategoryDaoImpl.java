package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CoacTransactionCategoryDao;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import java.util.List;
import jakarta.persistence.TypedQuery;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;

@Repository
public class CoacTransactionCategoryDaoImpl extends AbstractDao<Integer, CoacTransactionCategory>  implements CoacTransactionCategoryDao  {

    private final ChartOfAccountCategoryService chartOfAccountCategoryService;

    private final TransactionCategoryService transactionCategoryService;

    public CoacTransactionCategoryDaoImpl(
            ChartOfAccountCategoryService chartOfAccountCategoryService,
            @Lazy TransactionCategoryService transactionCategoryService) {
        this.chartOfAccountCategoryService = chartOfAccountCategoryService;
        this.transactionCategoryService = transactionCategoryService;
    }

    public void addCoacTransactionCategory(ChartOfAccount chartOfAccountCategory, TransactionCategory transactionCategory){

        String query =  "SELECT MAX(id) FROM CoacTransactionCategory";

        TypedQuery<Integer> typedQuery = getEntityManager().createQuery(query, Integer.class);

        Integer id = null;
        try {
            id = typedQuery.getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            // No existing records, start from 0
            id = 0;
        }
        if (id == null) {
            id = 0;
        }

        String coaquery =  "SELECT c.chartOfAccountCategory.chartOfAccountCategoryId  FROM CoaCoaCategory c  WHERE c.chartOfAccount = :chartOfAccount";

        TypedQuery<Integer> typedCoaQuery = getEntityManager().createQuery(coaquery, Integer.class);

        typedCoaQuery.setParameter("chartOfAccount",transactionCategory.getChartOfAccount());

        List<Integer> coaCategoryList = typedCoaQuery.getResultList();

        if (coaCategoryList!=null && !coaCategoryList.isEmpty()){

            for ( Integer coaCategoryId : coaCategoryList ){
                id = id+1;
                var chartOfAccountCategoryEntity = chartOfAccountCategoryService.findByPK(coaCategoryId);
                if (chartOfAccountCategoryEntity != null) {
                    CoacTransactionCategory coacTransactionCategory = new CoacTransactionCategory();
                    coacTransactionCategory.setChartOfAccountCategory(chartOfAccountCategoryEntity);
                    coacTransactionCategory.setTransactionCategory(transactionCategory);
                    persist(coacTransactionCategory);
                }
            }
        }
    }
}
