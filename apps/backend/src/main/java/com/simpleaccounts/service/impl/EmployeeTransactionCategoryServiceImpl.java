package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.EmployeeTransactioncategoryService;
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
    // Empty method - implementation not required for this service
    public  void addEmployeeTransactionCategory(Employee employee, TransactionCategory transactionCategory){

    }
}
