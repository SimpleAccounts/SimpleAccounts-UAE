package com.simpleaccounts.service;

import com.simpleaccounts.entity.DesignationTransactionCategory;
import java.util.List;

public abstract class DesignationTransactionCategoryService extends SimpleAccountsService<Integer, DesignationTransactionCategory> {
    public abstract List<DesignationTransactionCategory> getListByDesignationId(Integer designationId);
}
