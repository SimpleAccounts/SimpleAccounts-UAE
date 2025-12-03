package com.simpleaccounts.service;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */

public abstract class EmployeeTransactioncategoryService  extends SimpleAccountsService<Integer, EmployeeTransactionCategoryRelation> {
    public abstract void addEmployeeTransactionCategory(Employee employee, TransactionCategory transactionCategory);
}
