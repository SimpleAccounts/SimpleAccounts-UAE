package com.simplevat.service;


import com.simplevat.entity.DesignationTransactionCategory;

import java.util.List;


public abstract class DesignationTransactionCategoryService extends SimpleVatService<Integer, DesignationTransactionCategory> {
    public abstract List<DesignationTransactionCategory> getListByDesignationId(Integer designationId);
}
