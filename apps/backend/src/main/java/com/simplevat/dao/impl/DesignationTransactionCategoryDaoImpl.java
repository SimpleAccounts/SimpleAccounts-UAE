package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.DesignationTransactionCategoryDao;
import com.simplevat.entity.DesignationTransactionCategory;
import com.simplevat.entity.Inventory;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.List;

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
