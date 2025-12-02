package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmployeeTransactionCategoryDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.EmployeeTransactioncategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created By Zain Khan
 */
@Service("employeeTransactionCategoryService")
public class EmployeeTransactionCategoryServiceImpl extends EmployeeTransactioncategoryService {
    @Autowired
    private EmployeeTransactionCategoryDao employeeTransactionCategoryDao;

    @Override
    protected Dao<Integer, EmployeeTransactionCategoryRelation> getDao() {
        return employeeTransactionCategoryDao;
    }
    public  void addEmployeeTransactionCategory(Employee employee, TransactionCategory transactionCategory){

    }
}
