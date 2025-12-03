package com.simpleaccounts.dao;
import com.simpleaccounts.entity.DesignationTransactionCategory;

import java.util.List;


public interface DesignationTransactionCategoryDao extends Dao<Integer, DesignationTransactionCategory>{
    public List<DesignationTransactionCategory> getListByDesignationId(Integer designationId);
}
