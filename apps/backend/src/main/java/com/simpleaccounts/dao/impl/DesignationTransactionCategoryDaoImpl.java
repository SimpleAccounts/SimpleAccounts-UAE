package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.DesignationTransactionCategoryDao;
import com.simpleaccounts.entity.DesignationTransactionCategory;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository("designationTransactionCategoryDao")
public class DesignationTransactionCategoryDaoImpl extends AbstractDao<Integer, DesignationTransactionCategory> implements DesignationTransactionCategoryDao {
public List<DesignationTransactionCategory> getListByDesignationId(Integer designationId){
    TypedQuery<DesignationTransactionCategory> query = getEntityManager().createNamedQuery(
            "getListByDesignationId", DesignationTransactionCategory.class);
    query.setParameter("designationId", designationId);
    List<DesignationTransactionCategory> designationTransactionCategories = query.getResultList();
    return designationTransactionCategories;
}
}
