package com.simplevat.dao;
import com.simplevat.entity.DesignationTransactionCategory;

import java.util.List;


public interface DesignationTransactionCategoryDao extends Dao<Integer, DesignationTransactionCategory>{
    public List<DesignationTransactionCategory> getListByDesignationId(Integer designationId);
}
