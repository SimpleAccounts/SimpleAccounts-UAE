package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.DesignationTransactionCategoryDao;
import com.simplevat.entity.DesignationTransactionCategory;
import com.simplevat.service.DesignationTransactionCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("DesignationTransactionCategoryService")
public class DesignationTransactionCategoryServiceImpl extends DesignationTransactionCategoryService {
    @Autowired
    private DesignationTransactionCategoryDao designationTransactionCategoryDao;

    @Override
    protected Dao<Integer, DesignationTransactionCategory> getDao() {
        return designationTransactionCategoryDao;
    }

    public  List<DesignationTransactionCategory> getListByDesignationId(Integer designationId){
        return designationTransactionCategoryDao.getListByDesignationId(designationId);
    }
}
