package com.simplevat.service;

import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */

public abstract class EmployeeTransactioncategoryService  extends SimpleVatService<Integer, EmployeeTransactionCategoryRelation> {
    public abstract void addEmployeeTransactionCategory(Employee employee, TransactionCategory transactionCategory);
}
