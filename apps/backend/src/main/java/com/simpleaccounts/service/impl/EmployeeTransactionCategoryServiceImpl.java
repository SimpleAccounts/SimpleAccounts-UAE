package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.EmployeeTransactioncategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Created By Zain Khan
 */
@Service("employeeTransactionCategoryService")
@RequiredArgsConstructor
public class EmployeeTransactionCategoryServiceImpl extends EmployeeTransactioncategoryService {
    private final EmployeeTransactionCategoryDao employeeTransactionCategoryDao;

    @Override
    protected Dao<Integer, EmployeeTransactionCategoryRelation> getDao() {
        return employeeTransactionCategoryDao;
    }

    @Override
    public void addEmployeeTransactionCategory(Employee employee, TransactionCategory transactionCategory) {
        EmployeeTransactionCategoryRelation relation = new EmployeeTransactionCategoryRelation();
        relation.setEmployee(employee);
        relation.setTransactionCategory(transactionCategory);
        persist(relation);
    }
}
