package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.DesignationTransactionCategoryDao;
import com.simpleaccounts.entity.DesignationTransactionCategory;
import com.simpleaccounts.service.DesignationTransactionCategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("DesignationTransactionCategoryService")
@RequiredArgsConstructor
public class DesignationTransactionCategoryServiceImpl extends DesignationTransactionCategoryService {
    private final DesignationTransactionCategoryDao designationTransactionCategoryDao;

    @Override
    protected Dao<Integer, DesignationTransactionCategory> getDao() {
        return designationTransactionCategoryDao;
    }

    public  List<DesignationTransactionCategory> getListByDesignationId(Integer designationId){
        return designationTransactionCategoryDao.getListByDesignationId(designationId);
    }
}
